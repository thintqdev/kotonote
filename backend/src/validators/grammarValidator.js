import Joi from 'joi';
import {
	GRAMMAR_JLPT_LEVELS,
	GRAMMAR_TAG_IDS,
} from '../constants/grammar.js';

const locSchema = Joi.object({
	ja: Joi.string().allow('').default(''),
	vi: Joi.string().allow('').default(''),
});

const exampleSchema = Joi.object({
	ja: Joi.string().allow('').default(''),
	vi: Joi.string().allow('').default(''),
});

const compareRowSchema = Joi.object({
	label: locSchema.default({}),
	cells: Joi.array().items(locSchema).default([]),
});

const grammarBodySchema = {
	slug: Joi.string()
		.trim()
		.lowercase()
		.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.messages({ 'string.pattern.base': 'MSG_003' }),
	jlpt: Joi.string()
		.valid(...GRAMMAR_JLPT_LEVELS)
		.required()
		.messages({ 'any.only': 'MSG_003', 'any.required': 'MSG_003' }),
	pattern: Joi.string().trim().required().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	tagIds: Joi.array()
		.items(Joi.string().valid(...GRAMMAR_TAG_IDS))
		.default([]),
	isPublished: Joi.boolean().default(true),
	displayOrder: Joi.number().integer().min(0).default(0),
	teaser: locSchema.default({}),
	topicRibbon: locSchema.default({}),
	connection: locSchema.default({}),
	meaning: locSchema.default({}),
	usage: locSchema.default({}),
	usageNote: locSchema.default({}),
	pointBubble: locSchema.default({}),
	examples: Joi.array().items(exampleSchema).default([]),
	ng: Joi.object({
		ja: Joi.array().items(Joi.string().allow('')).default([]),
		vi: Joi.array().items(Joi.string().allow('')).default([]),
	}).default({ ja: [], vi: [] }),
	ngNote: locSchema.default({}),
	compare: Joi.object({
		caption: locSchema.default({}),
		colLabels: Joi.array().items(locSchema).default([]),
		rows: Joi.array().items(compareRowSchema).default([]),
	}).default({ caption: {}, colLabels: [], rows: [] }),
	memo: locSchema.default({}),
	practice: Joi.object({
		items: Joi.array().items(locSchema).default([]),
	}).default({ items: [] }),
};

export const createGrammarSchema = Joi.object({
	...grammarBodySchema,
	slug: grammarBodySchema.slug.required(),
});

export const updateGrammarSchema = Joi.object(grammarBodySchema).min(1);
