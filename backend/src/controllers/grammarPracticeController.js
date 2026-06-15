import asyncHandler from 'express-async-handler';
import { apiSuccess, apiError } from '../utils/response.js';
import { COMMON } from '../constants/messages.js';
import { assertJlptUnlocked } from '../utils/jlptAccess.js';
import { grammarPracticeQuizQuerySchema } from '../validators/grammarPracticeValidator.js';
import * as grammarPracticeService from '../services/grammarPracticeService.js';

/**
 * @route GET /api/grammar/practice/quiz
 * @access Private
 */
export const getGrammarPracticeQuiz = asyncHandler(async (req, res) => {
	const { error, value } = grammarPracticeQuizQuerySchema.validate(req.query, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((d) => ({
			field: d.path.join('.'),
			message: d.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}

	assertJlptUnlocked(req.jlptUnlocked, value.jlpt);

	const result = await grammarPracticeService.buildGrammarPracticeQuiz(value);
	return apiSuccess(
		res,
		{ questions: result.questions, meta: result.meta },
		result.messageCode,
		200,
	);
});
