import User from '../models/User.js';
import MembershipCheckout from '../models/MembershipCheckout.js';
import AppError from '../utils/AppError.js';
import { MEMBERSHIP } from '../constants/messages.js';
import {
	CHECKOUT_TTL_MS,
	MEMBERSHIP_BILLING,
	MEMBERSHIP_TIER_RANK,
	PAID_TIER_IDS,
	computeMembershipExpiry,
	getPlanPriceVnd,
	jlptUnlockedForTier,
	membershipPlansPayload,
} from '../constants/membership.js';

/**
 * @param {object | null | undefined} raw
 */
export function normalizeUserMembership(raw) {
	const m = raw && typeof raw === 'object' ? raw : {};
	const tierId = PAID_TIER_IDS.includes(m.tierId) ? m.tierId : 'free';
	const billing =
		m.billing === MEMBERSHIP_BILLING.YEARLY ||
		m.billing === MEMBERSHIP_BILLING.LIFETIME
			? m.billing
			: MEMBERSHIP_BILLING.FREE;

	let status = m.status === 'expired' ? 'expired' : 'active';
	if (
		status === 'active' &&
		billing === MEMBERSHIP_BILLING.YEARLY &&
		m.expiresAt &&
		new Date(m.expiresAt) < new Date()
	) {
		status = 'expired';
	}

	const effectiveTierId =
		status === 'expired' && tierId !== 'free' ? 'free' : tierId;
	const effectiveBilling =
		status === 'expired' && tierId !== 'free'
			? MEMBERSHIP_BILLING.FREE
			: billing;

	return {
		tierId: effectiveTierId,
		billing: effectiveBilling,
		status,
		jlptUnlocked: jlptUnlockedForTier(effectiveTierId),
		purchasedAt: m.purchasedAt ?? null,
		expiresAt: m.expiresAt ?? null,
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

	const checkout = await MembershipCheckout.create({
		userId,
		tierId,
		billing,
		amountVnd,
		sessionExpiresAt,
	});

	return {
		checkoutId: String(checkout._id),
		tierId,
		billing,
		amountVnd,
		currency: 'VND',
		status: checkout.status,
		sessionExpiresAt: checkout.sessionExpiresAt,
	};
}

/**
 * Giả lập thanh toán thành công.
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {string} checkoutId
 */
export async function confirmCheckoutPayment(userId, checkoutId) {
	const checkout = await MembershipCheckout.findOne({
		_id: checkoutId,
		userId,
	});

	if (!checkout) {
		throw new AppError(MEMBERSHIP.CHECKOUT_NOT_FOUND, 404);
	}

	if (checkout.status === 'paid') {
		throw new AppError(MEMBERSHIP.CHECKOUT_ALREADY_PAID, 400);
	}

	if (checkout.status !== 'pending') {
		throw new AppError(MEMBERSHIP.CHECKOUT_INVALID, 400);
	}

	if (checkout.sessionExpiresAt < new Date()) {
		checkout.status = 'expired';
		await checkout.save();
		throw new AppError(MEMBERSHIP.CHECKOUT_EXPIRED, 400);
	}

	const paidAt = new Date();
	const expiresAt = computeMembershipExpiry(checkout.billing, paidAt);

	checkout.status = 'paid';
	checkout.paidAt = paidAt;
	await checkout.save();

	const user = await User.findById(userId);
	if (!user) {
		throw new AppError(MEMBERSHIP.USER_NOT_FOUND, 404);
	}

	user.membership = {
		tierId: checkout.tierId,
		billing: checkout.billing,
		status: 'active',
		jlptUnlocked: jlptUnlockedForTier(checkout.tierId),
		purchasedAt: paidAt,
		expiresAt,
	};
	user.markModified('membership');
	await user.save();

	return {
		checkout: {
			checkoutId: String(checkout._id),
			tierId: checkout.tierId,
			billing: checkout.billing,
			amountVnd: checkout.amountVnd,
			paidAt,
		},
		membership: normalizeUserMembership(user.membership),
	};
}
