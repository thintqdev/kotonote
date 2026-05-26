/**
 * Đăng ký URL webhook PayOS với tài khoản merchant.
 *
 * Chạy sau khi deploy hoặc khi đổi API_PUBLIC_URL:
 *   npm run payos:confirm-webhook
 *
 * Yêu cầu: PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY trong .env
 */
import 'dotenv/config';
import {
	getApiPublicOrigin,
	getPayosWebhookUrl,
	isPayosConfigured,
} from '../config/payment.js';
import { confirmPayosWebhookUrl } from '../services/payment/payosPaymentService.js';

function isLocalOnlyUrl(url) {
	try {
		const host = new URL(url).hostname;
		return host === 'localhost' || host === '127.0.0.1';
	} catch {
		return false;
	}
}

async function main() {
	if (!isPayosConfigured()) {
		console.error(
			'[payos] Thiếu PAYOS_CLIENT_ID, PAYOS_API_KEY hoặc PAYOS_CHECKSUM_KEY trong backend/.env',
		);
		process.exit(1);
	}

	const webhookUrl = getPayosWebhookUrl();
	const origin = getApiPublicOrigin();

	console.log('[payos] API_PUBLIC_URL (origin):', origin);
	console.log('[payos] Webhook sẽ đăng ký:', webhookUrl);

	if (isLocalOnlyUrl(webhookUrl) && process.env.FORCE_PAYOS_LOCAL_WEBHOOK !== 'true') {
		console.warn(
			'[payos] Cảnh báo: PayOS không gọi được webhook tới localhost.',
		);
		console.warn(
			'  → Dùng ngrok/cloudflare tunnel, set API_PUBLIC_URL=https://xxx.ngrok-free.app',
		);
		console.warn(
			'  → Hoặc FORCE_PAYOS_LOCAL_WEBHOOK=true nếu vẫn muốn đăng ký (chỉ để test API).',
		);
		process.exit(1);
	}

	const confirmed = await confirmPayosWebhookUrl();
	console.log('[payos] Đăng ký webhook thành công:', confirmed);
	console.log(
		'[payos] Kiểm tra trên https://my.payos.vn → Kênh thanh toán → Webhook.',
	);
}

main().catch((err) => {
	console.error('[payos] Lỗi đăng ký webhook:', err?.message || err);
	process.exit(1);
});
