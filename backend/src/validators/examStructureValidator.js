import Joi from 'joi';
import { EXAM_JLPT_LEVELS, EXAM_SECTION_TYPES } from '../constants/examPaper.js';

const blueprintSectionSchema = Joi.object({
	sectionType: Joi.string()
		.valid(...EXAM_SECTION_TYPES)
		.required(),
	partType: Joi.string().trim().max(64).required(),
	titleVi: Joi.string().allow('').max(200).default(''),
	titleJa: Joi.string().allow('').max(200).default(''),
	descriptionVi: Joi.string().allow('').max(2000).default(''),
	order: Joi.number().integer().min(0).default(0),
	isEnabled: Joi.boolean().default(true),
	needsPassage: Joi.boolean().default(false),
	needsMedia: Joi.boolean().default(false),
	needsAudio: Joi.boolean().optional(),
});

export const listExamStructureSchema = Joi.object({
	jlpt: Joi.string()
		.valid(...EXAM_JLPT_LEVELS)
		.allow(''),
	isActive: Joi.string().valid('true', 'false').allow(''),
}).unknown(false);

export const jlptParamSchema = Joi.object({
	jlpt: Joi.string()
		.valid(...EXAM_JLPT_LEVELS)
		.required(),
}).unknown(false);

export const updateExamStructureSchema = Joi.object({
	name: Joi.string().trim().max(120).optional(),
	description: Joi.string().allow('').max(500).optional(),
	isActive: Joi.boolean().optional(),
	sections: Joi.array().items(blueprintSectionSchema).min(0).max(40).required(),
}).min(1);

export const metaQuerySchema = Joi.object({
	jlpt: Joi.string()
		.valid(...EXAM_JLPT_LEVELS)
		.default('N3'),
}).unknown(false);
