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
