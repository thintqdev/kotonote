import { getStorageDriver } from '../config/storage.js';
import {
	isPayosConfigured,
	isPayosPaymentProvider,
} from '../config/payment.js';

/**
 * Validate required environment variables on startup
 */
const validateEnv = () => {
	const requiredEnvs = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];

	const missing = requiredEnvs.filter((env) => !process.env[env]);

	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}

	if (process.env.NODE_ENV === 'production') {
		if (!isPayosPaymentProvider()) {
			throw new Error(
				'PAYMENT_PROVIDER must be "payos" in production (mock payments are disabled)',
			);
		}
		if (!isPayosConfigured()) {
			throw new Error(
				'PayOS credentials (PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY) are required in production',
			);
		}
	}

	if (getStorageDriver() === 'minio') {
		const minioRequired = [
			'MINIO_ENDPOINT',
			'MINIO_PUBLIC_URL',
			'MINIO_ACCESS_KEY',
			'MINIO_SECRET_KEY',
			'MINIO_BUCKET',
		];
		const minioMissing = minioRequired.filter((env) => !process.env[env]);
		if (minioMissing.length > 0) {
			throw new Error(
				`Missing MinIO environment variables: ${minioMissing.join(', ')}`,
			);
		}
	}
};

export default validateEnv;
