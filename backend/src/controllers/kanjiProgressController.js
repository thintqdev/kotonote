import asyncHandler from 'express-async-handler';
import * as kanjiProgressService from '../services/kanjiProgressService.js';
import { apiSuccess } from '../utils/response.js';
import { KANJI } from '../constants/messages.js';

export const getMyDeckProgress = asyncHandler(async (req, res) => {
	const { jlpt } = req.query;
	const progress = await kanjiProgressService.listDeckProgress(req.user._id, {
		jlpt,
	});

	return apiSuccess(res, { progress }, KANJI.PROGRESS_LIST_FETCHED, 200);
});

export const getDeckProgressById = asyncHandler(async (req, res) => {
	const { deckId } = req.params;
	const result = await kanjiProgressService.getDeckProgress(
		req.user._id,
		deckId,
	);

	return apiSuccess(res, result, KANJI.PROGRESS_FETCHED, 200);
});

export const advanceDeckProgress = asyncHandler(async (req, res) => {
	const { deckId } = req.params;
	const result = await kanjiProgressService.advanceDeckProgress(
		req.user._id,
		deckId,
	);

	return apiSuccess(res, result, KANJI.PROGRESS_ADVANCED, 200);
});
