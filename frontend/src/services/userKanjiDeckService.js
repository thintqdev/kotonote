import { USER_KANJI } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { api } from './api.js';

/**
 * @param {Record<string, unknown>} [params]
 */
export async function listMyKanjiDecks(params = {}) {
	const body = await api.get(USER_KANJI.DECKS, { params });
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
export async function createMyKanjiDeck(payload) {
	const body = await api.post(USER_KANJI.DECKS, payload);
	return getApiData(body).deck;
}

/**
 * @param {string} id
 */
export async function getMyKanjiDeckWithKanji(id) {
	const body = await api.get(USER_KANJI.deckKanji(id));
	return {
		deck: body.data?.deck ?? null,
		kanji: body.data?.kanji ?? [],
		count: body.data?.count ?? 0,
	};
}

/**
 * @param {string} id
 * @param {object} payload
 */
export async function updateMyKanjiDeck(id, payload) {
	const body = await api.put(USER_KANJI.deck(id), payload);
	return getApiData(body).deck;
}

/**
 * @param {string} id
 */
export async function deleteMyKanjiDeck(id) {
	await api.delete(USER_KANJI.deck(id));
}

/**
 * @param {string} deckId
 * @param {object} payload
 */
export async function createMyKanji(deckId, payload) {
	const body = await api.post(USER_KANJI.deckKanjiCreate(deckId), {
		...payload,
		deckId,
	});
	return getApiData(body).kanji;
}

/**
 * @param {string} kanjiId
 * @param {object} payload
 */
export async function updateMyKanji(kanjiId, payload) {
	const body = await api.put(USER_KANJI.kanji(kanjiId), payload);
	return getApiData(body).kanji;
}

/**
 * @param {string} kanjiId
 */
export async function deleteMyKanji(kanjiId) {
	await api.delete(USER_KANJI.kanji(kanjiId));
}

/**
 * @param {string} deckId
 * @param {object[]} kanjiList
 */
export async function importMyKanji(deckId, kanjiList) {
	const body = await api.post(USER_KANJI.deckImport(deckId), { kanjiList });
	return getApiData(body);
}
