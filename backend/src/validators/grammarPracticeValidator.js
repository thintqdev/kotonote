import Joi from 'joi';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';
import {
	GRAMMAR_PRACTICE_COUNT_MAX,
	GRAMMAR_PRACTICE_COUNT_MIN,
} from '../constants/grammarPractice.js';

export const grammarPracticeQuizQuerySchema = Joi.object({
	jlpt: Joi.string()
		.valid(...GRAMMAR_JLPT_LEVELS)
		.required(),
	count: Joi.number()
		.integer()
		.min(GRAMMAR_PRACTICE_COUNT_MIN)
		.max(GRAMMAR_PRACTICE_COUNT_MAX)
		.default(10),
});

export const generateGrammarPracticeSchema = Joi.object({
	jlpt: Joi.string()
		.valid(...GRAMMAR_JLPT_LEVELS)
		.required(),
	count: Joi.number()
		.integer()
		.min(GRAMMAR_PRACTICE_COUNT_MIN)
		.max(GRAMMAR_PRACTICE_COUNT_MAX)
		.default(10),
	isPublished: Joi.boolean().default(true),
});

const grammarPracticeQuestionImportSchema = Joi.object({
	type: Joi.string()
		.valid('grammar_form', 'particle', 'conjugation', 'usage')
		.default('grammar_form'),
	promptJa: Joi.string().trim().min(1).max(2000).required(),
	promptVi: Joi.string().trim().max(2000).allow('').default(''),
	options: Joi.array().items(Joi.string().trim().max(500)).min(2).max(4).required(),
	answerIndex: Joi.number().integer().min(0).max(3).default(0),
	explainVi: Joi.string().trim().max(2000).allow('').default(''),
	pattern: Joi.string().trim().max(200).allow('').default(''),
});

export const importGrammarPracticeSchema = Joi.object({
	jlpt: Joi.string()
		.valid(...GRAMMAR_JLPT_LEVELS)
		.required(),
	isPublished: Joi.boolean().default(true),
	items: Joi.array().items(grammarPracticeQuestionImportSchema).min(1).max(200).required(),
});

export const updateGrammarPracticeQuestionSchema = Joi.object({
	isPublished: Joi.boolean(),
	displayOrder: Joi.number().integer().min(0),
	type: Joi.string().valid('grammar_form', 'particle', 'conjugation', 'usage'),
	promptJa: Joi.string().trim().min(1).max(2000),
	promptVi: Joi.string().trim().max(2000).allow(''),
	options: Joi.array().items(Joi.string().trim().max(500)).length(4),
	answerIndex: Joi.number().integer().min(0).max(3),
	explainVi: Joi.string().trim().max(2000).allow(''),
	pattern: Joi.string().trim().max(200).allow(''),
}).min(1);
