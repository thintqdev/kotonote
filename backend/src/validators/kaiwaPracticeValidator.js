import Joi from 'joi';

const messageSchema = Joi.object({
	role: Joi.string().valid('user', 'partner').required(),
	textJa: Joi.string().allow('', null).max(800).default(''),
	textVi: Joi.string().allow('', null).max(800).optional(),
}).unknown(true);

export const kaiwaPracticeTurnSchema = Joi.object({
	sessionId: Joi.string().allow('', null).max(24).optional(),
	userMessage: Joi.string().allow('', null).max(800).default(''),
	messages: Joi.array().items(messageSchema).max(24).default([]),
	userRoleIndex: Joi.number().integer().min(0).max(5).default(0),
	partnerRoleIndex: Joi.number().integer().min(0).max(5).default(1),
});
