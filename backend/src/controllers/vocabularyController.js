import asyncHandler from 'express-async-handler';
import * as vocabularyService from '../services/vocabularyService.js';
import { apiSuccess } from '../utils/response.js';
import { VOCABULARY } from '../constants/messages.js';
import {
	assertDeckVisibleToUser,
	buildDeckListFilters,
} from '../utils/userDeckAccess.js';
import {
	annotateWithJlptLock,
	assertJlptUnlockedForRequest,
	buildJlptAccessMeta,
	isJlptUnlocked,
	jlptFromDeck,
} from '../utils/jlptAccess.js';
import { isAdminRequest } from '../utils/queryBool.js';
import {
	annotateVocabDeckLessonUnlock,
	assertVocabDeckLessonUnlocked,
} from '../utils/vocabLessonUnlock.js';

// Deck Controllers
export const getAllDecks = asyncHandler(async (req, res) => {
	const unlocked = req.jlptUnlocked ?? [];
	const { level, category, isActive, page, limit } = req.query;

	if (level && !isAdminRequest(req) && !isJlptUnlocked(unlocked, level)) {
		return apiSuccess(
			res,
			{
				decks: [],
				pagination: { page: 1, limit: 10, total: 0, pages: 0 },
				jlptAccess: buildJlptAccessMeta(unlocked),
				requestedJlptLocked: true,
			},
			VOCABULARY.DECK_LIST_FETCHED,
			200,
		);
	}

	const filters = buildDeckListFilters(req, { level, category, isActive });

	const { decks, pagination } = await vocabularyService.getAllDecks(filters, {
		page,
		limit,
	});

	let annotated = annotateWithJlptLock(decks, unlocked, jlptFromDeck);

	if (!isAdminRequest(req) && req.user?._id) {
		annotated = await annotateVocabDeckLessonUnlock(req.user._id, annotated);
	}

	return apiSuccess(
		res,
		{ decks: annotated, pagination, jlptAccess: buildJlptAccessMeta(unlocked) },
		VOCABULARY.DECK_LIST_FETCHED,
		200,
	);
});

export const getDeckById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const deck = await vocabularyService.getDeckById(id);
	assertDeckVisibleToUser(req, deck, { messageCode: VOCABULARY.DECK_NOT_FOUND });
	assertJlptUnlockedForRequest(req, jlptFromDeck(deck));
	if (!isAdminRequest(req)) {
		await assertVocabDeckLessonUnlocked(req.user._id, id, {
			lessonNo: req.query.lessonNo,
		});
	}

	return apiSuccess(
		res,
		{ deck, jlptAccess: buildJlptAccessMeta(req.jlptUnlocked) },
		VOCABULARY.DECK_FETCHED,
		200,
	);
});

export const getDeckWithVocabulary = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const result = await vocabularyService.getDeckWithVocabulary(id);
	assertDeckVisibleToUser(req, result.deck, { messageCode: VOCABULARY.DECK_NOT_FOUND });
	assertJlptUnlockedForRequest(req, jlptFromDeck(result.deck));
	if (!isAdminRequest(req)) {
		await assertVocabDeckLessonUnlocked(req.user._id, id, {
			lessonNo: req.query.lessonNo,
		});
	}

	return apiSuccess(
		res,
		{ ...result, jlptAccess: buildJlptAccessMeta(req.jlptUnlocked) },
		VOCABULARY.DECK_FETCHED,
		200,
	);
});

export const createDeck = asyncHandler(async (req, res) => {
	const deckData = req.body;

	const deck = await vocabularyService.createDeck(deckData);

	return apiSuccess(res, { deck }, VOCABULARY.DECK_CREATED, 201);
});

export const updateDeck = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const updateData = req.body;

	const deck = await vocabularyService.updateDeck(id, updateData);

	return apiSuccess(res, { deck }, VOCABULARY.DECK_UPDATED, 200);
});

export const deleteDeck = asyncHandler(async (req, res) => {
	const { id } = req.params;

	await vocabularyService.deleteDeck(id);

	return apiSuccess(res, null, VOCABULARY.DECK_DELETED, 200);
});

// Vocabulary Controllers
export const getVocabularyByDeck = asyncHandler(async (req, res) => {
	const { deckId } = req.params;

	const deck = await vocabularyService.getDeckById(deckId);
	assertDeckVisibleToUser(req, deck, { messageCode: VOCABULARY.DECK_NOT_FOUND });
	assertJlptUnlockedForRequest(req, jlptFromDeck(deck));
	if (!isAdminRequest(req)) {
		await assertVocabDeckLessonUnlocked(req.user._id, deckId, {
			lessonNo: req.query.lessonNo,
		});
	}
	const vocabulary = await vocabularyService.getVocabularyByDeck(deckId);

	return apiSuccess(
		res,
		{
			vocabulary,
			total: vocabulary.length,
			jlptAccess: buildJlptAccessMeta(req.jlptUnlocked),
		},
		VOCABULARY.WORD_FETCHED,
		200,
	);
});

export const createVocab = asyncHandler(async (req, res) => {
	const vocabData = req.body;

	const vocab = await vocabularyService.createVocab(vocabData);

	return apiSuccess(res, { vocab }, VOCABULARY.WORD_CREATED, 201);
});

export const updateVocab = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const updateData = req.body;

	const vocab = await vocabularyService.updateVocab(id, updateData);

	return apiSuccess(res, { vocab }, VOCABULARY.WORD_UPDATED, 200);
});

export const deleteVocab = asyncHandler(async (req, res) => {
	const { id } = req.params;

	await vocabularyService.deleteVocab(id);

	return apiSuccess(res, null, VOCABULARY.WORD_DELETED, 200);
});

// Import JSON for bulk creation
export const importVocabularyFromJSON = asyncHandler(async (req, res) => {
	const { deckId, vocabularyList } = req.body;

	if (!Array.isArray(vocabularyList) || vocabularyList.length === 0) {
		return apiSuccess(res, { created: 0, vocabulary: [] }, VOCABULARY.WORD_CREATED, 200);
	}

	const result = await vocabularyService.bulkCreateVocabulary(deckId, vocabularyList);

	return apiSuccess(res, result, VOCABULARY.WORD_CREATED, 201);
});

// AI Generate vocabulary
export const generateVocabularyWithAI = asyncHandler(async (req, res) => {
	const {
		deckId,
		prompt = '',
		templateName = 'n5-basic',
		count = 10,
		autoCreate = false,
	} = req.body;

	if (!templateName || String(templateName).trim().length === 0) {
		return apiSuccess(res, { vocabulary: [], count: 0 }, VOCABULARY.WORD_CREATED, 400);
	}

	const result = await vocabularyService.generateVocabularyWithAI({
		deckId,
		templateName: String(templateName).trim().toLowerCase(),
		prompt: String(prompt ?? '').trim(),
		count: Math.min(Math.max(1, Number(count) || 10), 25),
		autoCreate,
	});

	const statusCode = autoCreate ? 201 : 200;
	return apiSuccess(res, result, VOCABULARY.WORD_CREATED, statusCode);
});
