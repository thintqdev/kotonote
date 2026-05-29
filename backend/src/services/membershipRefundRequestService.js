import MembershipCheckout from '../models/MembershipCheckout.js';
import AppError from '../utils/AppError.js';
import { MEMBERSHIP } from '../constants/messages.js';

/**
 * User yêu cầu hoàn tiền — admin mới được ghi nhận hoàn sau đó.
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {string} checkoutId
 * @param {{ note?: string }} options
 */
export async function requestRefundByUser(userId, checkoutId, options = {}) {
	const checkout = await MembershipCheckout.findById(checkoutId);
	if (!checkout) {
		throw new AppError(MEMBERSHIP.CHECKOUT_NOT_FOUND, 404);
	}
	if (String(checkout.userId) !== String(userId)) {
		throw new AppError(MEMBERSHIP.CHECKOUT_NOT_FOUND, 404);
	}
	if (checkout.status === 'refunded') {
		throw new AppError(MEMBERSHIP.CHECKOUT_ALREADY_REFUNDED, 400);
	}
	if (checkout.status !== 'paid') {
		throw new AppError(MEMBERSHIP.CHECKOUT_INVALID, 400);
	}
	if (checkout.refundRequestedAt) {
		throw new AppError(MEMBERSHIP.REFUND_ALREADY_REQUESTED, 400);
	}

	const note = String(options.note ?? '').trim() || null;
	checkout.refundRequestedAt = new Date();
	checkout.refundRequestNote = note;
	await checkout.save();

	return {
		checkoutId: String(checkout._id),
		refundRequestedAt: checkout.refundRequestedAt,
		refundRequestNote: checkout.refundRequestNote,
	};
}
