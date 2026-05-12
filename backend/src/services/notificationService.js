import Notification from '../models/Notification.js';

/**
 * Notification Service - Handle all notification operations
 */

/**
 * Create a notification
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (data) => {
	const {
		userId,
		title,
		message,
		description = '',
		type = 'info',
		category = 'other',
		actionType = 'none',
		actionData = null,
		priority = 'normal',
		expiresAt = null,
		source = 'system',
		metadata = null,
		batchId = null,
	} = data;

	const notification = await Notification.create({
		userId,
		title,
		message,
		description,
		type,
		category,
		actionType,
		actionData,
		priority,
		expiresAt,
		source,
		metadata,
		batchId,
		deliveredAt: new Date(),
	});

	return notification;
};

/**
 * Create multiple notifications (batch)
 * @param {Array} notifications - Array of notification data
 * @returns {Promise<Array>} Created notifications
 */
export const createBatchNotifications = async (notifications) => {
	const batchId = `batch_${Date.now()}`;
	const createdNotifications = [];

	for (const notifData of notifications) {
		const notification = await createNotification({
			...notifData,
			batchId,
		});
		createdNotifications.push(notification);
	}

	return createdNotifications;
};

/**
 * Get notifications for user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Notifications and total count
 */
export const getNotifications = async (userId, options = {}) => {
	return await Notification.getForUser(userId, options);
};

/**
 * Get unread notifications count
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
export const getUnreadCount = async (userId) => {
	return await Notification.getUnreadCount(userId);
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (notificationId) => {
	const notification = await Notification.findById(notificationId);
	if (!notification) {
		throw new Error('Notification not found');
	}
	return await notification.markAsRead();
};

/**
 * Mark all notifications as read for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Update result
 */
export const markAllAsRead = async (userId) => {
	return await Notification.markAllAsRead(userId);
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteNotification = async (notificationId) => {
	return await Notification.deleteOne({ _id: notificationId });
};

/**
 * Delete old notifications for user
 * @param {string} userId - User ID
 * @param {number} daysOld - Delete notifications older than this many days
 * @returns {Promise<Object>} Delete result
 */
export const deleteOldNotifications = async (userId, daysOld = 30) => {
	return await Notification.deleteOldNotifications(userId, daysOld);
};

/**
 * Get notification by ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Notification
 */
export const getNotificationById = async (notificationId) => {
	return await Notification.findById(notificationId);
};

/**
 * Update notification
 * @param {string} notificationId - Notification ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated notification
 */
export const updateNotification = async (notificationId, updates) => {
	return await Notification.findByIdAndUpdate(notificationId, updates, { new: true });
};

/**
 * Get notifications by batch ID
 * @param {string} batchId - Batch ID
 * @returns {Promise<Array>} Notifications
 */
export const getNotificationsByBatch = async (batchId) => {
	return await Notification.find({ batchId }).lean();
};

/**
 * Get statistics for user notifications
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics
 */
export const getNotificationStats = async (userId) => {
	const [
		totalCount,
		unreadCount,
		byType,
		byCategory,
		byPriority,
	] = await Promise.all([
		Notification.countDocuments({ userId }),
		Notification.countDocuments({ userId, isRead: false }),
		Notification.aggregate([
			{ $match: { userId: require('mongoose').Types.ObjectId(userId) } },
			{ $group: { _id: '$type', count: { $sum: 1 } } },
		]),
		Notification.aggregate([
			{ $match: { userId: require('mongoose').Types.ObjectId(userId) } },
			{ $group: { _id: '$category', count: { $sum: 1 } } },
		]),
		Notification.aggregate([
			{ $match: { userId: require('mongoose').Types.ObjectId(userId) } },
			{ $group: { _id: '$priority', count: { $sum: 1 } } },
		]),
	]);

	return {
		totalCount,
		unreadCount,
		readCount: totalCount - unreadCount,
		byType: Object.fromEntries(byType.map(item => [item._id, item.count])),
		byCategory: Object.fromEntries(byCategory.map(item => [item._id, item.count])),
		byPriority: Object.fromEntries(byPriority.map(item => [item._id, item.count])),
	};
};

/**
 * Create notification from template
 * @param {string} userId - User ID
 * @param {string} templateType - Template type
 * @param {Object} variables - Template variables
 * @returns {Promise<Object>} Created notification
 */
export const createFromTemplate = async (userId, templateType, variables = {}) => {
	const templates = {
		vocabulary_added: {
			title: 'Từ vựng mới được thêm',
			message: `Từ vựng "${variables.word}" đã được thêm vào bộ "${variables.deckName}"`,
			type: 'success',
			category: 'vocabulary',
		},
		kanji_added: {
			title: 'Kanji mới được thêm',
			message: `Kanji "${variables.char}" đã được thêm vào bộ "${variables.deckName}"`,
			type: 'success',
			category: 'kanji',
		},
		quiz_completed: {
			title: 'Hoàn thành bài kiểm tra',
			message: `Bạn đã hoàn thành bài kiểm tra với điểm ${variables.score}/${variables.total}`,
			type: 'success',
			category: 'quiz',
		},
		streak_milestone: {
			title: 'Cột mốc streak!',
			message: `Chúc mừng! Bạn đã đạt được ${variables.days} ngày liên tiếp`,
			type: 'success',
			category: 'achievement',
			priority: 'high',
		},
		achievement_unlocked: {
			title: 'Thành tựu mở khóa',
			message: `Bạn đã mở khóa thành tựu: ${variables.achievementName}`,
			type: 'success',
			category: 'achievement',
			priority: 'high',
		},
		system_maintenance: {
			title: 'Bảo trì hệ thống',
			message: `Hệ thống sẽ bảo trì vào ${variables.time}. Thời gian dự kiến: ${variables.duration}`,
			type: 'warning',
			category: 'system',
			priority: 'high',
		},
		error_occurred: {
			title: 'Lỗi xảy ra',
			message: variables.errorMessage || 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
			type: 'error',
			category: 'system',
			priority: 'high',
		},
	};

	const template = templates[templateType];
	if (!template) {
		throw new Error(`Template "${templateType}" not found`);
	}

	return await createNotification({
		userId,
		...template,
		metadata: { templateType, variables },
	});
};

/**
 * Cleanup expired notifications (run periodically)
 * @returns {Promise<Object>} Delete result
 */
export const cleanupExpiredNotifications = async () => {
	return await Notification.deleteMany({
		expiresAt: { $lt: new Date() },
	});
};

/**
 * Archive old read notifications
 * @param {number} daysOld - Archive notifications older than this many days
 * @returns {Promise<Object>} Update result
 */
export const archiveOldNotifications = async (daysOld = 90) => {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysOld);

	return await Notification.updateMany(
		{
			createdAt: { $lt: cutoffDate },
			isRead: true,
		},
		{
			$set: { archived: true },
		}
	);
};

export default {
	createNotification,
	createBatchNotifications,
	getNotifications,
	getUnreadCount,
	markAsRead,
	markAllAsRead,
	deleteNotification,
	deleteOldNotifications,
	getNotificationById,
	updateNotification,
	getNotificationsByBatch,
	getNotificationStats,
	createFromTemplate,
	cleanupExpiredNotifications,
	archiveOldNotifications,
};
