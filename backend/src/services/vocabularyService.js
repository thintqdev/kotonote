import * as vocabularyRepository from '../repositories/vocabularyRepository.js';
import { VOCABULARY, COMMON } from '../constants/messages.js';
import { MAX_WORDS_PER_DECK } from '../constants/vocabulary.js';
import { getAIPrompt } from '../utils/promptLoader.js';

const DEFAULT_DECK_PAGE = 1;
const DEFAULT_DECK_PAGE_SIZE = 50;
const MAX_DECK_PAGE_SIZE = 100;

function normalizeDeckPagination(query = {}) {
	const page = Math.max(1, Number.parseInt(String(query.page ?? DEFAULT_DECK_PAGE), 10) || DEFAULT_DECK_PAGE);
	const rawLimit = Number.parseInt(String(query.limit ?? DEFAULT_DECK_PAGE_SIZE), 10) || DEFAULT_DECK_PAGE_SIZE;
	const limit = Math.min(Math.max(1, rawLimit), MAX_DECK_PAGE_SIZE);
	return { page, limit, skip: (page - 1) * limit };
}

// Deck Services
/**
 * Danh sách deck có phân trang; mỗi deck có `wordCount` (từ active) và `totalWords` khớp số đếm thực tế.
 * @param {Record<string, unknown>} filters
 * @param {{ page?: number, limit?: number }} [pagination]
 */
export const getAllDecks = async (filters = {}, pagination = {}) => {
	const { page, limit, skip } = normalizeDeckPagination(pagination);

	const [total, decks] = await Promise.all([
		vocabularyRepository.countDecks(filters),
		vocabularyRepository.findDecksPaginated(filters, { skip, limit }),
	]);

	const ids = decks.map((d) => d._id);
	const countByDeck = await vocabularyRepository.countActiveVocabByDeckIds(ids);

	const decksOut = decks.map((d) => {
		const wordCount = countByDeck.get(String(d._id)) ?? 0;
		return {
			...d,
			wordCount,
			totalWords: wordCount,
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

export const getDeckById = async (deckId) => {
	const deck = await vocabularyRepository.findDeckById(deckId);

	if (!deck) {
		throw { messageCode: VOCABULARY.DECK_NOT_FOUND, statusCode: 404 };
	}

	return deck;
};

export const createDeck = async (deckData) => {
	const deck = await vocabularyRepository.createDeck(deckData);
	return deck;
};

export const updateDeck = async (deckId, updateData) => {
	const deck = await vocabularyRepository.updateDeck(deckId, updateData);

	if (!deck) {
		throw { messageCode: VOCABULARY.DECK_NOT_FOUND, statusCode: 404 };
	}

	return deck;
};

export const deleteDeck = async (deckId) => {
	// Delete all vocabulary in deck first
	const vocabList = await vocabularyRepository.findVocabByDeck(deckId);
	for (const vocab of vocabList) {
		await vocabularyRepository.deleteVocab(vocab._id);
	}

	const deck = await vocabularyRepository.deleteDeck(deckId);

	if (!deck) {
		throw { messageCode: VOCABULARY.DECK_NOT_FOUND, statusCode: 404 };
	}

	return deck;
};

export const getDeckWithVocabulary = async (deckId) => {
	const deck = await getDeckById(deckId);
	const vocabulary = await vocabularyRepository.findVocabByDeck(deckId);

	return {
		deck,
		vocabulary,
		totalWords: vocabulary.length,
	};
};

// Vocabulary Services
export const getVocabularyByDeck = async (deckId) => {
	return await vocabularyRepository.findVocabByDeck(deckId);
};

export const getVocabById = async (vocabId) => {
	const vocab = await vocabularyRepository.findVocabById(vocabId);

	if (!vocab) {
		throw { messageCode: VOCABULARY.WORD_NOT_FOUND, statusCode: 404 };
	}

	return vocab;
};

export const createVocab = async (vocabData) => {
	// Check if deck exists
	const deck = await getDeckById(vocabData.deckId);

	// Check if deck is full (max 25 words)
	const count = await vocabularyRepository.countVocabInDeck(vocabData.deckId);
	if (count >= MAX_WORDS_PER_DECK) {
		throw { messageCode: VOCABULARY.DECK_FULL, statusCode: 400 };
	}

	const vocab = await vocabularyRepository.createVocab(vocabData);

	// Update deck totalWords
	await vocabularyRepository.updateDeck(vocabData.deckId, {
		totalWords: count + 1,
	});

	return vocab;
};

export const updateVocab = async (vocabId, updateData) => {
	const vocab = await vocabularyRepository.updateVocab(vocabId, updateData);

	if (!vocab) {
		throw { messageCode: VOCABULARY.WORD_NOT_FOUND, statusCode: 404 };
	}

	return vocab;
};

export const deleteVocab = async (vocabId) => {
	const vocab = await vocabularyRepository.findVocabById(vocabId);

	if (!vocab) {
		throw { messageCode: VOCABULARY.WORD_NOT_FOUND, statusCode: 404 };
	}

	const deckId = vocab.deckId;

	await vocabularyRepository.deleteVocab(vocabId);

	// Update deck totalWords
	const count = await vocabularyRepository.countVocabInDeck(deckId);
	await vocabularyRepository.updateDeck(deckId, { totalWords: count });

	return vocab;
};


/**
 * Bulk create vocabulary from JSON import
 */
export const bulkCreateVocabulary = async (deckId, vocabularyList) => {
	// Verify deck exists
	await getDeckById(deckId);

	// Check deck size limit
	const currentCount = await vocabularyRepository.countVocabularyInDeck(deckId);
	if (currentCount + vocabularyList.length > MAX_WORDS_PER_DECK) {
		throw { messageCode: VOCABULARY.DECK_FULL, statusCode: 400 };
	}

	// Add deckId to all vocabulary
	const vocabularyWithDeck = vocabularyList.map(v => ({ ...v, deckId }));

	try {
		const result = await vocabularyRepository.bulkCreateVocabulary(vocabularyWithDeck);
		const count = await vocabularyRepository.countVocabularyInDeck(deckId);
		await vocabularyRepository.updateDeck(deckId, { totalWords: count });
		return {
			created: result.length,
			vocabulary: result,
		};
	} catch (error) {
		if (error.code === 11000) {
			throw { messageCode: COMMON.BAD_REQUEST, statusCode: 400 };
		}
		throw error;
	}
};

/**
 * Generate vocabulary with AI
 */
export const generateVocabularyWithAI = async ({ deckId, prompt, count, autoCreate, templateName = 'n3-daily' }) => {
	// Verify deck exists if deckId provided
	if (deckId) {
		await getDeckById(deckId);
	}

	// Get existing vocabulary in deck to avoid duplicates
	const existingVocab = deckId ? await vocabularyRepository.findVocabByDeck(deckId) : [];
	const existingWords = existingVocab.map(v => v.word);

	// Use AI service to generate vocabulary
	const { generateVocabularyWithAI: aiGenerate } = await import('./aiService.js');
	const aiResult = await aiGenerate({
		templateName,
		count,
		existingWords,
		customPrompt: prompt || '',
	});

	// Add display order to generated vocabulary
	const vocabularyWithOrder = aiResult.vocabulary.map((v, index) => ({
		...v,
		displayOrder: existingVocab.length + index + 1,
	}));

	// Auto-create in database if requested
	if (autoCreate && deckId && vocabularyWithOrder.length > 0) {
		const result = await bulkCreateVocabulary(deckId, vocabularyWithOrder);
		return {
			...result,
			promptUsed: aiResult.promptUsed,
			templateName: aiResult.templateName,
		};
	}

	return {
		vocabulary: vocabularyWithOrder,
		count: vocabularyWithOrder.length,
		promptUsed: aiResult.promptUsed,
		templateName: aiResult.templateName,
	};
};
