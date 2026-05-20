import Joi from 'joi';
import { PROMPT_TYPES, JLPT_LEVELS } from '../models/Prompt.js';

export const promptSchema = Joi.object({
	type: Joi.string()
		.valid(...PROMPT_TYPES)
		.required()
		.messages({
			'any.required': 'MSG_003',
			'any.only': 'MSG_003',
		}),
	templateKey: Joi.string()
		.required()
		.trim()
		.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.messages({
			'any.required': 'MSG_003',
			'string.empty': 'MSG_003',
			'string.pattern.base': 'MSG_003',
		}),
	name: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	description: Joi.string().trim().allow('', null).optional(),
	content: Joi.string().required().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	jlptLevel: Joi.string()
		.valid(...JLPT_LEVELS)
		.allow(null, '')
		.optional(),
	category: Joi.string().trim().allow('', null).optional(),
	isActive: Joi.boolean().default(true),
	displayOrder: Joi.number().integer().min(0).default(0),
});
