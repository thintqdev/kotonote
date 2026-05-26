import { PayOS } from '@payos/node';
import { isPayosConfigured } from './payment.js';

/** @type {PayOS | null} */
let payosInstance = null;

/**
 * @returns {PayOS}
 */
export function getPayosClient() {
	if (!isPayosConfigured()) {
		throw new Error('PayOS credentials are not configured');
	}
	if (!payosInstance) {
		payosInstance = new PayOS({
			clientId: process.env.PAYOS_CLIENT_ID,
			apiKey: process.env.PAYOS_API_KEY,
			checksumKey: process.env.PAYOS_CHECKSUM_KEY,
			logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
		});
	}
	return payosInstance;
}

export function resetPayosClientForTests() {
	payosInstance = null;
}
