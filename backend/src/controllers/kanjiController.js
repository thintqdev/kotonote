import asyncHandler from 'express-async-handler';
import * as kanjiService from '../services/kanjiService.js';
import { apiSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';
import {
	assertDeckVisibleToUser,
	buildDeckListFilters,
} from '../utils/userDeckAccess.js';

// ============ DECK CONTROLLERS ============

/**
 * @desc    Get all kanji decks
 * @route   GET /api/kanji/decks
 * @access  Private (User)
 */
export const getAllDecks = asyncHandler(async (req, res) => {
	const { jlpt, isActive, page, limit } = req.query;
	const filters = buildDeckListFilters(req, { jlpt, isActive });

	const { decks, pagination } = await kanjiService.getAllDecks(filters, {
		page,
		limit,
	});

	return apiSuccess(res, { decks, pagination }, MESSAGES.MSG_906, 200);
});

/**
 * @desc    Get deck by ID
 * @route   GET /api/kanji/decks/:id
 * @access  Private (User)
 */
export const getDeckById = asyncHandler(async (req, res) => {
	const deck = await kanjiService.getDeckById(req.params.id);
	assertDeckVisibleToUser(req, deck);

	return apiSuccess(res, { deck }, MESSAGES.MSG_904, 200);
});

/**
 * @desc    Get deck with kanji
 * @route   GET /api/kanji/decks/:id/kanji
 * @access  Private (User)
 */
export const getDeckWithKanji = asyncHandler(async (req, res) => {
	const result = await kanjiService.getDeckWithKanji(req.params.id);
	assertDeckVisibleToUser(req, result.deck);

	return apiSuccess(res, result, MESSAGES.MSG_906, 200);
});

/**
 * @desc    Create kanji deck
 * @route   POST /api/admin/kanji/decks
 * @access  Admin
 */
export const createDeck = asyncHandler(async (req, res) => {
	const deck = await kanjiService.createDeck(req.body);
	
	return apiSuccess(res, { deck }, MESSAGES.MSG_901, 201);
});

/**
 * @desc    Update kanji deck
 * @route   PUT /api/admin/kanji/decks/:id
 * @access  Admin
 */
export const updateDeck = asyncHandler(async (req, res) => {
	const deck = await kanjiService.updateDeck(req.params.id, req.body);
	
	return apiSuccess(res, { deck }, MESSAGES.MSG_902, 200);
});

/**
 * @desc    Delete kanji deck
 * @route   DELETE /api/admin/kanji/decks/:id
 * @access  Admin
 */
export const deleteDeck = asyncHandler(async (req, res) => {
	await kanjiService.deleteDeck(req.params.id);
	
	return apiSuccess(res, null, MESSAGES.MSG_903, 200);
});

// ============ KANJI CONTROLLERS ============

/**
 * @desc    Get kanji by deck
 * @route   GET /api/kanji/deck/:deckId/kanji
 * @access  Private (User)
 */
export const getKanjiByDeck = asyncHandler(async (req, res) => {
	const deck = await kanjiService.getDeckById(req.params.deckId);
	assertDeckVisibleToUser(req, deck);
	const kanji = await kanjiService.getKanjiByDeck(req.params.deckId);

	return apiSuccess(res, {
		kanji,
		total: kanji.length,
	}, MESSAGES.MSG_906, 200);
});

/**
 * @desc    Get kanji by ID
 * @route   GET /api/kanji/:id
 * @access  Private (User)
 */
export const getKanjiById = asyncHandler(async (req, res) => {
	const kanji = await kanjiService.getKanjiById(req.params.id);
	const deck = await kanjiService.getDeckById(kanji.deckId);
	assertDeckVisibleToUser(req, deck);

	return apiSuccess(res, { kanji }, MESSAGES.MSG_904, 200);
});

/**
 * @desc    Create kanji
 * @route   POST /api/admin/kanji/kanji
 * @access  Admin
 */
export const createKanji = asyncHandler(async (req, res) => {
	const kanji = await kanjiService.createKanji(req.body);
	
	return apiSuccess(res, { kanji }, MESSAGES.MSG_901, 201);
});

/**
 * @desc    Update kanji
 * @route   PUT /api/admin/kanji/kanji/:id
 * @access  Admin
 */
export const updateKanji = asyncHandler(async (req, res) => {
	const kanji = await kanjiService.updateKanji(req.params.id, req.body);
	
	return apiSuccess(res, { kanji }, MESSAGES.MSG_902, 200);
});

/**
 * @desc    Delete kanji
 * @route   DELETE /api/admin/kanji/kanji/:id
 * @access  Admin
 */
export const deleteKanji = asyncHandler(async (req, res) => {
	await kanjiService.deleteKanji(req.params.id);
	
	return apiSuccess(res, null, MESSAGES.MSG_903, 200);
});

/**
 * @desc    Bulk create kanji
 * @route   POST /api/admin/kanji/decks/:deckId/bulk
 * @access  Admin
 */
export const bulkCreateKanji = asyncHandler(async (req, res) => {
	const { kanjiList } = req.body;
	const result = await kanjiService.bulkCreateKanji(req.params.deckId, kanjiList);
	
	return apiSuccess(res, result, MESSAGES.MSG_901, 201);
});


// ============ IMPORT & AI GENERATION ============

/**
 * @desc    Import kanji from JSON
 * @route   POST /api/admin/kanji/decks/:deckId/import
 * @access  Admin
 */
export const importKanjiFromJSON = asyncHandler(async (req, res) => {
	const { kanjiList } = req.body;
	const { deckId } = req.params;
	
	if (!Array.isArray(kanjiList) || kanjiList.length === 0) {
		return apiSuccess(res, { created: 0, kanji: [] }, MESSAGES.MSG_901, 200);
	}
	
	const result = await kanjiService.bulkCreateKanji(deckId, kanjiList);
	
	return apiSuccess(res, result, MESSAGES.MSG_901, 201);
});

