import Joi from 'joi';
import { READING_JLPT_LEVELS, READING_STATUS } from '../constants/reading.js';

const glossSchema = Joi.object({
	vi: Joi.string().allow('').default(''),
	ja: Joi.string().allow('').default(''),
});

const vocabularySchema = Joi.object({
	termJa: Joi.string().trim().required(),
	gloss: glossSchema.default({}),
});

const questionSchema = Joi.object({
	questionJa: Joi.string().trim().required(),
	choicesJa: Joi.array().items(Joi.string().trim().min(1)).min(2).max(5).required(),
	answerIndex: Joi.number().integer().min(0).required(),
	explainPerChoice: Joi.object({
		ja: Joi.array().items(Joi.string().allow('')).default([]),
		vi: Joi.array().items(Joi.string().allow('')).default([]),
	}).default({ ja: [], vi: [] }),
});

const articleBodySchema = {
	slug: Joi.string()
		.trim()
		.lowercase()
		.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.messages({ 'string.pattern.base': 'MSG_003' }),
	jlpt: Joi.string()
		.valid(...READING_JLPT_LEVELS)
		.required(),
	titleJa: Joi.string().trim().required(),
	snippetJa: Joi.string().allow('').default(''),
	wordCount: Joi.number().integer().min(0).default(0),
	readingMinutes: Joi.number().integer().min(1).default(5),
	rating: Joi.number().min(0).max(5).default(4.5),
	imageUrl: Joi.string().allow('').default(''),
	featured: Joi.boolean().default(false),
	isPublished: Joi.boolean().default(true),
	displayOrder: Joi.number().integer().min(0).default(0),
	paragraphsJa: Joi.array().items(Joi.string().allow('')).default([]),
	vocabulary: Joi.array().items(vocabularySchema).default([]),
	questions: Joi.array().items(questionSchema).default([]),
};

export const createReadingSchema = Joi.object({
	...articleBodySchema,
	slug: articleBodySchema.slug.required(),
});

export const updateReadingSchema = Joi.object(articleBodySchema).min(1);

export const saveReadingProgressSchema = Joi.object({
	status: Joi.string().valid(...READING_STATUS),
	questionAnswers: Joi.array()
		.items(
			Joi.object({
				questionIndex: Joi.number().integer().min(0).required(),
				choiceIndex: Joi.number().integer().min(0).required(),
			}),
		)
		.optional(),
	recordAnswer: Joi.object({
		questionIndex: Joi.number().integer().min(0).required(),
		choiceIndex: Joi.number().integer().min(0).required(),
	}).optional(),
}).min(1);
