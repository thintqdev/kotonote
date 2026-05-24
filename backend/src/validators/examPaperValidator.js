import Joi from 'joi';
import {
	EXAM_JLPT_LEVELS,
	EXAM_MAX_YEAR,
	EXAM_MIN_YEAR,
	EXAM_QUESTION_TYPES,
	EXAM_SECTION_TYPES,
	EXAM_SESSIONS,
	EXAM_SOURCE_TYPES,
} from '../constants/examPaper.js';
import {
	isValidPartTypeForSection,
} from '../constants/examPaperStructure.js';

const examQuestionSchema = Joi.object({
	questionNumber: Joi.number().integer().min(0).default(0),
	questionJa: Joi.string().allow('').max(2000).default(''),
	questionVi: Joi.string().allow('').max(2000).default(''),
	questionType: Joi.string()
		.valid(...EXAM_QUESTION_TYPES)
		.default('multiple_choice'),
	choices: Joi.array().items(Joi.string().allow('').max(500)).max(10).default([]),
	choiceImages: Joi.array().items(Joi.string().allow('').max(500)).max(10).default([]),
	mediaUrl: Joi.string().allow('').max(500).default(''),
	answerIndex: Joi.number().integer().min(0).max(10).default(0),
	explainVi: Joi.string().allow('').max(4000).default(''),
	explainJa: Joi.string().allow('').max(4000).default(''),
	points: Joi.number().min(0).default(1),
});

const examSectionSchema = Joi.object({
	sectionType: Joi.string()
		.valid(...EXAM_SECTION_TYPES)
		.required(),
	partType: Joi.string().required(),
	titleVi: Joi.string().allow('').max(200).default(''),
	titleJa: Joi.string().allow('').max(200).default(''),
	descriptionVi: Joi.string().allow('').max(2000).default(''),
	order: Joi.number().integer().min(0).default(0),
	timeLimitMinutes: Joi.number().integer().min(0).default(0),
	passageJa: Joi.string().allow('').max(50_000).default(''),
	passageVi: Joi.string().allow('').max(50_000).default(''),
	audioUrl: Joi.string().allow('').max(500).default(''),
	imageUrl: Joi.string().allow('').max(500).default(''),
	passages: Joi.array()
		.items(
			Joi.object({
				passageJa: Joi.string().allow('').max(50_000).default(''),
				passageVi: Joi.string().allow('').max(50_000).default(''),
				audioUrl: Joi.string().allow('').max(500).default(''),
				mediaUrl: Joi.string().allow('').max(500).default(''),
				imageUrl: Joi.string().allow('').max(500).default(''),
				questions: Joi.array().items(examQuestionSchema).max(50).default([]),
			}),
		)
		.max(30)
		.default([]),
	questions: Joi.array().items(examQuestionSchema).max(200).default([]),
}).custom((value, helpers) => {
	if (
		value.sectionType !== 'reading' &&
		value.sectionType !== 'listening' &&
		(value.passages?.length ?? 0) > 0
	) {
		return helpers.error('any.invalid', {
			message: 'passages chỉ dùng cho reading hoặc listening',
		});
	}
	if (!isValidPartTypeForSection(value.sectionType, value.partType)) {
		return helpers.error('any.invalid', {
			message: `partType "${value.partType}" không thuộc ${value.sectionType}`,
		});
	}
	return value;
});

const examPaperBodySchema = {
	titleVi: Joi.string().trim().max(200).allow(''),
	titleJa: Joi.string().allow('').max(200).default(''),
	year: Joi.number()
		.integer()
		.min(EXAM_MIN_YEAR)
		.max(EXAM_MAX_YEAR)
		.required()
		.messages({
			'any.required': 'MSG_003',
		}),
	session: Joi.string()
		.valid(...EXAM_SESSIONS)
		.required()
		.messages({
			'any.required': 'MSG_003',
		}),
	jlpt: Joi.string()
		.valid(...EXAM_JLPT_LEVELS)
		.required()
		.messages({
			'any.required': 'MSG_003',
		}),
	slug: Joi.string().trim().max(120).allow(''),
	descriptionVi: Joi.string().allow('').max(4000).default(''),
	descriptionJa: Joi.string().allow('').max(4000).default(''),
	durationMinutes: Joi.number().integer().min(0).default(0),
	sections: Joi.array().items(examSectionSchema).max(20).default([]),
	sourceType: Joi.string()
		.valid(...EXAM_SOURCE_TYPES)
		.default('past_exam'),
	sourceNote: Joi.string().allow('').max(500).default(''),
	thumbnailUrl: Joi.string().trim().allow('').max(500).default(''),
	listeningAudioUrl: Joi.string().trim().allow('').max(500).default(''),
	isPublished: Joi.boolean().default(false),
	displayOrder: Joi.number().integer().min(0).default(0),
};

export const createExamPaperSchema = Joi.object(examPaperBodySchema);

export const updateExamPaperSchema = Joi.object({
	...Object.fromEntries(
		Object.entries(examPaperBodySchema).map(([key, schema]) => [
			key,
			schema.optional(),
		]),
	),
}).min(1);

export const listExamPaperSchema = Joi.object({
	page: Joi.number().integer().min(1).default(1),
	limit: Joi.number().integer().min(1).max(100).default(20),
	jlpt: Joi.string()
		.valid(...EXAM_JLPT_LEVELS)
		.allow(''),
	year: Joi.number().integer().min(EXAM_MIN_YEAR).max(EXAM_MAX_YEAR),
	session: Joi.string().valid(...EXAM_SESSIONS).allow(''),
	q: Joi.string().trim().max(120).allow(''),
	isPublished: Joi.string().valid('true', 'false').allow(''),
}).unknown(false);

export const importExamSectionsSchema = Joi.object({
	version: Joi.number().valid(1).required(),
	sections: Joi.array().items(examSectionSchema).min(1).max(40).required(),
	merge: Joi.boolean().default(false),
}).unknown(false);

export const updateExamSectionsSchema = Joi.object({
	sections: Joi.array().items(examSectionSchema).max(40).required(),
}).unknown(false);

export const examTemplateQuerySchema = Joi.object({
	jlpt: Joi.string()
		.valid(...EXAM_JLPT_LEVELS)
		.default('N3'),
}).unknown(false);

export const submitExamPaperSchema = Joi.object({
	answers: Joi.object()
		.pattern(Joi.string().min(3).max(120), Joi.number().integer().min(0).max(10))
		.default({}),
}).unknown(false);

export const listExamAttemptsSchema = Joi.object({
	page: Joi.number().integer().min(1).default(1),
	limit: Joi.number().integer().min(1).max(50).default(20),
	slug: Joi.string().trim().max(120).allow(''),
}).unknown(false);
