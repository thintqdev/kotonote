import { KANJI } from '../constants/apiEndpoints.js';
import {
	filterActiveDecks,
	mapKanjiRecord,
	levelToJlpt,
	sortDecksByJlptAndOrder,
	sortDecksByOrder,
	sortDeckItemsByDisplayOrder,
} from '../utils/deckStudy.js';
import api from './api.js';

/** Cần JWT user — không gọi khi chưa đăng nhập. */

/**
 * @param {Record<string, unknown>} [params]
 */
export async function listKanjiDecks(params = {}) {
	const body = await api.get(KANJI.DECKS, { params });
	return {
		decks: sortDecksByOrder(filterActiveDecks(body.data?.decks ?? [])),
		pagination: body.pagination ?? null,
	};
}

/**
 * @param {string} deckId
 */
export async function getDeckWithKanji(deckId) {
	const body = await api.get(KANJI.deckWithKanji(deckId));
	return {
		deck: body.data?.deck ?? null,
		kanji: sortDeckItemsByDisplayOrder(body.data?.kanji ?? []),
	};
}

/**
 * Tải toàn bộ deck + kanji cho một cấp JLPT (mỗi deck = một bài).
 * @param {string} jlpt — N3, N4, …
 */
export async function loadKanjiPack(jlpt) {
	const { decks } = await listKanjiDecks({
		jlpt,
		isActive: true,
		limit: 100,
	});
	const sorted = sortDecksByOrder(filterActiveDecks(decks));
	const openDecks = sorted.filter((deck) => !deck.locked);
	const items = [];

	await Promise.all(
		openDecks.map(async (deck) => {
			const { kanji } = await getDeckWithKanji(deck._id);
			const deckJlpt = deck.jlpt || jlpt;
			for (const k of kanji) {
				items.push(mapKanjiRecord(k, deckJlpt, deck._id));
			}
		}),
	);

	return { decks: sorted, items };
}

/** Tải mọi deck Kanji active (mọi cấp JLPT). */
export async function loadAllKanjiPacks() {
	const { decks } = await listKanjiDecks({
		isActive: true,
		limit: 100,
	});
	const sorted = sortDecksByJlptAndOrder(filterActiveDecks(decks));
	const openDecks = sorted.filter((deck) => !deck.locked);
	const items = [];

	await Promise.all(
		openDecks.map(async (deck) => {
			const { kanji } = await getDeckWithKanji(deck._id);
			const deckJlpt = deck.jlpt || levelToJlpt(deck.level);
			for (const k of kanji) {
				items.push(mapKanjiRecord(k, deckJlpt, deck._id));
			}
		}),
	);

	return { decks: sorted, items };
}
