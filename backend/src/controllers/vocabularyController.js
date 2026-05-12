import asyncHandler from 'express-async-handler';
import * as vocabularyService from '../services/vocabularyService.js';
import { apiSuccess } from '../utils/response.js';
import { VOCABULARY } from '../constants/messages.js';

// Deck Controllers
export const getAllDecks = asyncHandler(async (req, res) => {
	const { level, category, isActive } = req.query;
	
	const filters = {};
	if (level) filters.level = level;
	if (category) filters.category = category;
	if (isActive !== undefined) filters.isActive = isActive === 'true';
	
	const decks = await vocabularyService.getAllDecks(filters);
	
	return apiSuccess(res, { decks, total: decks.length }, VOCABULARY.DECK_LIST_FETCHED, 200);
});

export const getDeckById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	
	const deck = await vocabularyService.getDeckById(id);
	
	return apiSuccess(res, { deck }, VOCABULARY.DECK_FETCHED, 200);
});

export const getDeckWithVocabulary = asyncHandler(async (req, res) => {
	const { id } = req.params;
	
	const result = await vocabularyService.getDeckWithVocabulary(id);
	
	return apiSuccess(res, result, VOCABULARY.DECK_FETCHED, 200);
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
	
	const vocabulary = await vocabularyService.getVocabularyByDeck(deckId);
	
	return apiSuccess(res, { vocabulary, total: vocabulary.length }, VOCABULARY.WORD_FETCHED, 200);
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
	const { deckId, prompt, count = 10, autoCreate = false } = req.body;
	
	if (!prompt || prompt.trim().length === 0) {
		return apiSuccess(res, { vocabulary: [], count: 0 }, VOCABULARY.WORD_CREATED, 400);
	}
	
	const result = await vocabularyService.generateVocabularyWithAI({
		deckId,
		prompt: prompt.trim(),
		count: Math.min(count, 25),
		autoCreate,
	});
	
	const statusCode = autoCreate ? 201 : 200;
	return apiSuccess(res, result, VOCABULARY.WORD_CREATED, statusCode);
});
