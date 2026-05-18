import asyncHandler from 'express-async-handler';
import * as vocabularyProgressService from '../services/vocabularyProgressService.js';
import { apiSuccess } from '../utils/response.js';
import { VOCABULARY } from '../constants/messages.js';

export const getMyDeckProgress = asyncHandler(async (req, res) => {
	const { jlpt } = req.query;
	const progress = await vocabularyProgressService.listDeckProgress(req.user._id, {
		jlpt,
	});

	return apiSuccess(res, { progress }, VOCABULARY.PROGRESS_LIST_FETCHED, 200);
});

export const getDeckProgressById = asyncHandler(async (req, res) => {
	const { deckId } = req.params;
	const result = await vocabularyProgressService.getDeckProgress(
		req.user._id,
		deckId,
	);

	return apiSuccess(res, result, VOCABULARY.PROGRESS_FETCHED, 200);
});

export const advanceDeckProgress = asyncHandler(async (req, res) => {
	const { deckId } = req.params;
	const result = await vocabularyProgressService.advanceDeckProgress(
		req.user._id,
		deckId,
	);

	return apiSuccess(res, result, VOCABULARY.PROGRESS_ADVANCED, 200);
});
