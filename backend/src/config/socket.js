import { Server } from 'socket.io';
import { findUserForSocketAuth } from '../repositories/userRepository.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Initialize Socket.IO with authentication and middleware
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocket = (httpServer) => {
	const io = new Server(httpServer, {
		cors: {
			origin: process.env.CLIENT_URL,
			credentials: true,
			methods: ['GET', 'POST'],
		},
		transports: ['websocket', 'polling'],
		pingInterval: 25000,
		pingTimeout: 60000,
		maxHttpBufferSize: 1e6, // 1MB
	});

	// ============ MIDDLEWARE ============

	/**
	 * Authentication middleware
	 * Verify JWT token from handshake
	 */
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth.token;

			if (!token) {
				return next(new Error('Authentication error: No token provided'));
			}

			// Verify JWT token (payload giống REST: { userId } — xem utils/jwt.js)
			const decoded = verifyToken(token);
			if (!decoded) {
				return next(new Error('Authentication error: Invalid token'));
			}
			const userIdFromToken = decoded.userId ?? decoded.id;
			if (!userIdFromToken) {
				return next(new Error('Authentication error: Invalid token payload'));
			}
			const user = await findUserForSocketAuth(userIdFromToken);

			if (!user) {
				return next(new Error('Authentication error: User not found'));
			}

			if (!user.isActive) {
				return next(new Error('Authentication error: Account inactive'));
			}

			// Attach user to socket
			socket.userId = user._id.toString();
			socket.userRole = user.role;
			socket.userName = user.name;

			next();
		} catch (error) {
			next(new Error(`Authentication error: ${error.message}`));
		}
	});

	/**
	 * Connection event
	 */
	io.on('connection', (socket) => {
		console.log(`[Socket] User connected: ${socket.userId} (${socket.userName})`);

		// Join user's personal room
		socket.join(`user:${socket.userId}`);

		// Join admin room if user is admin
		if (socket.userRole === 'admin') {
			socket.join('admin');
			console.log(`[Socket] Admin connected: ${socket.userId}`);
		}

		// ============ NOTIFICATION EVENTS ============

		/**
		 * Get unread notification count
		 */
		socket.on('notification:get-unread-count', async (callback) => {
			try {
				const Notification = (await import('../models/Notification.js')).default;
				const count = await Notification.getUnreadCount(socket.userId);
				callback({ success: true, count });
			} catch (error) {
				console.error('[Socket] Error getting unread count:', error);
				callback({ success: false, error: error.message });
			}
		});

		/**
		 * Get notifications with pagination
		 */
		socket.on('notification:get-list', async (options, callback) => {
			try {
				const Notification = (await import('../models/Notification.js')).default;
				const result = await Notification.getForUser(socket.userId, options);
				callback({ success: true, ...result });
			} catch (error) {
				console.error('[Socket] Error getting notifications:', error);
				callback({ success: false, error: error.message });
			}
		});

		/**
		 * Mark notification as read
		 */
		socket.on('notification:mark-read', async (notificationId, callback) => {
			try {
				const Notification = (await import('../models/Notification.js')).default;
				const notification = await Notification.findById(notificationId);

				if (!notification || notification.userId.toString() !== socket.userId) {
					return callback({ success: false, error: 'Notification not found' });
				}

				await notification.markAsRead();
				callback({ success: true });

				// Emit unread count update
				const count = await Notification.getUnreadCount(socket.userId);
				socket.emit('notification:unread-count-updated', { count });
			} catch (error) {
				console.error('[Socket] Error marking notification as read:', error);
				callback({ success: false, error: error.message });
			}
		});

		/**
		 * Mark all notifications as read
		 */
		socket.on('notification:mark-all-read', async (callback) => {
			try {
				const Notification = (await import('../models/Notification.js')).default;
				await Notification.markAllAsRead(socket.userId);
				callback({ success: true });

				// Emit unread count update
				socket.emit('notification:unread-count-updated', { count: 0 });
			} catch (error) {
				console.error('[Socket] Error marking all as read:', error);
				callback({ success: false, error: error.message });
			}
		});

		/**
		 * Delete notification
		 */
		socket.on('notification:delete', async (notificationId, callback) => {
			try {
				const Notification = (await import('../models/Notification.js')).default;
				const notification = await Notification.findById(notificationId);

				if (!notification || notification.userId.toString() !== socket.userId) {
					return callback({ success: false, error: 'Notification not found' });
				}

				await Notification.deleteOne({ _id: notificationId });
				callback({ success: true });

				// Emit unread count update
				const count = await Notification.getUnreadCount(socket.userId);
				socket.emit('notification:unread-count-updated', { count });
			} catch (error) {
				console.error('[Socket] Error deleting notification:', error);
				callback({ success: false, error: error.message });
			}
		});

		/**
		 * Clear old notifications
		 */
		socket.on('notification:clear-old', async (daysOld = 30, callback) => {
			try {
				const Notification = (await import('../models/Notification.js')).default;
				const result = await Notification.deleteOldNotifications(socket.userId, daysOld);
				callback({ success: true, deletedCount: result.deletedCount });

				// Emit unread count update
				const count = await Notification.getUnreadCount(socket.userId);
				socket.emit('notification:unread-count-updated', { count });
			} catch (error) {
				console.error('[Socket] Error clearing old notifications:', error);
				callback({ success: false, error: error.message });
			}
		});

		// ============ ADMIN EVENTS ============

		/**
		 * Admin: Send notification to specific user
		 */
		socket.on('admin:send-notification', async (data, callback) => {
			try {
				if (socket.userRole !== 'admin') {
					return callback({ success: false, error: 'Unauthorized' });
				}

				const {
					userId,
					title,
					message,
					type = 'info',
					category = 'other',
					actionType = 'none',
					actionData,
				} = data;

				const Notification = (await import('../models/Notification.js')).default;
				const notification = await Notification.create({
					userId,
					title,
					message,
					type,
					category,
					source: 'admin',
					actionType,
					actionData: actionData || undefined,
					deliveredAt: new Date(),
				});

				sendNotificationToUser(io, String(userId), notification);

				callback({ success: true, notificationId: notification._id });
			} catch (error) {
				console.error('[Socket] Error sending notification:', error);
				callback({ success: false, error: error.message });
			}
		});

		/**
		 * Admin: Broadcast notification to all users
		 */
		socket.on('admin:broadcast-notification', async (data, callback) => {
			try {
				if (socket.userRole !== 'admin') {
					return callback({ success: false, error: 'Unauthorized' });
				}

				const {
					title,
					message,
					type = 'info',
					category = 'system',
					userIds = null,
					actionType = 'none',
					actionData,
				} = data;

				const { deliverStandaloneAdminNotifications } = await import(
					'../services/notificationCampaignService.js'
				);
				const { recipientCount } =
					await deliverStandaloneAdminNotifications({
						title,
						message,
						type,
						category,
						userIds: userIds && Array.isArray(userIds) && userIds.length ? userIds : null,
						actionType,
						actionData,
					});

				callback({ success: true, sentCount: recipientCount });
			} catch (error) {
				console.error('[Socket] Error broadcasting notification:', error);
				callback({ success: false, error: error.message });
			}
		});

		/**
		 * Admin: Get all connected users
		 */
		socket.on('admin:get-connected-users', (callback) => {
			try {
				if (socket.userRole !== 'admin') {
					return callback({ success: false, error: 'Unauthorized' });
				}

				const connectedUsers = [];
				io.sockets.sockets.forEach((s) => {
					if (s.userId) {
						connectedUsers.push({
							socketId: s.id,
							userId: s.userId,
							userName: s.userName,
							connectedAt: new Date(s.handshake.time),
						});
					}
				});

				callback({ success: true, users: connectedUsers, count: connectedUsers.length });
			} catch (error) {
				console.error('[Socket] Error getting connected users:', error);
				callback({ success: false, error: error.message });
			}
		});

		// ============ DISCONNECT EVENT ============

		socket.on('disconnect', () => {
			console.log(`[Socket] User disconnected: ${socket.userId}`);
		});

		// ============ ERROR HANDLING ============

		socket.on('error', (error) => {
			console.error(`[Socket] Error for user ${socket.userId}:`, error);
		});
	});

	return io;
};

/**
 * Send notification to specific user via Socket.IO
 * @param {Server} io - Socket.IO server instance
 * @param {string} userId - Target user ID
 * @param {Object} notification - Notification object
 */
export const sendNotificationToUser = (io, userId, notification) => {
	io.to(`user:${userId}`).emit('notification:new', {
		_id: notification._id,
		title: notification.title,
		message: notification.message,
		type: notification.type,
		category: notification.category,
		priority: notification.priority,
		actionType: notification.actionType,
		actionData: notification.actionData,
		createdAt: notification.createdAt,
	});
};

/**
 * Send notification to multiple users
 * @param {Server} io - Socket.IO server instance
 * @param {Array} userIds - Array of user IDs
 * @param {Object} notification - Notification object
 */
export const sendNotificationToUsers = (io, userIds, notification) => {
	userIds.forEach((userId) => {
		sendNotificationToUser(io, userId, notification);
	});
};

/**
 * Broadcast notification to all users
 * @param {Server} io - Socket.IO server instance
 * @param {Object} notification - Notification object
 */
export const broadcastNotification = (io, notification) => {
	io.emit('notification:new', {
		_id: notification._id,
		title: notification.title,
		message: notification.message,
		type: notification.type,
		category: notification.category,
		priority: notification.priority,
		isSystemBroadcast: true,
		createdAt: notification.createdAt,
	});
};

/**
 * Send notification to admin room
 * @param {Server} io - Socket.IO server instance
 * @param {Object} data - Notification data
 */
export const sendToAdminRoom = (io, data) => {
	io.to('admin').emit('admin:notification', data);
};

export default initializeSocket;
