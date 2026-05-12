import VocabularyDeck from '../models/VocabularyDeck.js';
import Vocabulary from '../models/Vocabulary.js';

// Deck Repository
export const findAllDecks = async (filters = {}) => {
	return await VocabularyDeck.find(filters).sort({ displayOrder: 1, createdAt: -1 });
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
	return await Vocabulary.find({ deckId, isActive: true }).sort({ displayOrder: 1 });
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
