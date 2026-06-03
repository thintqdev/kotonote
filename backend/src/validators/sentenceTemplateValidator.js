import Joi from 'joi';
import { SENTENCE_POLITENESS_LEVELS } from '../constants/sentenceTemplate.js';

export const specialtySchema = Joi.object({
	code: Joi.string().required().trim().lowercase().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	nameVi: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	nameJa: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	descriptionVi: Joi.string().trim().allow('', null).optional(),
	descriptionJa: Joi.string().trim().allow('', null).optional(),
	isActive: Joi.boolean().default(true),
	displayOrder: Joi.number().integer().min(0).default(0),
});

export const templateSchema = Joi.object({
	specialtyId: Joi.string().required().messages({
		'any.required': 'MSG_003',
	}),
	code: Joi.string().required().trim().lowercase().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	situationVi: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	situationJa: Joi.string().trim().allow('', null).optional(),
	sentenceJa: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	sentenceVi: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	reading: Joi.string().trim().allow('', null).optional(),
	clozePart: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	politenessLevel: Joi.string()
		.valid(...SENTENCE_POLITENESS_LEVELS)
		.default('polite'),
	noteVi: Joi.string().trim().allow('', null).optional(),
	noteJa: Joi.string().trim().allow('', null).optional(),
	isActive: Joi.boolean().default(true),
	displayOrder: Joi.number().integer().min(0).default(0),
});

export const progressUpdateSchema = Joi.object({
	action: Joi.string()
		.valid('flash_seen', 'quiz_correct', 'quiz_wrong', 'mark_mastered', 'mark_review')
		.required()
		.messages({ 'any.required': 'MSG_003', 'any.only': 'MSG_003' }),
});

export const listTemplatesQuerySchema = Joi.object({
	specialtyId: Joi.string().optional(),
	specialtyCode: Joi.string().trim().lowercase().optional(),
	isActive: Joi.string().valid('true', 'false').optional(),
});
