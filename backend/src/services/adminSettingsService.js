import {
	getApiPublicOrigin,
	getClientOrigin,
	getPayosWebhookUrl,
	getPaymentProvider,
	isPayosConfigured,
} from '../config/payment.js';
import { getStorageDriver } from '../config/storage.js';

/**
 * Cấu hình studio (không lộ secret) — admin only.
 */
export async function getStudioSettings() {
	const paymentProvider = getPaymentProvider();
	const payosConfigured = isPayosConfigured();

	return {
		app: {
			nodeEnv: process.env.NODE_ENV || 'development',
			clientUrl: getClientOrigin(),
			apiPublicUrl: getApiPublicOrigin(),
		},
		payment: {
			provider: paymentProvider,
			payosConfigured,
			webhookUrl: payosConfigured ? getPayosWebhookUrl() : null,
			mockConfirmEnabled: paymentProvider === 'mock',
		},
		ai: {
			geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
			model: process.env.GEMINI_MODEL || null,
		},
		storage: {
			driver: getStorageDriver(),
		},
		membership: {
			expiryJobIntervalHours: 1,
		},
	};
}
