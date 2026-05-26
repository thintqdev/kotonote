import Joi from 'joi';
import {
	FEEDBACK_CATEGORY_KEYS,
	FEEDBACK_MAX_ATTACHMENTS,
	FEEDBACK_MESSAGE_MAX,
	FEEDBACK_STATUS_KEYS,
} from '../constants/feedback.js';

const attachmentItemSchema = Joi.object({
	url: Joi.string().trim().max(2048).required(),
	kind: Joi.string().valid('image', 'video').required(),
});

export const submitFeedbackSchema = Joi.object({
	category: Joi.string()
		.valid(...FEEDBACK_CATEGORY_KEYS)
		.required()
		.messages({
			'any.required': 'MSG_003',
			'any.only': 'MSG_003',
		}),
	message: Joi.string().trim().min(1).max(FEEDBACK_MESSAGE_MAX).required().messages({
		'any.required': 'MSG_003',
		'string.min': 'MSG_003',
		'string.max': 'MSG_003',
	}),
	pageUrl: Joi.string().max(500).optional().allow(''),
	locale: Joi.string().max(10).optional().allow(''),
	userAgent: Joi.string().max(500).optional().allow(''),
	appVersion: Joi.string().max(50).optional().allow(''),
	attachments: Joi.array()
		.items(attachmentItemSchema)
		.max(FEEDBACK_MAX_ATTACHMENTS)
		.optional()
		.default([]),
});

export const adminListFeedbackQuerySchema = Joi.object({
	status: Joi.string()
		.valid(...FEEDBACK_STATUS_KEYS)
		.optional(),
	category: Joi.string()
		.valid(...FEEDBACK_CATEGORY_KEYS)
		.optional(),
	search: Joi.string().max(200).optional().allow(''),
	page: Joi.number().integer().min(1).optional(),
	limit: Joi.number().integer().min(1).max(100).optional(),
});

export const adminUpdateFeedbackSchema = Joi.object({
	status: Joi.string()
		.valid(...FEEDBACK_STATUS_KEYS)
		.required()
		.messages({
			'any.required': 'MSG_003',
			'any.only': 'MSG_003',
		}),
	adminNote: Joi.string().max(1000).optional().allow(''),
});
