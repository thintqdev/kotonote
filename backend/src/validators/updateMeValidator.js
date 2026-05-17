import Joi from 'joi';
import {
	PROFILE_REGION_KEYS,
	PROFILE_TIMEZONE_KEYS,
} from '../constants/profileLocale.js';

const EXAM_TYPES = ['jlpt', 'nat', 'jtest', 'topj', 'eju', 'other'];

const profileSchema = Joi.object({
	readingName: Joi.string().allow('', null).trim().max(80),
	title: Joi.string().allow('', null).trim().max(120),
	location: Joi.string()
		.allow('', null)
		.valid(...PROFILE_REGION_KEYS, '')
		.messages({ 'any.only': 'Invalid region' }),
	timeZoneLabel: Joi.string()
		.allow('', null)
		.valid(...PROFILE_TIMEZONE_KEYS, '')
		.messages({ 'any.only': 'Invalid timezone' }),
	bio: Joi.string().allow('', null).max(2000),
	examTypeKey: Joi.string().valid(...EXAM_TYPES),
	examLevelKey: Joi.string().allow('', null).trim().max(40),
	examDateIso: Joi.string().allow('', null).trim().max(32),
	examOtherNote: Joi.string().allow('', null).trim().max(500),
});

/** PUT /api/users/me — name, avatar, extended profile */
export const updateMeSchema = Joi.object({
	name: Joi.string().trim().min(2).max(50).required(),
	avatar: Joi.alternatives().try(
		Joi.string().max(2048).pattern(/^(?!data:image\/)/),
		Joi.valid(null),
	),
	profile: profileSchema.optional(),
})
	.unknown(false)
	.messages({
		'object.unknown': 'Unknown fields in request body',
	});
