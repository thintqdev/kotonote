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
 * @param {string} tierId
 * @param {'yearly'|'lifetime'} billing
 */
export async function createCheckout(userId, tierId, billing) {
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

	const sessionExpiresAt = new Date(Date.now() + CHECKOUT_TTL_MS);

	await MembershipCheckout.updateMany(
		{ userId, status: 'pending' },
		{ $set: { status: 'expired' } },
	);

	const provider = getPaymentProvider();
	if (provider === 'payos' && !isPayosConfigured()) {
		throw new AppError(MEMBERSHIP.PAYMENT_NOT_CONFIGURED, 503);
	}

	const checkout = await MembershipCheckout.create({
		userId,
		tierId,
		billing,
		amountVnd,
		sessionExpiresAt,
		provider,
	});

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
		})),
		pagination: {
			page,
			limit,
			total,
			pages: Math.ceil(total / limit) || 1,
		},
	};
}
