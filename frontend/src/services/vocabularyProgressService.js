import { VOCABULARY } from '../constants/apiEndpoints.js';
import api from './api.js';

/** @param {{ jlpt?: string }} [params] */
export async function getMyVocabularyProgress(params = {}) {
	const body = await api.get(VOCABULARY.PROGRESS, { params });
	return body.data?.progress ?? [];
}

export async function getVocabularyDeckProgress(deckId) {
	const body = await api.get(VOCABULARY.deckProgress(deckId));
	return body.data ?? { deckId: String(deckId), growthStage: 0 };
}

/**
 * @param {string} deckId
 * @param {{ lessonNo?: number }} [opts]
 */
export async function advanceVocabularyDeckProgress(deckId, opts = {}) {
	const params =
		opts.lessonNo != null && Number.isFinite(Number(opts.lessonNo))
			? { lessonNo: opts.lessonNo }
			: undefined;
	const body = await api.post(VOCABULARY.advanceProgress(deckId), null, {
		params,
	});
	return body.data ?? { deckId: String(deckId), growthStage: 0 };
}

/** @param {{ deckId: string, growthStage?: number }[]} progressList */
export function vocabularyProgressToMap(progressList) {
	/** @type {Record<string, number>} */
	const map = {};
	for (const row of progressList ?? []) {
		if (!row?.deckId) continue;
		const stage = Number(row.growthStage);
		map[String(row.deckId)] = Number.isFinite(stage)
			? Math.max(0, Math.floor(stage))
			: 0;
	}
	return map;
}
