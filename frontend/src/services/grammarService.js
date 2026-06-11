import { GRAMMAR } from '../constants/apiEndpoints.js';
import api from './api.js';

/** Cần JWT user (`api` client) — không gọi khi chưa đăng nhập. */

/**
 * @param {{ page?: number, limit?: number, jlpt?: string, tag?: string, q?: string }} params
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function listGrammars(params = {}, { signal } = {}) {
	const body = await api.get(GRAMMAR.BASE, { params, signal });
	return {
		items: body.data?.items ?? [],
		jlptLevels: body.data?.jlptLevels ?? [],
		availableTagIds: body.data?.availableTagIds ?? [],
		tagCounts: body.data?.tagCounts ?? {},
		pagination: body.pagination ?? null,
	};
}

/**
 * @param {string} slug
 */
export async function getGrammarBySlug(slug) {
	const body = await api.get(GRAMMAR.bySlug(slug));
	return body.data?.grammar ?? null;
}

/**
 * Lấy đề quiz ngữ pháp (từ bộ đề admin đã xuất bản).
 * @param {{ jlpt: string, count?: number }} params
 */
export async function getGrammarPracticeQuiz(params) {
	const body = await api.get(GRAMMAR.PRACTICE_QUIZ, { params });
	return {
		questions: body.data?.questions ?? [],
		meta: body.data?.meta ?? null,
	};
}
