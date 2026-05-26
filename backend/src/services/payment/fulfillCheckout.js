import MembershipCheckout from '../../models/MembershipCheckout.js';
import User from '../../models/User.js';
import AppError from '../../utils/AppError.js';
import { MEMBERSHIP } from '../../constants/messages.js';
import {
	computeMembershipExpiry,
	jlptUnlockedForTier,
} from '../../constants/membership.js';
import { normalizeUserMembership } from '../../utils/membershipNormalize.js';

/**
 * Kích hoạt gói sau thanh toán — idempotent, chỉ từ pending → paid.
 * @param {import('mongoose').Document} checkoutDoc
 * @param {{ paidAt?: Date, providerTransactionId?: string|null }} meta
 */
export async function fulfillPaidCheckout(checkoutDoc, meta = {}) {
	if (checkoutDoc.status === 'paid') {
		const user = await User.findById(checkoutDoc.userId);
		return {
			alreadyPaid: true,
			checkout: checkoutDoc,
			membership: normalizeUserMembership(user?.membership),
		};
	}

	if (checkoutDoc.status !== 'pending') {
		throw new AppError(MEMBERSHIP.CHECKOUT_INVALID, 400);
	}

	if (checkoutDoc.sessionExpiresAt < new Date()) {
		checkoutDoc.status = 'expired';
		await checkoutDoc.save();
		throw new AppError(MEMBERSHIP.CHECKOUT_EXPIRED, 400);
	}

	const paidAt = meta.paidAt ?? new Date();
	const providerTransactionId =
		meta.providerTransactionId ?? checkoutDoc.providerTransactionId ?? null;

	const updated = await MembershipCheckout.findOneAndUpdate(
		{ _id: checkoutDoc._id, status: 'pending' },
		{
			$set: {
				status: 'paid',
				paidAt,
				providerTransactionId,
				webhookProcessedAt: new Date(),
			},
		},
		{ new: true },
	);

	if (!updated) {
		const current = await MembershipCheckout.findById(checkoutDoc._id);
		if (current?.status === 'paid') {
			const user = await User.findById(current.userId);
			return {
				alreadyPaid: true,
				checkout: current,
				membership: normalizeUserMembership(user?.membership),
			};
		}
		throw new AppError(MEMBERSHIP.CHECKOUT_INVALID, 400);
	}

	const expiresAt = computeMembershipExpiry(updated.billing, paidAt);
	const user = await User.findById(updated.userId);
	if (!user) {
		throw new AppError(MEMBERSHIP.USER_NOT_FOUND, 404);
	}

	user.membership = {
		tierId: updated.tierId,
		billing: updated.billing,
		status: 'active',
		jlptUnlocked: jlptUnlockedForTier(updated.tierId),
		purchasedAt: paidAt,
		expiresAt,
	};
	user.markModified('membership');
	await user.save();

	return {
		alreadyPaid: false,
		checkout: updated,
		membership: normalizeUserMembership(user.membership),
	};
}

/**
 * @param {import('mongoose').Document} checkout
 * @param {number} amountVnd
 */
export function assertCheckoutAmount(checkout, amountVnd) {
	if (Number(checkout.amountVnd) !== Number(amountVnd)) {
		throw new AppError(MEMBERSHIP.PAYMENT_AMOUNT_MISMATCH, 400);
	}
}
