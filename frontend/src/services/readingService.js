import { READING } from '../constants/apiEndpoints.js';
import api from './api.js';

/**
 * @param {{ jlpt?: string, mode?: string, page?: number, limit?: number }} [params]
 */
export async function listReadingArticles(params = {}) {
	const body = await api.get(READING.BASE, { params });
	return {
		items: body.data?.items ?? [],
		jlptLevels: body.data?.jlptLevels ?? [],
		pagination: body.pagination ?? null,
	};
}

export async function getReadingSummary() {
	const body = await api.get(READING.SUMMARY);
	return body.data ?? { completed: 0, goal: 60, reviewCount: 0 };
}

export async function getReadingArticle(slug) {
	const body = await api.get(READING.bySlug(slug));
	return body.data?.article ?? null;
}

/**
 * @param {string} slug
 * @param {{ status?: string, recordAnswer?: { questionIndex: number, choiceIndex: number } }} payload
 */
export async function saveReadingProgress(slug, payload) {
	const body = await api.put(READING.progress(slug), payload);
	return body.data?.progress ?? null;
}

/**
 * @param {string} slug
 * @param {{ index: number, translationVi: string }[]} items
 * @returns {Promise<{ results: object[], source: string } | null>}
 */
export async function analyzeSentenceTranslations(slug, items) {
	const body = await api.post(READING.sentenceFeedback(slug), { items });
	return body.data ?? null;
}

/**
 * @param {string} slug
 * @param {{ index: number, translationVi: string, score: number }[]} items — đủ mọi câu của bài
 * @returns {Promise<{ summary: object | null, source: string } | null>}
 */
export async function summarizeReadingTranslation(slug, items) {
	const body = await api.post(READING.translationSummary(slug), { items });
	return body.data ?? null;
}
