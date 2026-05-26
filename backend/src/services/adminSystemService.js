import fs from 'fs/promises';
import mongoose from 'mongoose';
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { getStorageConfig, isMinioStorage } from '../config/storage.js';
import { SERVER_STARTED_AT } from '../config/serverMetrics.js';
import { notificationQueue } from '../utils/queue.js';
import User from '../models/User.js';
import Survey from '../models/Survey.js';
import Feedback from '../models/Feedback.js';
import MembershipCheckout from '../models/MembershipCheckout.js';

const MONGO_STATE_LABEL = {
	0: 'disconnected',
	1: 'connected',
	2: 'connecting',
	3: 'disconnecting',
};

async function measureMongo() {
	const state = mongoose.connection.readyState;
	const base = {
		state,
		stateLabel: MONGO_STATE_LABEL[state] ?? 'unknown',
		host: mongoose.connection.host || null,
		name: mongoose.connection.name || null,
	};

	if (state !== 1) {
		return { ...base, status: 'error', latencyMs: null };
	}

	const started = Date.now();
	try {
		if (!mongoose.connection.db) {
			throw new Error('No database handle');
		}
		await mongoose.connection.db.admin().command({ ping: 1 });
		return {
			...base,
			status: 'ok',
			latencyMs: Date.now() - started,
		};
	} catch {
		return {
			...base,
			status: 'error',
			latencyMs: Date.now() - started,
		};
	}
}

async function measureMinio() {
	const cfg = getStorageConfig().minio;
	const started = Date.now();
	const client = new S3Client({
		endpoint: cfg.endpoint,
		region: cfg.region,
		credentials: {
			accessKeyId: cfg.accessKey,
			secretAccessKey: cfg.secretKey,
		},
		forcePathStyle: true,
	});

	try {
		await client.send(new HeadBucketCommand({ Bucket: cfg.bucket }));
		client.destroy();
		return {
			status: 'ok',
			driver: 'minio',
			endpoint: cfg.endpoint,
			bucket: cfg.bucket,
			publicUrl: cfg.publicUrl,
			latencyMs: Date.now() - started,
		};
	} catch (err) {
		client.destroy();
		return {
			status: 'error',
			driver: 'minio',
			endpoint: cfg.endpoint,
			bucket: cfg.bucket,
			publicUrl: cfg.publicUrl,
			latencyMs: Date.now() - started,
			error: err?.message || 'MinIO unreachable',
		};
	}
}

async function measureLocalStorage() {
	const { root, publicPrefix } = getStorageConfig().local;
	try {
		await fs.access(root);
		return {
			status: 'ok',
			driver: 'local',
			root,
			publicPrefix,
		};
	} catch (err) {
		return {
			status: 'error',
			driver: 'local',
			root,
			publicPrefix,
			error: err?.message || 'Upload directory missing',
		};
	}
}

async function measureStorage() {
	if (isMinioStorage()) {
		return measureMinio();
	}
	return measureLocalStorage();
}

async function measureCollections() {
	const [users, surveys, feedbacks, checkouts] = await Promise.all([
		User.estimatedDocumentCount(),
		Survey.estimatedDocumentCount(),
		Feedback.estimatedDocumentCount(),
		MembershipCheckout.estimatedDocumentCount(),
	]);
	return { users, surveys, feedbacks, checkouts };
}

function deriveOverallStatus(mongodb, storage) {
	if (mongodb.status === 'error') return 'unhealthy';
	if (storage.status === 'error') return 'degraded';
	return 'healthy';
}

export async function getAdminSystemHealth() {
	const checkedAt = new Date().toISOString();
	const uptimeSeconds = Math.floor((Date.now() - SERVER_STARTED_AT) / 1000);
	const mem = process.memoryUsage();

	const [mongodb, storage, collections] = await Promise.all([
		measureMongo(),
		measureStorage(),
		measureCollections(),
	]);

	const status = deriveOverallStatus(mongodb, storage);

	return {
		status,
		checkedAt,
		uptimeSeconds,
		runtime: {
			nodeVersion: process.version,
			env: process.env.NODE_ENV || 'development',
			platform: process.platform,
			memory: {
				rss: mem.rss,
				heapUsed: mem.heapUsed,
				heapTotal: mem.heapTotal,
				external: mem.external,
			},
			notificationQueuePending: notificationQueue.size(),
		},
		services: {
			api: { status: 'ok' },
			mongodb,
			storage,
		},
		collections,
	};
}
