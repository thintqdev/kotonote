import fs from 'fs/promises';
import path from 'path';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getStorageConfig, isMinioStorage } from '../config/storage.js';

/** @type {S3Client | null} */
let s3Client = null;

function getS3Client() {
	if (!s3Client) {
		const { minio } = getStorageConfig();
		s3Client = new S3Client({
			endpoint: minio.endpoint,
			region: minio.region,
			credentials: {
				accessKeyId: minio.accessKey,
				secretAccessKey: minio.secretKey,
			},
			forcePathStyle: true,
		});
	}
	return s3Client;
}

/**
 * @param {string} objectKey — ví dụ `avatars/user-123.jpg`
 */
export function buildPublicUrl(objectKey) {
	const key = String(objectKey || '').replace(/^\/+/, '');
	const cfg = getStorageConfig();
	if (isMinioStorage()) {
		return `${cfg.minio.publicUrl}/${key}`;
	}
	return `${cfg.local.publicPrefix}/${key}`;
}

/**
 * Trích object key từ URL/path đã lưu trong DB.
 * @param {string | null | undefined} urlOrPath
 * @returns {string | null}
 */
export function parseObjectKey(urlOrPath) {
	if (!urlOrPath || typeof urlOrPath !== 'string') return null;
	const t = urlOrPath.trim();
	if (!t) return null;

	const cfg = getStorageConfig();

	if (t.startsWith('http://') || t.startsWith('https://')) {
		const base = cfg.minio.publicUrl;
		if (base && t.startsWith(`${base}/`)) {
			return t.slice(base.length + 1);
		}
		try {
			const u = new URL(t);
			const parts = u.pathname.split('/').filter(Boolean);
			const bucket = cfg.minio.bucket;
			const idx = parts.indexOf(bucket);
			if (idx >= 0 && parts[idx + 1]) {
				return parts.slice(idx + 1).join('/');
			}
		} catch {
			return null;
		}
		return null;
	}

	if (t.startsWith(`${cfg.local.publicPrefix}/`)) {
		return t.slice(cfg.local.publicPrefix.length + 1);
	}

	return null;
}

/**
 * @param {{ folder: string, filename: string, buffer: Buffer, contentType?: string }} params
 */
export async function uploadBuffer({ folder, filename, buffer, contentType }) {
	const safeFolder = String(folder || '')
		.replace(/\\/g, '/')
		.replace(/^\/+|\/+$/g, '');
	const safeName = path.basename(String(filename || ''));
	if (!safeFolder || !safeName || safeName.includes('..')) {
		throw new Error('Invalid upload path');
	}

	const objectKey = `${safeFolder}/${safeName}`;
	const cfg = getStorageConfig();

	if (isMinioStorage()) {
		await getS3Client().send(
			new PutObjectCommand({
				Bucket: cfg.minio.bucket,
				Key: objectKey,
				Body: buffer,
				ContentType: contentType || 'application/octet-stream',
			}),
		);
	} else {
		const dir = path.join(cfg.local.root, safeFolder);
		await fs.mkdir(dir, { recursive: true });
		await fs.writeFile(path.join(dir, safeName), buffer);
	}

	return {
		objectKey,
		publicUrl: buildPublicUrl(objectKey),
	};
}

/**
 * Xóa object theo URL/path cũ (local hoặc MinIO).
 * @param {string | null | undefined} urlOrPath
 */
export async function deleteByUrl(urlOrPath) {
	const objectKey = parseObjectKey(urlOrPath);
	if (!objectKey) return;

	const cfg = getStorageConfig();

	if (isMinioStorage()) {
		try {
			await getS3Client().send(
				new DeleteObjectCommand({
					Bucket: cfg.minio.bucket,
					Key: objectKey,
				}),
			);
		} catch {
			/* object có thể đã xóa */
		}
		return;
	}

	const fullPath = path.join(cfg.local.root, objectKey);
	try {
		await fs.unlink(fullPath);
	} catch {
		/* file không tồn tại */
	}
}
