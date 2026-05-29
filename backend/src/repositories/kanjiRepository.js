import mongoose from 'mongoose';
import Kanji from '../models/Kanji.js';
import KanjiDeck from '../models/KanjiDeck.js';

const kanjiDeckSort = { jlpt: 1, displayOrder: 1, createdAt: -1 };

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

export const countDecks = async (filters = {}) => {
	const query = {};
	if (filters.jlpt) {
		query.jlpt = filters.jlpt;
	}
	if (filters.isActive !== undefined) {
		query.isActive = filters.isActive;
	}
	return await KanjiDeck.countDocuments(query);
};

/**
 * @param {Record<string, unknown>} filters
 * @param {{ skip: number, limit: number }} opts
 */
export const findDecksPaginated = async (filters = {}, { skip, limit } = {}) => {
	const query = {};
	if (filters.jlpt) {
		query.jlpt = filters.jlpt;
	}
	if (filters.isActive !== undefined) {
		query.isActive = filters.isActive;
	}
	return await KanjiDeck.find(query)
		.sort(kanjiDeckSort)
		.skip(skip)
		.limit(limit)
		.lean();
};

/**
 * @param {import('mongoose').Types.ObjectId[]} deckIds
 * @returns {Promise<Map<string, number>>}
 */
export const countKanjiByDeckIds = async (deckIds) => {
	const map = new Map();
	if (!deckIds?.length) {
		return map;
	}
	const ids = deckIds.map((id) =>
		id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(String(id)),
	);
	const rows = await Kanji.aggregate([
		{ $match: { deckId: { $in: ids } } },
		{ $group: { _id: '$deckId', kanjiCount: { $sum: 1 } } },
	]);
	for (const r of rows) {
		map.set(String(r._id), r.kanjiCount);
	}
	return map;
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
/** Kanji trong deck: cũ → mới */
const KANJI_IN_DECK_SORT = { displayOrder: 1, createdAt: 1, _id: 1 };

export const findKanjiByDeck = async (deckId) => {
	return await Kanji.find({ deckId }).sort(KANJI_IN_DECK_SORT);
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
