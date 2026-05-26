import 'dotenv/config';
import './src/config/serverMetrics.js';
import mongoose from 'mongoose';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'http';
import { apiReference } from '@scalar/express-api-reference';
import connectDB from './src/config/database.js';
import validateEnv from './src/utils/validateEnv.js';
import errorHandler from './src/middlewares/errorHandler.js';
import authRoutes from './src/routes/authRoutes.js';
import publicRoutes from './src/routes/public/index.js';
import adminRoutes from './src/routes/admin/index.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import { openApiSpec } from './src/config/openapi/index.js';
import { initializeSocket } from './src/config/socket.js';
import { setIo } from './src/config/ioRegistry.js';
import { startNotificationCampaignScheduler } from './src/jobs/notificationCampaignScheduler.js';
import { startStudyReminderScheduler } from './src/jobs/studyReminderScheduler.js';
import { startEmailDigestScheduler } from './src/jobs/emailDigestScheduler.js';
import { startMembershipExpiryScheduler } from './src/jobs/membershipExpiryScheduler.js';
import { notificationQueue } from './src/utils/queue.js';
import * as notificationService from './src/services/notificationService.js';
import { getMinioPublicOrigin, getStorageConfig, isMinioStorage } from './src/config/storage.js';
import {
	getPayosWebhookUrl,
	isPayosConfigured,
	isPayosPaymentProvider,
} from './src/config/payment.js';
import { confirmPayosWebhookUrl } from './src/services/payment/payosPaymentService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Validate environment
validateEnv();

// Connect to database
await connectDB();

if (
	process.env.PAYOS_AUTO_CONFIRM_WEBHOOK === 'true' &&
	isPayosPaymentProvider() &&
	isPayosConfigured()
) {
	try {
		await confirmPayosWebhookUrl();
		console.log(`[payos] Webhook auto-confirmed: ${getPayosWebhookUrl()}`);
	} catch (err) {
		console.warn(
			'[payos] PAYOS_AUTO_CONFIRM_WEBHOOK failed:',
			err?.message || err,
		);
	}
}

const app = express();
const httpServer = createServer(app);

const minioImgOrigin = getMinioPublicOrigin();
const helmetImgSrc = ["'self'", 'data:', 'cdn.jsdelivr.net'];
if (minioImgOrigin) {
	helmetImgSrc.push(minioImgOrigin);
}

// Security & Performance Middlewares
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' },
		contentSecurityPolicy: {
			directives: {
				...helmet.contentSecurityPolicy.getDefaultDirectives(),
				'script-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
				'style-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
				'img-src': helmetImgSrc,
			},
		},
	})
);
app.use(cors({
	origin: process.env.CLIENT_URL,
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const storageCfg = getStorageConfig();
if (isMinioStorage()) {
	console.log(`Object storage: MinIO → ${storageCfg.minio.publicUrl}`);
} else {
	app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
	console.log('Object storage: local → /uploads');
}

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Server is running',
		timestamp: new Date().toISOString()
	});
});

// API Documentation
app.use(
	'/api/docs',
	apiReference({
		spec: {
			content: openApiSpec,
		},
		theme: 'purple',
	})
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: 'Route not found',
		path: req.originalUrl,
		method: req.method,
	});
});

app.use(errorHandler);

// ============ SOCKET.IO INITIALIZATION ============

const io = initializeSocket(httpServer);
setIo(io);
startNotificationCampaignScheduler();
startStudyReminderScheduler();
startEmailDigestScheduler();
startMembershipExpiryScheduler();

// Start notification queue processing
notificationQueue.startProcessing(async (notification) => {
	const createdNotification = await notificationService.createNotification(notification);

	// Send to user via Socket.IO
	const { sendNotificationToUser } = await import('./src/config/socket.js');
	sendNotificationToUser(io, notification.userId, createdNotification);
});

// Cleanup expired notifications every hour (bỏ qua khi MongoDB chưa kết nối)
setInterval(async () => {
	if (mongoose.connection.readyState !== 1) {
		console.warn('[Cleanup] Skipped — MongoDB not connected');
		return;
	}
	try {
		const result = await notificationService.cleanupExpiredNotifications();
		const deleted = result?.deletedCount ?? 0;
		console.log(`[Cleanup] Expired notifications cleaned up (${deleted} removed)`);
	} catch (error) {
		const msg = error?.message || String(error);
		const isPoolTimeout =
			msg.includes('PoolClearedOnNetworkError') ||
			msg.includes('server monitor timeout');
		if (isPoolTimeout) {
			console.warn(
				'[Cleanup] MongoDB unreachable (sleep/stopped?) — will retry next hour',
			);
			return;
		}
		console.error('[Cleanup] Error cleaning up notifications:', error);
	}
}, 60 * 60 * 1000); // 1 hour

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV}`);
	console.log(`API Docs: http://localhost:${PORT}/api/docs`);
	console.log(`WebSocket: ws://localhost:${PORT}`);
});

export default app;
