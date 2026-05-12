import Joi from 'joi';

export const registerSchema = Joi.object({
	email: Joi.string().email().required().messages({
		'string.email': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	password: Joi.string().min(6).required().messages({
		'string.min': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	name: Joi.string().min(2).required().messages({
		'string.min': 'MSG_003',
		'any.required': 'MSG_003',
	}),
});

export const loginSchema = Joi.object({
	email: Joi.string().email().required().messages({
		'string.email': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	password: Joi.string().required().messages({
		'any.required': 'MSG_003',
	}),
});
