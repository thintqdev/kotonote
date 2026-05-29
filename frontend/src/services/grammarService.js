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
