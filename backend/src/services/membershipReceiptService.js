import MembershipCheckout from '../models/MembershipCheckout.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { MEMBERSHIP } from '../constants/messages.js';
/**
 * @param {number} amountVnd
 */
function formatAmountVnd(amountVnd) {
	const n = Number(amountVnd) || 0;
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
		maximumFractionDigits: 0,
	}).format(n);
}

/**
 * @param {import('mongoose').Types.ObjectId | string} checkoutId
 */
function buildInvoiceNumber(checkoutId) {
	const tail = String(checkoutId).slice(-8).toUpperCase();
	return `KTN-${tail}`;
}

/**
 * @param {object} checkout
 * @param {object|null} user
 */
function serializeReceipt(checkout, user) {
	const checkoutId = String(checkout._id);
	const paidAt = checkout.paidAt ?? checkout.updatedAt;
	return {
		invoiceNumber: buildInvoiceNumber(checkoutId),
		checkoutId,
		status: checkout.status,
		tierId: checkout.tierId,
		billing: checkout.billing,
		amountVnd: checkout.amountVnd,
		amountFormatted: formatAmountVnd(checkout.amountVnd),
		currency: checkout.currency ?? 'VND',
		provider: checkout.provider ?? 'mock',
		providerOrderCode: checkout.providerOrderCode ?? null,
		providerTransactionId: checkout.providerTransactionId ?? null,
		paidAt,
		refundedAt: checkout.refundedAt ?? null,
		refundReason: checkout.refundReason ?? null,
		buyer: user
			? {
					name: user.name ?? '',
					email: user.email ?? '',
				}
			: null,
		issuedAt: paidAt,
	};
}

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {string} checkoutId
 */
export async function getCheckoutReceiptForUser(userId, checkoutId) {
	const checkout = await MembershipCheckout.findOne({
		_id: checkoutId,
		userId,
		status: { $in: ['paid', 'refunded'] },
	});

	if (!checkout) {
		throw new AppError(MEMBERSHIP.RECEIPT_NOT_AVAILABLE, 404);
	}

	const user = await User.findById(userId).select('name email').lean();
	return { receipt: serializeReceipt(checkout, user) };
}

/**
 * @param {string} checkoutId
 */
export async function getCheckoutReceiptForAdmin(checkoutId) {
	const checkout = await MembershipCheckout.findById(checkoutId).populate(
		'userId',
		'name email',
	);

	if (!checkout || !['paid', 'refunded'].includes(checkout.status)) {
		throw new AppError(MEMBERSHIP.RECEIPT_NOT_AVAILABLE, 404);
	}

	const user = checkout.userId && typeof checkout.userId === 'object'
		? checkout.userId
		: null;

	return { receipt: serializeReceipt(checkout, user) };
}
