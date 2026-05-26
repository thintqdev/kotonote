import MembershipCheckout from '../models/MembershipCheckout.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { MEMBERSHIP } from '../constants/messages.js';
import {
	MEMBERSHIP_BILLING,
	jlptUnlockedForTier,
} from '../constants/membership.js';

/**
 * Hoàn tiền thủ công (admin) — không gọi API PayOS; ghi nhận DB + thu hồi gói nếu cần.
 * @param {string} checkoutId
 * @param {import('mongoose').Types.ObjectId} adminUserId
 * @param {{ reason?: string, revokeMembership?: boolean }} options
 */
export async function refundCheckoutByAdmin(
	checkoutId,
	adminUserId,
	options = {},
) {
	const checkout = await MembershipCheckout.findById(checkoutId);
	if (!checkout) {
		throw new AppError(MEMBERSHIP.CHECKOUT_NOT_FOUND, 404);
	}
	if (checkout.status === 'refunded') {
		throw new AppError(MEMBERSHIP.CHECKOUT_ALREADY_REFUNDED, 400);
	}
	if (checkout.status !== 'paid') {
		throw new AppError(MEMBERSHIP.CHECKOUT_INVALID, 400);
	}

	const revokeMembership = options.revokeMembership !== false;
	const reason = String(options.reason ?? '').trim() || null;

	checkout.status = 'refunded';
	checkout.refundedAt = new Date();
	checkout.refundReason = reason;
	checkout.refundedByAdminId = adminUserId;
	await checkout.save();

	let membershipRevoked = false;
	if (revokeMembership) {
		const user = await User.findById(checkout.userId);
		if (user?.membership) {
			const m = user.membership;
			const sameTier = m.tierId === checkout.tierId;
			const sameBilling =
				m.billing === checkout.billing ||
				(m.billing === MEMBERSHIP_BILLING.YEARLY &&
					checkout.billing === 'yearly') ||
				(m.billing === MEMBERSHIP_BILLING.LIFETIME &&
					checkout.billing === 'lifetime');
			if (m.status === 'active' && sameTier && sameBilling) {
				user.membership = {
					tierId: 'free',
					billing: MEMBERSHIP_BILLING.FREE,
					status: 'active',
					jlptUnlocked: jlptUnlockedForTier('free'),
					purchasedAt: null,
					expiresAt: null,
				};
				user.markModified('membership');
				await user.save();
				membershipRevoked = true;
			}
		}
	}

	return {
		checkout: {
			checkoutId: String(checkout._id),
			status: checkout.status,
			refundedAt: checkout.refundedAt,
			refundReason: checkout.refundReason,
		},
		membershipRevoked,
	};
}
