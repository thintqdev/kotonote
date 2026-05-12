import Kanji from '../models/Kanji.js';
import KanjiDeck from '../models/KanjiDeck.js';

// ============ DECK OPERATIONS ============

/**
 * Get all kanji decks with optional filters
 */
export const findAllDecks = async (filters = {}) => {
	const query = {};
	
	if (filters.jlpt) {
		query.jlpt = filters.jlpt;
	}
	
	if (filters.isActive !== undefined) {
		query.isActive = filters.isActive;
	}
	
	return await KanjiDeck.find(query).sort({ jlpt: 1, displayOrder: 1 });
};

/**
 * Get deck by ID
 */
export const findDeckById = async (id) => {
	return await KanjiDeck.findById(id);
};

/**
 * Create new deck
 */
export const createDeck = async (deckData) => {
	const deck = new KanjiDeck(deckData);
	return await deck.save();
};

/**
 * Update deck
 */
export const updateDeck = async (id, updateData) => {
	return await KanjiDeck.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Delete deck
 */
export const deleteDeck = async (id) => {
	return await KanjiDeck.findByIdAndDelete(id);
};

// ============ KANJI OPERATIONS ============

/**
 * Get all kanji with optional filters
 */
export const findAllKanji = async (filters = {}) => {
	const query = {};
	
	if (filters.deckId) {
		query.deckId = filters.deckId;
	}
	
	return await Kanji.find(query).sort({ displayOrder: 1 }).populate('deckId');
};

/**
 * Get kanji by ID
 */
export const findKanjiById = async (id) => {
	return await Kanji.findById(id).populate('deckId');
};

/**
 * Get kanji by deck ID
 */
export const findKanjiByDeck = async (deckId) => {
	return await Kanji.find({ deckId }).sort({ displayOrder: 1 });
};

/**
 * Count kanji in deck
 */
export const countKanjiInDeck = async (deckId) => {
	return await Kanji.countDocuments({ deckId });
};

/**
 * Create new kanji
 */
export const createKanji = async (kanjiData) => {
	const kanji = new Kanji(kanjiData);
	return await kanji.save();
};

/**
 * Update kanji
 */
export const updateKanji = async (id, updateData) => {
	return await Kanji.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Delete kanji
 */
export const deleteKanji = async (id) => {
	return await Kanji.findByIdAndDelete(id);
};

/**
 * Delete all kanji in deck
 */
export const deleteKanjiByDeck = async (deckId) => {
	return await Kanji.deleteMany({ deckId });
};

/**
 * Bulk create kanji
 */
export const bulkCreateKanji = async (kanjiList) => {
	return await Kanji.insertMany(kanjiList, { ordered: false });
};
