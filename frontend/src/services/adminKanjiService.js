import { ADMIN_KANJI, KANJI } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {Record<string, unknown>} [params]
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function listKanjiDecks(params = {}, axiosConfig = {}) {
	const body = await adminApi.get(KANJI.DECKS, {
		params,
		...axiosConfig,
	});
	return getApiData(body);
}

/**
 * @param {string} deckId
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function getDeckWithKanji(deckId, axiosConfig = {}) {
	const body = await adminApi.get(KANJI.deckWithKanji(deckId), axiosConfig);
	return getApiData(body);
}

export async function createKanjiDeck(payload) {
	const body = await adminApi.post(ADMIN_KANJI.DECKS, payload);
	return getApiData(body);
}

export async function updateKanjiDeck(deckId, payload) {
	const body = await adminApi.put(ADMIN_KANJI.deck(deckId), payload);
	return getApiData(body);
}

export async function deleteKanjiDeck(deckId) {
	await adminApi.delete(ADMIN_KANJI.deck(deckId));
}

export async function createKanji(payload) {
	const body = await adminApi.post(ADMIN_KANJI.KANJI, payload);
	return getApiData(body);
}

export async function updateKanji(kanjiId, payload) {
	const body = await adminApi.put(ADMIN_KANJI.kanji(kanjiId), payload);
	return getApiData(body);
}

export async function deleteKanji(kanjiId) {
	await adminApi.delete(ADMIN_KANJI.kanji(kanjiId));
}

/**
 * @param {string} deckId
 * @param {object[]} kanjiList — mỗi phần tử không cần deckId (server gắn khi import)
 */
export async function importKanjiFromJson(deckId, kanjiList) {
	const body = await adminApi.post(ADMIN_KANJI.import(deckId), {
		kanjiList,
	});
	return getApiData(body);
}
