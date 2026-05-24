import Joi from 'joi';
import {
	KAIWA_CATEGORIES,
	KAIWA_JLPT_LEVELS,
} from '../constants/kaiwa.js';

const roleSchema = Joi.object({
	nameJa: Joi.string().allow('').max(120).default(''),
	nameVi: Joi.string().allow('').max(120).default(''),
	descriptionJa: Joi.string().allow('').max(500).default(''),
	descriptionVi: Joi.string().allow('').max(500).default(''),
});

const keyPhraseSchema = Joi.object({
	phraseJa: Joi.string().trim().required().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	reading: Joi.string().allow('').max(120).default(''),
	meaningVi: Joi.string().allow('').max(300).default(''),
});

const kaiwaBodySchema = {
	titleVi: Joi.string().trim().required().max(200).messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	titleJa: Joi.string().allow('').max(200).default(''),
	jlpt: Joi.string()
		.valid(...KAIWA_JLPT_LEVELS)
		.default('N5'),
	category: Joi.string()
		.valid(...KAIWA_CATEGORIES)
		.default('daily'),
	settingVi: Joi.string().allow('').max(500).default(''),
	settingJa: Joi.string().allow('').max(500).default(''),
	roles: Joi.array().items(roleSchema).max(6).default([]),
	situationVi: Joi.string().trim().required().max(4000).messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	situationJa: Joi.string().allow('').max(4000).default(''),
	objectivesVi: Joi.string().allow('').max(2000).default(''),
	objectivesJa: Joi.string().allow('').max(2000).default(''),
	keyPhrases: Joi.array().items(keyPhraseSchema).max(30).default([]),
	culturalNotesVi: Joi.string().allow('').max(2000).default(''),
	culturalNotesJa: Joi.string().allow('').max(2000).default(''),
	isPublished: Joi.boolean().default(false),
	displayOrder: Joi.number().integer().min(0).default(0),
};

export const createKaiwaContextSchema = Joi.object(kaiwaBodySchema);

export const updateKaiwaContextSchema = Joi.object({
	...Object.fromEntries(
		Object.entries(kaiwaBodySchema).map(([key, schema]) => [
			key,
			schema.optional(),
		]),
	),
}).min(1);

export const generateKaiwaContextSchema = Joi.object({
	templateName: Joi.string().trim().lowercase().required().messages({
		'any.required': 'MSG_003',
	}),
	prompt: Joi.string().allow('').max(2000).default(''),
	jlpt: Joi.string()
		.valid(...KAIWA_JLPT_LEVELS)
		.default('N5'),
	category: Joi.string()
		.valid(...KAIWA_CATEGORIES)
		.default('daily'),
});
