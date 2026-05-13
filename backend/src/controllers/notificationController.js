import asyncHandler from 'express-async-handler';
import * as notificationService from '../services/notificationService.js';
import * as notificationCampaignService from '../services/notificationCampaignService.js';
import { getIo } from '../config/ioRegistry.js';
import { sendNotificationToUser, sendToAdminRoom } from '../config/socket.js';
import { apiSuccess, apiError } from '../utils/response.js';
import { MESSAGES, COMMON } from '../constants/messages.js';

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
	const { limit = 20, skip = 0, isRead, type, category, priority } = req.query;

	const result = await notificationService.getNotifications(req.user._id, {
		limit: parseInt(limit),
		skip: parseInt(skip),
		isRead: isRead ? isRead === 'true' : null,
		type: type || null,
		category: category || null,
		priority: priority || null,
	});

	return apiSuccess(res, result, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
	const count = await notificationService.getUnreadCount(req.user._id);

	return apiSuccess(res, { count }, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Get notification by ID
 * @route   GET /api/notifications/:id
 * @access  Private
 */
export const getNotificationById = asyncHandler(async (req, res) => {
	const notification = await notificationService.getNotificationById(req.params.id);

	if (!notification || notification.userId.toString() !== req.user._id.toString()) {
		return apiSuccess(res, null, MESSAGES.MSG_004, 404);
	}

	return apiSuccess(res, { notification }, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
	const notification = await notificationService.getNotificationById(req.params.id);

	if (!notification || notification.userId.toString() !== req.user._id.toString()) {
		return apiSuccess(res, null, MESSAGES.MSG_004, 404);
	}

	const updated = await notificationService.markAsRead(req.params.id);

	return apiSuccess(res, { notification: updated }, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
	await notificationService.markAllAsRead(req.user._id);

	return apiSuccess(res, null, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
	const notification = await notificationService.getNotificationById(req.params.id);

	if (!notification || notification.userId.toString() !== req.user._id.toString()) {
		return apiSuccess(res, null, MESSAGES.MSG_004, 404);
	}

	await notificationService.deleteNotification(req.params.id);

	return apiSuccess(res, null, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Clear old notifications
 * @route   DELETE /api/notifications/clear-old
 * @access  Private
 */
export const clearOldNotifications = asyncHandler(async (req, res) => {
	const { daysOld = 30 } = req.query;

	const result = await notificationService.deleteOldNotifications(req.user._id, parseInt(daysOld));

	return apiSuccess(res, { deletedCount: result.deletedCount }, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Get notification statistics
 * @route   GET /api/notifications/stats
 * @access  Private
 */
export const getStats = asyncHandler(async (req, res) => {
	const stats = await notificationService.getNotificationStats(req.user._id);

	return apiSuccess(res, { stats }, MESSAGES.MSG_001, 200);
});

// ============ ADMIN ENDPOINTS ============

/**
 * @desc    Danh sách chiến dịch gửi thông báo (admin)
 * @route   GET /api/admin/notifications/campaigns
 * @access  Admin
 */
export const listCampaigns = asyncHandler(async (req, res) => {
	const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
	const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
	const result = await notificationCampaignService.listCampaigns({ limit, skip });
	return apiSuccess(res, result, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Tạo chiến dịch — gửi ngay hoặc lên lịch
 * @route   POST /api/admin/notifications/campaigns
 * @access  Admin
 */
export const createNotificationCampaign = asyncHandler(async (req, res) => {
	if (
		req.body.audience === 'selected' &&
		(!req.body.userIds || req.body.userIds.length === 0)
	) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'userIds', message: 'Required when audience is selected' },
		]);
	}

	const scheduledAt =
		req.body.scheduledAt === '' || req.body.scheduledAt == null
			? null
			: req.body.scheduledAt;

	const campaign = await notificationCampaignService.createCampaign(
		{ ...req.body, scheduledAt },
		req.user._id
	);

	return apiSuccess(res, { campaign }, MESSAGES.MSG_001, 201);
});

/**
 * @desc    Hủy chiến dịch đã lên lịch
 * @route   PATCH /api/admin/notifications/campaigns/:campaignId/cancel
 * @access  Admin
 */
export const cancelNotificationCampaign = asyncHandler(async (req, res) => {
	const campaign = await notificationCampaignService.cancelCampaign(
		req.params.campaignId
	);
	const io = getIo();
	if (io) {
		sendToAdminRoom(io, {
			type: 'campaign_cancelled',
			campaignId: String(req.params.campaignId),
		});
	}
	return apiSuccess(res, { campaign }, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Send notification to user (Admin)
 * @route   POST /api/admin/notifications/send
 * @access  Admin
 */
export const sendNotification = asyncHandler(async (req, res) => {
	const {
		userId,
		title,
		message,
		type = 'info',
		category = 'other',
		actionType = 'none',
		actionData,
	} = req.body;

	const notification = await notificationService.createNotification({
		userId,
		title,
		message,
		type,
		category,
		source: 'admin',
		actionType,
		actionData: actionData || undefined,
	});

	const io = getIo();
	if (io) {
		sendNotificationToUser(io, notification.userId.toString(), notification);
	}

	return apiSuccess(res, { notification }, MESSAGES.MSG_001, 201);
});

/**
 * @desc    Send notification to multiple users (Admin)
 * @route   POST /api/admin/notifications/send-batch
 * @access  Admin
 */
export const sendBatchNotifications = asyncHandler(async (req, res) => {
	const {
		userIds,
		title,
		message,
		type = 'info',
		category = 'other',
		actionType = 'none',
		actionData,
	} = req.body;

	const notifications = await notificationService.createBatchNotifications(
		userIds.map((uid) => ({
			userId: uid,
			title,
			message,
			type,
			category,
			source: 'admin',
			actionType,
			actionData: actionData || undefined,
		}))
	);

	const io = getIo();
	if (io) {
		for (const n of notifications) {
			sendNotificationToUser(io, n.userId.toString(), n);
		}
	}

	return apiSuccess(res, { count: notifications.length, notifications }, MESSAGES.MSG_001, 201);
});

/**
 * @desc    Broadcast notification to all or selected users (Admin)
 * @route   POST /api/admin/notifications/broadcast
 * @access  Admin
 */
export const broadcastNotification = asyncHandler(async (req, res) => {
	const {
		title,
		message,
		type = 'info',
		category = 'system',
		userIds,
		actionType = 'none',
		actionData,
	} = req.body;

	const { recipientCount } =
		await notificationCampaignService.deliverStandaloneAdminNotifications({
			title,
			message,
			type,
			category,
			userIds: userIds && userIds.length ? userIds : null,
			actionType,
			actionData: actionData || undefined,
		});

	return apiSuccess(res, { count: recipientCount }, MESSAGES.MSG_001, 201);
});

/**
 * @desc    Get all notifications (Admin)
 * @route   GET /api/admin/notifications
 * @access  Admin
 */
export const getAllNotifications = asyncHandler(async (req, res) => {
	const { limit = 50, skip = 0, userId, type, category, isRead } = req.query;
	const Notification = (await import('../models/Notification.js')).default;

	const query = {};
	if (userId) query.userId = userId;
	if (type) query.type = type;
	if (category) query.category = category;
	if (isRead !== undefined) query.isRead = isRead === 'true';

	const notifications = await Notification.find(query)
		.sort({ createdAt: -1 })
		.limit(parseInt(limit))
		.skip(parseInt(skip))
		.populate('userId', 'name email');

	const total = await Notification.countDocuments(query);

	return apiSuccess(res, { notifications, total }, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Get notification statistics (Admin)
 * @route   GET /api/admin/notifications/stats
 * @access  Admin
 */
export const getAdminStats = asyncHandler(async (req, res) => {
	const Notification = (await import('../models/Notification.js')).default;

	const [
		totalCount,
		unreadCount,
		byType,
		byCategory,
		bySource,
	] = await Promise.all([
		Notification.countDocuments(),
		Notification.countDocuments({ isRead: false }),
		Notification.aggregate([
			{ $group: { _id: '$type', count: { $sum: 1 } } },
		]),
		Notification.aggregate([
			{ $group: { _id: '$category', count: { $sum: 1 } } },
		]),
		Notification.aggregate([
			{ $group: { _id: '$source', count: { $sum: 1 } } },
		]),
	]);

	return apiSuccess(res, {
		stats: {
			totalCount,
			unreadCount,
			readCount: totalCount - unreadCount,
			byType: Object.fromEntries(byType.map(item => [item._id, item.count])),
			byCategory: Object.fromEntries(byCategory.map(item => [item._id, item.count])),
			bySource: Object.fromEntries(bySource.map(item => [item._id, item.count])),
		},
	}, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Delete notification (Admin)
 * @route   DELETE /api/admin/notifications/:id
 * @access  Admin
 */
export const deleteNotificationAdmin = asyncHandler(async (req, res) => {
	const notification = await notificationService.getNotificationById(req.params.id);

	if (!notification) {
		return apiSuccess(res, null, MESSAGES.MSG_004, 404);
	}

	await notificationService.deleteNotification(req.params.id);

	return apiSuccess(res, null, MESSAGES.MSG_001, 200);
});

export default {
	getNotifications,
	getUnreadCount,
	getNotificationById,
	markAsRead,
	markAllAsRead,
	deleteNotification,
	clearOldNotifications,
	getStats,
	listCampaigns,
	createNotificationCampaign,
	cancelNotificationCampaign,
	sendNotification,
	sendBatchNotifications,
	broadcastNotification,
	getAllNotifications,
	getAdminStats,
	deleteNotificationAdmin,
};
