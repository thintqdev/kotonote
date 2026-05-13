import Joi from 'joi';

export const sendNotificationSchema = Joi.object({
	userId: Joi.string().required().messages({
		'string.empty': 'User ID is required',
	}),
	userIds: Joi.array().items(Joi.string()).messages({
		'array.base': 'User IDs must be an array',
	}),
	title: Joi.string().required().max(200).messages({
		'string.empty': 'Title is required',
		'string.max': 'Title must not exceed 200 characters',
	}),
	message: Joi.string().required().max(1000).messages({
		'string.empty': 'Message is required',
		'string.max': 'Message must not exceed 1000 characters',
	}),
	description: Joi.string().max(2000).messages({
		'string.max': 'Description must not exceed 2000 characters',
	}),
	type: Joi.string()
		.valid('info', 'success', 'warning', 'error', 'task_update', 'system', 'admin_action')
		.default('info'),
	category: Joi.string()
		.valid('vocabulary', 'kanji', 'quiz', 'streak', 'achievement', 'system', 'admin', 'other')
		.default('other'),
	priority: Joi.string()
		.valid('low', 'normal', 'high', 'urgent')
		.default('normal'),
	actionType: Joi.string()
		.valid('none', 'view_item', 'open_page', 'download', 'confirm', 'dismiss')
		.default('none'),
	actionData: Joi.object().allow(null).messages({
		'object.base': 'Action data must be an object',
	}),
	expiresAt: Joi.date().messages({
		'date.base': 'Expires at must be a valid date',
	}),
	metadata: Joi.object().messages({
		'object.base': 'Metadata must be an object',
	}),
});

/** Gửi cho nhiều user — POST /api/admin/notifications/send-batch */
export const sendBatchNotificationSchema = Joi.object({
	userIds: Joi.array().items(Joi.string()).min(1).required().messages({
		'array.min': 'At least one user ID is required',
	}),
	title: Joi.string().required().max(200).messages({
		'string.empty': 'Title is required',
		'string.max': 'Title must not exceed 200 characters',
	}),
	message: Joi.string().required().max(1000).messages({
		'string.empty': 'Message is required',
		'string.max': 'Message must not exceed 1000 characters',
	}),
	description: Joi.string().max(2000).messages({
		'string.max': 'Description must not exceed 2000 characters',
	}),
	type: Joi.string()
		.valid('info', 'success', 'warning', 'error', 'task_update', 'system', 'admin_action')
		.default('info'),
	category: Joi.string()
		.valid('vocabulary', 'kanji', 'quiz', 'streak', 'achievement', 'system', 'admin', 'other')
		.default('other'),
	priority: Joi.string()
		.valid('low', 'normal', 'high', 'urgent')
		.default('normal'),
	actionType: Joi.string()
		.valid('none', 'view_item', 'open_page', 'download', 'confirm', 'dismiss')
		.default('none'),
	actionData: Joi.object().allow(null),
	metadata: Joi.object().messages({
		'object.base': 'Metadata must be an object',
	}),
});

/** Chiến dịch admin (gửi ngay hoặc lên lịch) — POST /api/admin/notifications/campaigns */
export const createCampaignSchema = Joi.object({
	title: Joi.string().required().max(200),
	message: Joi.string().required().max(1000),
	type: Joi.string()
		.valid('info', 'success', 'warning', 'error', 'task_update', 'system', 'admin_action')
		.default('info'),
	category: Joi.string()
		.valid('vocabulary', 'kanji', 'quiz', 'streak', 'achievement', 'system', 'admin', 'other')
		.default('admin'),
	audience: Joi.string().valid('all', 'selected').required(),
	userIds: Joi.array().items(Joi.string()).default([]),
	scheduledAt: Joi.date().allow(null, ''),
	actionType: Joi.string()
		.valid('none', 'view_item', 'open_page', 'download', 'confirm', 'dismiss')
		.default('none'),
	actionData: Joi.object().allow(null),
});

export const broadcastNotificationSchema = Joi.object({
	title: Joi.string().required().max(200).messages({
		'string.empty': 'Title is required',
		'string.max': 'Title must not exceed 200 characters',
	}),
	message: Joi.string().required().max(1000).messages({
		'string.empty': 'Message is required',
		'string.max': 'Message must not exceed 1000 characters',
	}),
	description: Joi.string().max(2000).messages({
		'string.max': 'Description must not exceed 2000 characters',
	}),
	type: Joi.string()
		.valid('info', 'success', 'warning', 'error', 'task_update', 'system', 'admin_action')
		.default('info'),
	category: Joi.string()
		.valid('vocabulary', 'kanji', 'quiz', 'streak', 'achievement', 'system', 'admin', 'other')
		.default('system'),
	priority: Joi.string()
		.valid('low', 'normal', 'high', 'urgent')
		.default('normal'),
	userIds: Joi.array().items(Joi.string()).messages({
		'array.base': 'User IDs must be an array',
	}),
	actionType: Joi.string()
		.valid('none', 'view_item', 'open_page', 'download', 'confirm', 'dismiss')
		.default('none'),
	actionData: Joi.object().allow(null),
	metadata: Joi.object().messages({
		'object.base': 'Metadata must be an object',
	}),
});

export const markAsReadSchema = Joi.object({
	notificationId: Joi.string().required().messages({
		'string.empty': 'Notification ID is required',
	}),
});

export const getNotificationsSchema = Joi.object({
	limit: Joi.number().default(20).min(1).max(100),
	skip: Joi.number().default(0).min(0),
	isRead: Joi.boolean(),
	type: Joi.string().valid('info', 'success', 'warning', 'error', 'task_update', 'system', 'admin_action'),
	category: Joi.string().valid('vocabulary', 'kanji', 'quiz', 'streak', 'achievement', 'system', 'admin', 'other'),
	priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
});

export default {
	sendNotificationSchema,
	sendBatchNotificationSchema,
	createCampaignSchema,
	broadcastNotificationSchema,
	markAsReadSchema,
	getNotificationsSchema,
};
