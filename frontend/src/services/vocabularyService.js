import { VOCABULARY } from '../constants/apiEndpoints.js';
import {
	filterActiveDecks,
	jlptToApiLevel,
	levelToJlpt,
	mapVocabRecord,
	sortDecksByOrder,
	sortDeckItemsByDisplayOrder,
	sortVocabApiList,
} from '../utils/deckStudy.js';
import api from './api.js';

/** Cần JWT user — không gọi khi chưa đăng nhập. */

/**
 * @param {Record<string, unknown>} [params]
 */
export async function listVocabularyDecks(params = {}) {
	const body = await api.get(VOCABULARY.DECKS, { params });
	const decks = filterActiveDecks(body.data?.decks ?? []);
	return {
		decks: params.page != null || params.limit != null ? decks : sortDecksByOrder(decks),
		pagination: body.data?.pagination ?? body.pagination ?? null,
		requestedJlptLocked: Boolean(body.data?.requestedJlptLocked),
	};
}

/**
 * @param {string} deckId
 * @param {{ lessonNo?: number }} [opts]
 */
export async function getDeckWithVocabulary(deckId, opts = {}) {
	const params =
		opts.lessonNo != null && Number.isFinite(Number(opts.lessonNo))
			? { lessonNo: opts.lessonNo }
			: undefined;
	const body = await api.get(VOCABULARY.deckWithVocabulary(deckId), { params });
	return {
		deck: body.data?.deck ?? null,
		vocabulary: sortVocabApiList(body.data?.vocabulary ?? []),
	};
}

/**
 * Danh sách deck active theo cấp JLPT (không tải từ — dùng cho trang list).
 * @param {string} jlpt — N3, N4, …
 */
export async function listVocabularyDecksByJlpt(jlpt) {
	const level = jlptToApiLevel(jlpt);
	const { decks } = await listVocabularyDecks({
		level,
		isActive: true,
		limit: 100,
	});
	return sortDecksByOrder(filterActiveDecks(decks));
}

/**
 * Tải toàn bộ deck + từ cho một cấp JLPT (trang học / quiz cần distractor).
 * @param {string} jlpt — N3, N4, …
 */
export async function loadVocabularyPack(jlpt) {
	const level = jlptToApiLevel(jlpt);
	const { decks } = await listVocabularyDecks({
		level,
		isActive: true,
		limit: 100,
	});
	const sorted = sortDecksByOrder(filterActiveDecks(decks));
	const items = [];

	await Promise.all(
		sorted.map(async (deck) => {
			const { vocabulary } = await getDeckWithVocabulary(deck._id);
			const deckJlpt = levelToJlpt(deck.level);
			for (const v of sortDeckItemsByDisplayOrder(vocabulary)) {
				items.push(mapVocabRecord(v, deckJlpt, deck._id));
			}
		}),
	);

	return { decks: sorted, items };
}

/**
 * Tìm từ theo id trong các deck active (dùng redirect /vocabulary/:id).
 * @param {string} wordId
 */
export async function findVocabularyWordMeta(wordId) {
	const { decks } = await listVocabularyDecks({ isActive: true, limit: 100 });
	const sorted = sortDecksByOrder(filterActiveDecks(decks));

	for (const deck of sorted) {
		const { vocabulary } = await getDeckWithVocabulary(deck._id);
		const found = vocabulary.find((v) => String(v._id) === String(wordId));
		if (!found) continue;
		const jlpt = levelToJlpt(deck.level);
		const lessonNo =
			sorted.findIndex((d) => String(d._id) === String(deck._id)) + 1;
		return { jlpt, lessonNo };
	}
	return null;
}
