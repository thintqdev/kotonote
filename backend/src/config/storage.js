import path from 'path';

/** @typedef {'minio' | 'local'} StorageDriver */

/** @returns {StorageDriver} */
export function getStorageDriver() {
	const v = String(process.env.STORAGE_DRIVER || 'minio').trim().toLowerCase();
	return v === 'local' ? 'local' : 'minio';
}

export function isMinioStorage() {
	return getStorageDriver() === 'minio';
}

export function getStorageConfig() {
	const driver = getStorageDriver();
	const bucket = process.env.MINIO_BUCKET || 'kotonote-uploads';
	const publicUrl = String(process.env.MINIO_PUBLIC_URL || '').replace(/\/$/, '');

	return {
		driver,
		local: {
			root: path.join(process.cwd(), 'uploads'),
			publicPrefix: '/uploads',
		},
		minio: {
			endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
			region: process.env.MINIO_REGION || 'us-east-1',
			bucket,
			accessKey: process.env.MINIO_ACCESS_KEY || '',
			secretKey: process.env.MINIO_SECRET_KEY || '',
			publicUrl: publicUrl || `http://localhost:9000/${bucket}`,
		},
	};
}

/** Hostname cho helmet img-src (MinIO public) */
export function getMinioPublicOrigin() {
	try {
		const { publicUrl } = getStorageConfig().minio;
		return new URL(publicUrl).origin;
	} catch {
		return null;
	}
}
