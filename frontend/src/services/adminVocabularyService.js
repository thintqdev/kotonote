import { ADMIN_VOCABULARY, VOCABULARY } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {Record<string, unknown>} [params]
 * @param {import('axios').AxiosRequestConfig} [axiosConfig] — ví dụ `{ signal }` để hủy khi unmount (Strict Mode)
 */
export async function listVocabularyDecks(params = {}, axiosConfig = {}) {
	const body = await adminApi.get(VOCABULARY.DECKS, {
		params,
		...axiosConfig,
	});
	return getApiData(body);
}

/**
 * @param {string} deckId
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function getDeckWithVocabulary(deckId, axiosConfig = {}) {
	const body = await adminApi.get(
		VOCABULARY.deckWithVocabulary(deckId),
		axiosConfig,
	);
	return getApiData(body);
}

export async function createVocabularyDeck(payload) {
	const body = await adminApi.post(ADMIN_VOCABULARY.DECKS, payload);
	return getApiData(body);
}

export async function updateVocabularyDeck(deckId, payload) {
	const body = await adminApi.put(ADMIN_VOCABULARY.deck(deckId), payload);
	return getApiData(body);
}

export async function deleteVocabularyDeck(deckId) {
	await adminApi.delete(ADMIN_VOCABULARY.deck(deckId));
}

export async function createVocab(payload) {
	const body = await adminApi.post(ADMIN_VOCABULARY.WORDS, payload);
	return getApiData(body);
}

export async function updateVocab(vocabId, payload) {
	const body = await adminApi.put(ADMIN_VOCABULARY.word(vocabId), payload);
	return getApiData(body);
}

export async function deleteVocab(vocabId) {
	await adminApi.delete(ADMIN_VOCABULARY.word(vocabId));
}

/**
 * Bulk import từ JSON — body khớp backend: { deckId, vocabularyList }.
 * @param {string} deckId
 * @param {object[]} vocabularyList — mỗi phần tử: word, reading, meaning, … (không cần deckId)
 */
export async function importVocabularyFromJson(deckId, vocabularyList) {
	const body = await adminApi.post(ADMIN_VOCABULARY.import(deckId), {
		deckId,
		vocabularyList,
	});
	return getApiData(body);
}
