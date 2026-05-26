import MembershipCheckout from '../../models/MembershipCheckout.js';
import { getPayosClient } from '../../config/payosClient.js';
import {
	buildMembershipReturnUrls,
	getPayosWebhookUrl,
} from '../../config/payment.js';

const PAYOS_DESCRIPTION_MAX = 25;

/**
 * Mã đơn hàng số duy nhất cho PayOS (map 1-1 với MembershipCheckout).
 */
export async function allocatePayosOrderCode() {
	for (let attempt = 0; attempt < 8; attempt += 1) {
		const suffix = Math.floor(Math.random() * 1000);
		const orderCode = Number(`${Date.now()}${String(suffix).padStart(3, '0')}`);
		// eslint-disable-next-line no-await-in-loop
		const exists = await MembershipCheckout.exists({
			providerOrderCode: orderCode,
		});
		if (!exists) return orderCode;
	}
	throw new Error('Could not allocate unique PayOS order code');
}

/**
 * @param {string} tierId
 * @param {string} billing
 */
function buildPayosDescription(tierId, billing) {
	const text = `KTN ${tierId} ${billing}`;
	return text.length <= PAYOS_DESCRIPTION_MAX
		? text
		: text.slice(0, PAYOS_DESCRIPTION_MAX);
}

/**
 * @param {import('../../models/MembershipCheckout.js').default} checkout
 */
export async function createPayosPaymentLinkForCheckout(checkout) {
	const payos = getPayosClient();
	const orderCode = await allocatePayosOrderCode();
	const checkoutId = String(checkout._id);
	const { returnUrl, cancelUrl } = buildMembershipReturnUrls(checkoutId);

	const paymentLink = await payos.paymentRequests.create({
		orderCode,
		amount: checkout.amountVnd,
		description: buildPayosDescription(checkout.tierId, checkout.billing),
		returnUrl,
		cancelUrl,
	});

	return {
		orderCode,
		paymentUrl: paymentLink.checkoutUrl,
		paymentLinkId: paymentLink.paymentLinkId ?? null,
	};
}

/**
 * Xác minh chữ ký webhook — chỉ tin payload sau bước này.
 * @param {unknown} body
 * @returns {Promise<Record<string, unknown>>}
 */
export async function verifyPayosWebhookPayload(body) {
	const payos = getPayosClient();
	const verified = await payos.webhooks.verify(body);
	if (verified && typeof verified === 'object' && 'orderCode' in verified) {
		return /** @type {Record<string, unknown>} */ (verified);
	}
	if (
		verified &&
		typeof verified === 'object' &&
		'data' in verified &&
		verified.data &&
		typeof verified.data === 'object'
	) {
		return /** @type {Record<string, unknown>} */ (verified.data);
	}
	throw new Error('PayOS webhook verification returned invalid shape');
}

/**
 * Đăng ký URL webhook với PayOS (gọi thủ công hoặc lúc khởi động nếu bật).
 */
export async function confirmPayosWebhookUrl() {
	const payos = getPayosClient();
	const url = getPayosWebhookUrl();
	await payos.webhooks.confirm(url);
	return url;
}
