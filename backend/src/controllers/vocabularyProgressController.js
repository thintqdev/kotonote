import asyncHandler from 'express-async-handler';
import * as vocabularyProgressService from '../services/vocabularyProgressService.js';
import * as vocabularyService from '../services/vocabularyService.js';
import { apiSuccess } from '../utils/response.js';
import { VOCABULARY } from '../constants/messages.js';
import { assertJlptUnlocked, jlptFromDeck } from '../utils/jlptAccess.js';
import { assertVocabDeckLessonUnlocked } from '../utils/vocabLessonUnlock.js';

export const getMyDeckProgress = asyncHandler(async (req, res) => {
	const { jlpt } = req.query;
	const progress = await vocabularyProgressService.listDeckProgress(req.user._id, {
		jlpt,
	});

	return apiSuccess(res, { progress }, VOCABULARY.PROGRESS_LIST_FETCHED, 200);
});

export const getDeckProgressById = asyncHandler(async (req, res) => {
	const { deckId } = req.params;
	const deck = await vocabularyService.getDeckById(deckId);
	assertJlptUnlocked(req.jlptUnlocked, jlptFromDeck(deck));
	// Chỉ đọc progress — không chặn (tránh lệch thứ tự deck vs UI); học/advance vẫn assert
	const result = await vocabularyProgressService.getDeckProgress(
		req.user._id,
		deckId,
	);

	return apiSuccess(res, result, VOCABULARY.PROGRESS_FETCHED, 200);
});

export const advanceDeckProgress = asyncHandler(async (req, res) => {
	const { deckId } = req.params;
	const deck = await vocabularyService.getDeckById(deckId);
	assertJlptUnlocked(req.jlptUnlocked, jlptFromDeck(deck));
	await assertVocabDeckLessonUnlocked(req.user._id, deckId, {
		lessonNo: req.query.lessonNo,
	});
	const result = await vocabularyProgressService.advanceDeckProgress(
		req.user._id,
		deckId,
	);

	return apiSuccess(res, result, VOCABULARY.PROGRESS_ADVANCED, 200);
});
