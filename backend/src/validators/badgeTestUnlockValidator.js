import Joi from 'joi';

const keyPattern = /^[a-z0-9_]{2,64}$/;

/** POST /api/users/me/badges/test-unlock — chỉ non-production */
export const badgeTestUnlockSchema = Joi.object({
	badgeKey: Joi.string().trim().lowercase().pattern(keyPattern).required().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
		'string.pattern.base': 'MSG_003',
	}),
});
