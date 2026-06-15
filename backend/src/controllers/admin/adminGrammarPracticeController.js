import asyncHandler from 'express-async-handler';
import { apiSuccess, apiError, apiPaginated } from '../../utils/response.js';
import { COMMON, GRAMMAR } from '../../constants/messages.js';
import {
	generateGrammarPracticeSchema,
	importGrammarPracticeSchema,
	updateGrammarPracticeQuestionSchema,
} from '../../validators/grammarPracticeValidator.js';
import * as adminGrammarPracticeService from '../../services/adminGrammarPracticeService.js';

export const listGrammarPracticeQuestions = asyncHandler(async (req, res) => {
	const result = await adminGrammarPracticeService.listGrammarPracticeQuestions(req.query);
	return apiPaginated(res, { items: result.items }, result.pagination, result.messageCode, 200);
});

export const getGrammarPracticeQuestionById = asyncHandler(async (req, res) => {
	const question = await adminGrammarPracticeService.getGrammarPracticeQuestionById(req.params.id);
	return apiSuccess(res, { question }, GRAMMAR.FETCHED, 200);
});

export const importGrammarPracticeQuestions = asyncHandler(async (req, res) => {
	const { error, value } = importGrammarPracticeSchema.validate(req.body, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((d) => ({
			field: d.path.join('.'),
			message: d.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}

	const result = await adminGrammarPracticeService.importGrammarPracticeQuestions(value);
	return apiSuccess(
		res,
		{
			jlpt: result.jlpt,
			inserted: result.inserted,
			skipped: result.skipped,
			errors: result.errors,
		},
		result.messageCode,
		201,
	);
});

export const generateGrammarPracticeQuestions = asyncHandler(async (req, res) => {
	const { error, value } = generateGrammarPracticeSchema.validate(req.body, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((d) => ({
			field: d.path.join('.'),
			message: d.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}

	const result = await adminGrammarPracticeService.generateAndSaveGrammarPracticeQuestions(value);
	return apiSuccess(
		res,
		{ jlpt: result.jlpt, inserted: result.inserted },
		result.messageCode,
		201,
	);
});

export const updateGrammarPracticeQuestion = asyncHandler(async (req, res) => {
	const { error, value } = updateGrammarPracticeQuestionSchema.validate(req.body, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((d) => ({
			field: d.path.join('.'),
			message: d.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}

	const result = await adminGrammarPracticeService.updateGrammarPracticeQuestion(
		req.params.id,
		value,
	);
	return apiSuccess(res, { question: result.question }, result.messageCode, 200);
});

export const deleteGrammarPracticeQuestion = asyncHandler(async (req, res) => {
	const result = await adminGrammarPracticeService.deleteGrammarPracticeQuestion(req.params.id);
	return apiSuccess(res, null, result.messageCode, 200);
});
