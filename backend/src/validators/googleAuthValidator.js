import Joi from 'joi';

export const googleLoginSchema = Joi.object({
	token: Joi.string().required().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
});
