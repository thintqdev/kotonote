import Joi from 'joi';

export const googleLoginSchema = Joi.object({
	token: Joi.string().required().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	password: Joi.string().min(6).max(128).optional().allow('').messages({
		'string.min': 'MSG_003',
		'string.max': 'MSG_003',
	}),
	remember: Joi.boolean().optional(),
}).unknown(false);
