import { USER_VOCABULARY } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { api } from './api.js';

/**
 * @param {Record<string, unknown>} [params]
 */
export async function listMyVocabularyDecks(params = {}) {
	const body = await api.get(USER_VOCABULARY.DECKS, { params });
	return {
		decks: body.data?.decks ?? [],
		pagination: body.pagination ?? null,
		quota: body.data?.quota ?? null,
		jlptAccess: body.data?.jlptAccess ?? null,
	};
}

/**
 * @param {object} payload
 */
export async function createMyVocabularyDeck(payload) {
	const body = await api.post(USER_VOCABULARY.DECKS, payload);
	return getApiData(body).deck;
}

/**
 * @param {string} id
 */
export async function getMyVocabularyDeck(id) {
	const body = await api.get(USER_VOCABULARY.deck(id));
	return getApiData(body).deck;
}

/**
 * @param {string} id
 */
export async function getMyVocabularyDeckWithWords(id) {
	const body = await api.get(USER_VOCABULARY.deckVocabulary(id));
	return {
		deck: body.data?.deck ?? null,
		vocabulary: body.data?.vocabulary ?? [],
		totalWords: body.data?.totalWords ?? 0,
	};
}

/**
 * @param {string} id
 * @param {object} payload
 */
export async function updateMyVocabularyDeck(id, payload) {
	const body = await api.put(USER_VOCABULARY.deck(id), payload);
	return getApiData(body).deck;
}

/**
 * @param {string} id
 */
export async function deleteMyVocabularyDeck(id) {
	await api.delete(USER_VOCABULARY.deck(id));
}

/**
 * @param {object} payload
 */
export async function createMyVocabularyWord(deckId, payload) {
	const body = await api.post(USER_VOCABULARY.deckWords(deckId), {
		...payload,
		deckId,
	});
	return getApiData(body).vocab;
}

/**
 * @param {string} vocabId
 * @param {object} payload
 */
export async function updateMyVocabularyWord(vocabId, payload) {
	const body = await api.put(USER_VOCABULARY.word(vocabId), payload);
	return getApiData(body).vocab;
}

/**
 * @param {string} vocabId
 */
export async function deleteMyVocabularyWord(vocabId) {
	await api.delete(USER_VOCABULARY.word(vocabId));
}

/**
 * @param {string} deckId
 * @param {object[]} vocabularyList
 */
export async function importMyVocabularyWords(deckId, vocabularyList) {
	const body = await api.post(USER_VOCABULARY.deckImport(deckId), {
		vocabularyList,
	});
	return getApiData(body);
}
