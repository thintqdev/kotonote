import * as kanjiRepository from '../repositories/kanjiRepository.js';
import { KANJI_DECK_MAX_SIZE } from '../constants/kanji.js';
import AppError from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';

const DEFAULT_DECK_PAGE = 1;
const DEFAULT_DECK_PAGE_SIZE = 50;
const MAX_DECK_PAGE_SIZE = 100;

function normalizeDeckPagination(query = {}) {
	const page = Math.max(1, Number.parseInt(String(query.page ?? DEFAULT_DECK_PAGE), 10) || DEFAULT_DECK_PAGE);
	const rawLimit = Number.parseInt(String(query.limit ?? DEFAULT_DECK_PAGE_SIZE), 10) || DEFAULT_DECK_PAGE_SIZE;
	const limit = Math.min(Math.max(1, rawLimit), MAX_DECK_PAGE_SIZE);
	return { page, limit, skip: (page - 1) * limit };
}

// ============ DECK SERVICES ============

/**
 * Danh sách deck có phân trang; mỗi deck có `kanjiCount`.
 * @param {Record<string, unknown>} filters — jlpt, isActive
 * @param {{ page?: number, limit?: number }} [pagination]
 */
export const getAllDecks = async (filters = {}, pagination = {}) => {
	const { page, limit, skip } = normalizeDeckPagination(pagination);

	const [total, decks] = await Promise.all([
		kanjiRepository.countDecks(filters),
		kanjiRepository.findDecksPaginated(filters, { skip, limit }),
	]);

	const ids = decks.map((d) => d._id);
	const countByDeck = await kanjiRepository.countKanjiByDeckIds(ids);

	const decksOut = decks.map((d) => {
		const kanjiCount = countByDeck.get(String(d._id)) ?? 0;
		return {
			...d,
			kanjiCount,
		};
	});

	return {
		decks: decksOut,
		pagination: {
			page,
			limit,
			total,
			pages: total === 0 ? 0 : Math.ceil(total / limit),
		},
	};
};

/**
 * Get deck by ID
 */
export const getDeckById = async (id) => {
	const deck = await kanjiRepository.findDeckById(id);
	if (!deck) {
		throw new AppError(MESSAGES.MSG_905, 404);
	}
	return deck;
};

/**
 * Get deck with kanji
 */
export const getDeckWithKanji = async (id) => {
	const deck = await getDeckById(id);
	const kanji = await kanjiRepository.findKanjiByDeck(id);

	return {
		deck,
		kanji,
		count: kanji.length,
	};
};

/**
 * Create new deck
 */
export const createDeck = async (deckData) => {
	return await kanjiRepository.createDeck(deckData);
};

/**
 * Update deck
 */
export const updateDeck = async (id, updateData) => {
	const deck = await kanjiRepository.updateDeck(id, updateData);
	if (!deck) {
		throw new AppError(MESSAGES.MSG_905, 404);
	}
	return deck;
};

/**
 * Delete deck
 */
export const deleteDeck = async (id) => {
	const deck = await kanjiRepository.deleteDeck(id);
	if (!deck) {
		throw new AppError(MESSAGES.MSG_905, 404);
	}
	
	// Delete all kanji in this deck
	await kanjiRepository.deleteKanjiByDeck(id);
	
	return deck;
};

// ============ KANJI SERVICES ============

/**
 * Get kanji by deck ID
 */
export const getKanjiByDeck = async (deckId) => {
	// Verify deck exists
	await getDeckById(deckId);
	return await kanjiRepository.findKanjiByDeck(deckId);
};

/**
 * Get kanji by ID
 */
export const getKanjiById = async (id) => {
	const kanji = await kanjiRepository.findKanjiById(id);
	if (!kanji) {
		throw new AppError(MESSAGES.MSG_904, 404);
	}
	return kanji;
};

/**
 * Create new kanji
 */
export const createKanji = async (kanjiData) => {
	// Verify deck exists
	await getDeckById(kanjiData.deckId);
	
	// Check deck size limit
	const count = await kanjiRepository.countKanjiInDeck(kanjiData.deckId);
	if (count >= KANJI_DECK_MAX_SIZE) {
		throw new AppError(MESSAGES.MSG_912, 400);
	}
	
	return await kanjiRepository.createKanji(kanjiData);
};

/**
 * Update kanji
 */
export const updateKanji = async (id, updateData) => {
	const kanji = await kanjiRepository.updateKanji(id, updateData);
	if (!kanji) {
		throw new AppError(MESSAGES.MSG_904, 404);
	}
	return kanji;
};

/**
 * Delete kanji
 */
export const deleteKanji = async (id) => {
	const kanji = await kanjiRepository.deleteKanji(id);
	if (!kanji) {
		throw new AppError(MESSAGES.MSG_904, 404);
	}
	return kanji;
};

/**
 * Bulk create kanji
 */
export const bulkCreateKanji = async (deckId, kanjiList) => {
	// Verify deck exists
	await getDeckById(deckId);
	
	// Check deck size limit
	const currentCount = await kanjiRepository.countKanjiInDeck(deckId);
	if (currentCount + kanjiList.length > KANJI_DECK_MAX_SIZE) {
		throw new AppError(MESSAGES.MSG_912, 400);
	}
	
	// Add deckId to all kanji
	const kanjiWithDeck = kanjiList.map(k => ({ ...k, deckId }));
	
	try {
		const result = await kanjiRepository.bulkCreateKanji(kanjiWithDeck);
		return {
			created: result.length,
			kanji: result,
		};
	} catch (error) {
		if (error.code === 11000) {
			throw new AppError(MESSAGES.MSG_905, 400);
		}
		throw error;
	}
};


/**
 * Generate kanji with AI
 */
export const generateKanjiWithAI = async ({ deckId, prompt, count, autoCreate, templateName = 'n3-intermediate' }) => {
	// Verify deck exists if deckId provided
	if (deckId) {
		await getDeckById(deckId);
	}
	
	// Get existing kanji in deck to avoid duplicates
	const existingKanji = deckId ? await kanjiRepository.findKanjiByDeck(deckId) : [];
	const existingChars = existingKanji.map(k => k.char);
	
	// Use AI service to generate kanji
	const { generateKanjiWithAI: aiGenerate } = await import('./aiService.js');
	const aiResult = await aiGenerate({
		templateName,
		count,
		existingChars,
		customPrompt: prompt || '',
	});
	
	// Add display order to generated kanji
	const kanjiWithOrder = aiResult.kanji.map((k, index) => ({
		...k,
		displayOrder: existingKanji.length + index + 1,
	}));
	
	// Auto-create in database if requested
	if (autoCreate && deckId && kanjiWithOrder.length > 0) {
		const result = await bulkCreateKanji(deckId, kanjiWithOrder);
		return {
			...result,
			promptUsed: aiResult.promptUsed,
			templateName: aiResult.templateName,
		};
	}
	
	return {
		kanji: kanjiWithOrder,
		count: kanjiWithOrder.length,
		promptUsed: aiResult.promptUsed,
		templateName: aiResult.templateName,
	};
};
