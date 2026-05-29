import User from '../models/User.js';
import MembershipCheckout from '../models/MembershipCheckout.js';
import AppError from '../utils/AppError.js';
import { MEMBERSHIP } from '../constants/messages.js';
import {
	getPaymentProvider,
	isMockConfirmEndpointAllowed,
	isPayosConfigured,
	isPayosPaymentProvider,
} from '../config/payment.js';
import {
	CHECKOUT_TTL_MS,
	MEMBERSHIP_TIER_RANK,
	PAID_TIER_IDS,
	getPlanPriceVnd,
	membershipPlansPayload,
} from '../constants/membership.js';
import { normalizeUserMembership } from '../utils/membershipNormalize.js';
import { fulfillPaidCheckout } from './payment/fulfillCheckout.js';
import { createPayosPaymentLinkForCheckout } from './payment/payosPaymentService.js';

export { normalizeUserMembership } from '../utils/membershipNormalize.js';

/** Hàng đợi create checkout theo user — tránh race 2 request song song. */
const checkoutCreateChains = new Map();

/**
 * Mutex theo user — chờ tuần tự, tránh 2 request cùng lúc đều thấy map trống.
 * @param {string} userKey
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 * @template T
 */
async function withCheckoutCreateLock(userKey, fn) {
	while (checkoutCreateChains.has(userKey)) {
		await checkoutCreateChains.get(userKey);
	}

	let releaseLock = () => {};
	const held = new Promise((resolve) => {
		releaseLock = resolve;
	});
	checkoutCreateChains.set(userKey, held);

	try {
		return await fn();
	} finally {
		releaseLock();
		checkoutCreateChains.delete(userKey);
	}
}

/**
 * @param {import('mongoose').Document | Record<string, unknown>} checkout
 */
export function serializeCheckout(checkout) {
	const id = String(checkout._id);
	return {
		checkoutId: id,
		id,
		tierId: checkout.tierId,
		billing: checkout.billing,
		amountVnd: checkout.amountVnd,
		currency: checkout.currency ?? 'VND',
		status: checkout.status,
		provider: checkout.provider ?? 'mock',
		paymentUrl: checkout.paymentUrl ?? null,
		providerOrderCode: checkout.providerOrderCode ?? null,
		sessionExpiresAt: checkout.sessionExpiresAt,
		paidAt: checkout.paidAt ?? null,
		refundRequestedAt: checkout.refundRequestedAt ?? null,
		refundRequestNote: checkout.refundRequestNote ?? null,
		createdAt: checkout.createdAt,
	};
}

/**
 * @param {import('mongoose').Types.ObjectId} userId
 */
export async function getMembershipPlans() {
	return membershipPlansPayload();
}

/**
 * @param {import('mongoose').Types.ObjectId} userId
 */
export async function getUserMembership(userId) {
	const user = await User.findById(userId).select('membership').lean();
	if (!user) {
		throw new AppError(MEMBERSHIP.USER_NOT_FOUND, 404);
	}
	return normalizeUserMembership(user.membership);
}

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {Date} now
 * @param {string} tierId
 * @param {string} billing
 * @param {number} amountVnd
 * @param {string} provider
 */
async function findReusablePendingCheckout(
	userId,
	now,
	tierId,
	billing,
	amountVnd,
	provider,
) {
	const pendingSamePlan = await MembershipCheckout.find({
		userId,
		tierId,
		billing,
		status: 'pending',
		amountVnd,
		provider,
		sessionExpiresAt: { $gt: now },
	})
		.sort({ createdAt: -1 })
		.limit(5);

	if (pendingSamePlan.length === 0) return null;

	const [keep, ...duplicates] = pendingSamePlan;
	if (duplicates.length > 0) {
		await MembershipCheckout.updateMany(
			{ _id: { $in: duplicates.map((d) => d._id) } },
			{ $set: { status: 'expired' } },
		);
	}
	return keep;
}

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {string} tierId
 * @param {'yearly'|'lifetime'} billing
 */
export async function createCheckout(userId, tierId, billing) {
	return withCheckoutCreateLock(String(userId), () =>
		createCheckoutLocked(userId, tierId, billing),
	);
}

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {string} tierId
 * @param {'yearly'|'lifetime'} billing
 */
async function createCheckoutLocked(userId, tierId, billing) {
	if (!PAID_TIER_IDS.includes(tierId)) {
		throw new AppError(MEMBERSHIP.INVALID_PLAN, 400);
	}
	if (billing !== 'yearly' && billing !== 'lifetime') {
		throw new AppError(MEMBERSHIP.INVALID_BILLING, 400);
	}

	const amountVnd = getPlanPriceVnd(tierId, billing);
	if (!amountVnd || amountVnd <= 0) {
		throw new AppError(MEMBERSHIP.INVALID_PLAN, 400);
	}

	const user = await User.findById(userId).select('membership').lean();
	if (!user) {
		throw new AppError(MEMBERSHIP.USER_NOT_FOUND, 404);
	}

	const current = normalizeUserMembership(user.membership);
	const newRank = MEMBERSHIP_TIER_RANK[tierId] ?? 0;
	const curRank = MEMBERSHIP_TIER_RANK[current.tierId] ?? 0;

	if (newRank < curRank) {
		throw new AppError(MEMBERSHIP.DOWNGRADE_NOT_ALLOWED, 400);
	}

	const now = new Date();
	const sessionExpiresAt = new Date(Date.now() + CHECKOUT_TTL_MS);
	const provider = getPaymentProvider();
	if (provider === 'payos' && !isPayosConfigured()) {
		throw new AppError(MEMBERSHIP.PAYMENT_NOT_CONFIGURED, 503);
	}

	const reusablePending = await findReusablePendingCheckout(
		userId,
		now,
		tierId,
		billing,
		amountVnd,
		provider,
	);

	if (reusablePending) {
		await MembershipCheckout.updateMany(
			{
				userId,
				status: 'pending',
				_id: { $ne: reusablePending._id },
			},
			{ $set: { status: 'expired' } },
		);
		if (provider === 'payos' && !reusablePending.paymentUrl) {
			try {
				const payos = await createPayosPaymentLinkForCheckout(reusablePending);
				reusablePending.providerOrderCode = payos.orderCode;
				reusablePending.paymentUrl = payos.paymentUrl;
				reusablePending.providerPaymentLinkId = payos.paymentLinkId;
				await reusablePending.save();
			} catch (err) {
				reusablePending.status = 'cancelled';
				await reusablePending.save();
				throw err;
			}
		}
		return serializeCheckout(reusablePending);
	}

	await MembershipCheckout.updateMany(
		{ userId, status: 'pending' },
		{ $set: { status: 'expired' } },
	);

	let checkout;
	try {
		checkout = await MembershipCheckout.create({
			userId,
			tierId,
			billing,
			amountVnd,
			sessionExpiresAt,
			provider,
		});
	} catch (err) {
		if (err?.code === 11000) {
			const existing = await findReusablePendingCheckout(
				userId,
				now,
				tierId,
				billing,
				amountVnd,
				provider,
			);
			if (existing) return serializeCheckout(existing);
		}
		throw err;
	}

	if (provider === 'payos') {
		try {
			const payos = await createPayosPaymentLinkForCheckout(checkout);
			checkout.providerOrderCode = payos.orderCode;
			checkout.paymentUrl = payos.paymentUrl;
			checkout.providerPaymentLinkId = payos.paymentLinkId;
			await checkout.save();
		} catch (err) {
			checkout.status = 'cancelled';
			await checkout.save();
			throw err;
		}
	}

	return serializeCheckout(checkout);
}

/**
 * Giả lập thanh toán thành công.
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {string} checkoutId
 */
export async function confirmCheckoutPayment(userId, checkoutId) {
	if (!isMockConfirmEndpointAllowed()) {
		throw new AppError(MEMBERSHIP.MOCK_PAYMENT_DISABLED, 403);
	}

	const checkout = await MembershipCheckout.findOne({
		_id: checkoutId,
		userId,
	});

	if (!checkout) {
		throw new AppError(MEMBERSHIP.CHECKOUT_NOT_FOUND, 404);
	}

	if (checkout.provider === 'payos' || isPayosPaymentProvider()) {
		throw new AppError(MEMBERSHIP.MOCK_PAYMENT_DISABLED, 403);
	}

	const result = await fulfillPaidCheckout(checkout, { paidAt: new Date() });

	return {
		checkout: {
			checkoutId: String(result.checkout._id),
			tierId: result.checkout.tierId,
			billing: result.checkout.billing,
			amountVnd: result.checkout.amountVnd,
			paidAt: result.checkout.paidAt,
		},
		membership: result.membership,
		alreadyPaid: result.alreadyPaid,
	};
}

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {string} checkoutId
 */
export async function getCheckoutStatusForUser(userId, checkoutId) {
	const checkout = await MembershipCheckout.findOne({
		_id: checkoutId,
		userId,
	});

	if (!checkout) {
		throw new AppError(MEMBERSHIP.CHECKOUT_NOT_FOUND, 404);
	}

	if (
		checkout.status === 'pending' &&
		checkout.sessionExpiresAt < new Date()
	) {
		checkout.status = 'expired';
		await checkout.save();
	}

	let membership = null;
	if (checkout.status === 'paid') {
		const user = await User.findById(userId).select('membership').lean();
		membership = normalizeUserMembership(user?.membership);
	}

	return {
		checkout: serializeCheckout(checkout),
		membership,
	};
}

/**
 * Lịch sử phiên thanh toán của user.
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {{ page?: number|string, limit?: number|string, status?: string }} filters
 */
export async function listUserCheckoutHistory(userId, filters = {}) {
	const page = Math.max(1, parseInt(String(filters.page || '1'), 10) || 1);
	const limit = Math.min(
		50,
		Math.max(1, parseInt(String(filters.limit || '20'), 10) || 20),
	);
	const skip = (page - 1) * limit;

	const query = { userId };
	const allowedStatus = [
		'pending',
		'paid',
		'cancelled',
		'expired',
		'refunded',
	];
	if (filters.status && allowedStatus.includes(filters.status)) {
		query.status = filters.status;
	}

	const [rows, total] = await Promise.all([
		MembershipCheckout.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		MembershipCheckout.countDocuments(query),
	]);

	return {
		checkouts: rows.map((c) => ({
			...serializeCheckout(c),
			updatedAt: c.updatedAt,
			providerTransactionId: c.providerTransactionId ?? null,
			refundedAt: c.refundedAt ?? null,
			refundReason: c.refundReason ?? null,
			refundRequestedAt: c.refundRequestedAt ?? null,
			refundRequestNote: c.refundRequestNote ?? null,
		})),
		pagination: {
			page,
			limit,
			total,
			pages: Math.ceil(total / limit) || 1,
		},
	};
}
