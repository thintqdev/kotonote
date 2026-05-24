import { getStorageDriver } from '../config/storage.js';

/**
 * Validate required environment variables on startup
 */
const validateEnv = () => {
	const requiredEnvs = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];

	const missing = requiredEnvs.filter((env) => !process.env[env]);

	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
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
