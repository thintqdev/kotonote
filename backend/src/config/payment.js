/** Cấu hình thanh toán — PayOS (VN) hoặc mock (dev). */

export const PAYMENT_PROVIDERS = ['mock', 'payos'];

/**
 * @returns {'mock' | 'payos'}
 */
export function getPaymentProvider() {
	const raw = String(process.env.PAYMENT_PROVIDER || 'mock')
		.trim()
		.toLowerCase();
	if (raw === 'payos') return 'payos';
	return 'mock';
}

export function isMockPaymentProvider() {
	return getPaymentProvider() === 'mock';
}

export function isPayosPaymentProvider() {
	return getPaymentProvider() === 'payos';
}

/**
 * Chỉ cho phép POST /checkout/:id/confirm khi mock (tránh bypass production).
 */
export function isMockConfirmEndpointAllowed() {
	return isMockPaymentProvider();
}

/**
 * @returns {boolean}
 */
export function isPayosConfigured() {
	return Boolean(
		process.env.PAYOS_CLIENT_ID &&
			process.env.PAYOS_API_KEY &&
			process.env.PAYOS_CHECKSUM_KEY,
	);
}

/**
 * URL API công khai (webhook PayOS). Ưu tiên API_PUBLIC_URL, fallback CLIENT_URL + port.
 */
export function getApiPublicOrigin() {
	const explicit = process.env.API_PUBLIC_URL?.trim();
	if (explicit) return explicit.replace(/\/$/, '');

	const client = process.env.CLIENT_URL?.trim()?.replace(/\/$/, '');
	if (client) {
		const port = process.env.PORT || '5000';
		try {
			const u = new URL(client);
			if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
				return `http://localhost:${port}`;
			}
		} catch {
			/* ignore */
		}
	}

	return `http://localhost:${process.env.PORT || '5000'}`;
}

export function getClientOrigin() {
	return (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
}

/**
 * @param {string} checkoutId
 */
export function buildMembershipReturnUrls(checkoutId) {
	const client = getClientOrigin();
	const id = encodeURIComponent(checkoutId);
	const base = `${client}/membership/checkout/return?checkoutId=${id}`;
	return {
		returnUrl: `${base}&result=return`,
		cancelUrl: `${base}&result=cancel`,
	};
}

export function getPayosWebhookUrl() {
	return `${getApiPublicOrigin()}/api/membership/webhooks/payos`;
}
