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
	remember: Joi.boolean().optional(),
});

export const changePasswordSchema = Joi.object({
	currentPassword: Joi.string().min(1).max(200).required().messages({
		'any.required': 'MSG_003',
		'string.max': 'MSG_003',
	}),
	newPassword: Joi.string().min(6).max(128).required().invalid(Joi.ref('currentPassword')).messages({
		'any.required': 'MSG_003',
		'string.min': 'MSG_003',
		'string.max': 'MSG_003',
		'any.invalid': 'MSG_003',
	}),
}).unknown(false);

export const verifyEmailSchema = Joi.object({
	token: Joi.string().min(32).max(256).required().messages({
		'any.required': 'MSG_003',
		'string.min': 'MSG_003',
	}),
});

export const resendVerificationSchema = Joi.object({
	email: Joi.string().email().required().messages({
		'string.email': 'MSG_003',
		'any.required': 'MSG_003',
	}),
});

export const forgotPasswordSchema = Joi.object({
	email: Joi.string().email().required().messages({
		'string.email': 'MSG_003',
		'any.required': 'MSG_003',
	}),
});

export const resetPasswordSchema = Joi.object({
	token: Joi.string().min(32).max(128).required().messages({
		'any.required': 'MSG_003',
		'string.min': 'MSG_003',
	}),
	newPassword: Joi.string().min(6).max(128).required().messages({
		'any.required': 'MSG_003',
		'string.min': 'MSG_003',
		'string.max': 'MSG_003',
	}),
}).unknown(false);
