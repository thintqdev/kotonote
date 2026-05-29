import mongoose from 'mongoose';
import VocabularyDeck from '../models/VocabularyDeck.js';
import Vocabulary from '../models/Vocabulary.js';

/** Khớp list + unlock: displayOrder ↑, cũ→mới theo createdAt khi trùng. */
export const VOCAB_DECK_SORT = { displayOrder: 1, createdAt: 1, _id: 1 };

/** Từ trong deck: cũ → mới (thứ tự bài / import JSON) */
export const VOCAB_IN_DECK_SORT = { displayOrder: 1, createdAt: 1, _id: 1 };

const deckSort = VOCAB_DECK_SORT;

// Deck Repository
export const findAllDecks = async (filters = {}) => {
	return await VocabularyDeck.find(filters).sort(deckSort);
};

export const countDecks = async (filters = {}) => {
	return await VocabularyDeck.countDocuments(filters);
};

/**
 * @param {Record<string, unknown>} filters
 * @param {{ skip: number, limit: number }} opts
 */
export const findDecksPaginated = async (filters = {}, { skip, limit } = {}) => {
	return await VocabularyDeck.find(filters)
		.sort(deckSort)
		.skip(skip)
		.limit(limit)
		.lean();
};

/**
 * Đếm từ đang active theo từng deck (đồng bộ với findVocabByDeck).
 * @param {import('mongoose').Types.ObjectId[]} deckIds
 * @returns {Promise<Map<string, number>>}
 */
export const countActiveVocabByDeckIds = async (deckIds) => {
	const map = new Map();
	if (!deckIds?.length) {
		return map;
	}
	const ids = deckIds.map((id) =>
		id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(String(id)),
	);
	const rows = await Vocabulary.aggregate([
		{ $match: { deckId: { $in: ids }, isActive: true } },
		{ $group: { _id: '$deckId', wordCount: { $sum: 1 } } },
	]);
	for (const r of rows) {
		map.set(String(r._id), r.wordCount);
	}
	return map;
};

export const findDeckById = async (deckId) => {
	return await VocabularyDeck.findById(deckId);
};

export const createDeck = async (deckData) => {
	const deck = new VocabularyDeck(deckData);
	return await deck.save();
};

export const updateDeck = async (deckId, updateData) => {
	return await VocabularyDeck.findByIdAndUpdate(deckId, updateData, {
		new: true,
		runValidators: true,
	});
};

export const deleteDeck = async (deckId) => {
	return await VocabularyDeck.findByIdAndDelete(deckId);
};

// Vocabulary Repository
export const findVocabByDeck = async (deckId) => {
	return await Vocabulary.find({ deckId, isActive: true }).sort(VOCAB_IN_DECK_SORT);
};

export const findVocabById = async (vocabId) => {
	return await Vocabulary.findById(vocabId);
};

export const createVocab = async (vocabData) => {
	const vocab = new Vocabulary(vocabData);
	return await vocab.save();
};

export const updateVocab = async (vocabId, updateData) => {
	return await Vocabulary.findByIdAndUpdate(vocabId, updateData, {
		new: true,
		runValidators: true,
	});
};

export const deleteVocab = async (vocabId) => {
	return await Vocabulary.findByIdAndDelete(vocabId);
};

export const countVocabInDeck = async (deckId) => {
	return await Vocabulary.countDocuments({ deckId, isActive: true });
};

export const bulkCreateVocab = async (vocabArray) => {
	return await Vocabulary.insertMany(vocabArray, { ordered: false });
};


// Alias for consistency
export const bulkCreateVocabulary = bulkCreateVocab;
export const countVocabularyInDeck = countVocabInDeck;
