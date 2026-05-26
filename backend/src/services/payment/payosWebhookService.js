import MembershipCheckout from '../../models/MembershipCheckout.js';
import AppError from '../../utils/AppError.js';
import { MEMBERSHIP } from '../../constants/messages.js';
import {
	assertCheckoutAmount,
	fulfillPaidCheckout,
} from './fulfillCheckout.js';
import { verifyPayosWebhookPayload } from './payosPaymentService.js';

/**
 * Xử lý webhook PayOS — chỉ sau khi verify chữ ký.
 * @param {unknown} rawBody
 */
export async function processPayosPaymentWebhook(rawBody) {
	const data = await verifyPayosWebhookPayload(rawBody);

	const orderCode = Number(data.orderCode);
	if (!Number.isFinite(orderCode) || orderCode <= 0) {
		throw new AppError(MEMBERSHIP.PAYMENT_WEBHOOK_INVALID, 400);
	}

	const amount = Number(data.amount);
	if (!Number.isFinite(amount) || amount <= 0) {
		throw new AppError(MEMBERSHIP.PAYMENT_WEBHOOK_INVALID, 400);
	}

	const checkout = await MembershipCheckout.findOne({
		provider: 'payos',
		providerOrderCode: orderCode,
	});

	if (!checkout) {
		throw new AppError(MEMBERSHIP.CHECKOUT_NOT_FOUND, 404);
	}

	assertCheckoutAmount(checkout, amount);

	const providerTransactionId =
		(data.paymentLinkId && String(data.paymentLinkId)) ||
		(data.reference && String(data.reference)) ||
		null;

	let paidAt = new Date();
	if (data.transactionDateTime) {
		const parsed = new Date(String(data.transactionDateTime));
		if (!Number.isNaN(parsed.getTime())) paidAt = parsed;
	}

	return fulfillPaidCheckout(checkout, {
		paidAt,
		providerTransactionId,
	});
}
