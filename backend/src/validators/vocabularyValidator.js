import Joi from 'joi';

export const vocabularyDeckSchema = Joi.object({
	titleVi: Joi.string().required().trim().messages({
		'string.empty': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	titleJa: Joi.string().required().trim().messages({
		'string.empty': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	descriptionVi: Joi.string().trim().allow('').default(''),
	descriptionJa: Joi.string().trim().allow('').default(''),
	level: Joi.string().valid('N5', 'N4', 'N3', 'N2', 'N1').required().messages({
		'any.only': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	displayOrder: Joi.number().integer().min(0).default(0).messages({
		'number.base': 'MSG_003',
		'number.min': 'MSG_003',
	}),
	isActive: Joi.boolean().default(true),
});

export const vocabularySchema = Joi.object({
	deckId: Joi.string().required().messages({
		'string.empty': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	word: Joi.string().required().trim().messages({
		'string.empty': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	reading: Joi.string().required().trim().messages({
		'string.empty': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	meaningVi: Joi.string().required().messages({
		'string.empty': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	meaningJa: Joi.string().allow('', null).optional(),
	exampleSentence: Joi.string().allow('', null).optional(),
	exampleMeaning: Joi.string().allow('', null).optional(),
	displayOrder: Joi.number().integer().min(0).default(0).messages({
		'number.base': 'MSG_003',
		'number.min': 'MSG_003',
	}),
});
