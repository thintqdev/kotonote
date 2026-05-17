import 'dotenv/config';
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
import { notificationQueue } from './src/utils/queue.js';
import * as notificationService from './src/services/notificationService.js';
import { ensureAvatarsUploadDir } from './src/middlewares/avatarUpload.js';
import { ensureBadgesUploadDir } from './src/middlewares/badgeUpload.js';
import { ensureNotebookUploadDir } from './src/middlewares/notebookImageUpload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Validate environment
validateEnv();

// Connect to database
await connectDB();

const app = express();
const httpServer = createServer(app);

// Security & Performance Middlewares
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' },
		contentSecurityPolicy: {
			directives: {
				...helmet.contentSecurityPolicy.getDefaultDirectives(),
				'script-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
				'style-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
				'img-src': ["'self'", 'data:', 'cdn.jsdelivr.net'],
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

ensureAvatarsUploadDir();
ensureBadgesUploadDir();
ensureNotebookUploadDir();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
		message: 'Route not found'
	});
});

app.use(errorHandler);

// ============ SOCKET.IO INITIALIZATION ============

const io = initializeSocket(httpServer);
setIo(io);
startNotificationCampaignScheduler();

// Start notification queue processing
notificationQueue.startProcessing(async (notification) => {
	const createdNotification = await notificationService.createNotification(notification);

	// Send to user via Socket.IO
	const { sendNotificationToUser } = await import('./src/config/socket.js');
	sendNotificationToUser(io, notification.userId, createdNotification);
});

// Cleanup expired notifications every hour
setInterval(async () => {
	try {
		await notificationService.cleanupExpiredNotifications();
		console.log('[Cleanup] Expired notifications cleaned up');
	} catch (error) {
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
