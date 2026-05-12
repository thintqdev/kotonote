import Joi from 'joi';

export const quoteSchema = Joi.object({
	quoteVi: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	quoteJa: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	author: Joi.string().trim().allow('', null).optional(),
	category: Joi.string()
		.valid('motivation', 'learning', 'wisdom', 'perseverance', 'success')
		.default('motivation')
		.messages({
			'any.only': 'MSG_003',
		}),
	isActive: Joi.boolean().default(true),
	displayOrder: Joi.number().integer().min(0).default(0),
});
