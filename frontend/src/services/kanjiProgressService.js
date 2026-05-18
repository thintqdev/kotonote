import { KANJI } from '../constants/apiEndpoints.js';
import api from './api.js';

/** @param {{ jlpt?: string }} [params] */
export async function getMyKanjiProgress(params = {}) {
	const body = await api.get(KANJI.PROGRESS, { params });
	return body.data?.progress ?? [];
}

export async function getKanjiDeckProgress(deckId) {
	const body = await api.get(KANJI.deckProgress(deckId));
	return body.data ?? { deckId: String(deckId), growthStage: 0 };
}

export async function advanceKanjiDeckProgress(deckId) {
	const body = await api.post(KANJI.advanceProgress(deckId));
	return body.data ?? { deckId: String(deckId), growthStage: 0 };
}

/** @param {{ deckId: string, growthStage?: number }[]} progressList */
export function kanjiProgressToMap(progressList) {
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
