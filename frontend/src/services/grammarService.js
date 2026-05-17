import { GRAMMAR } from '../constants/apiEndpoints.js';
import api from './api.js';

/** Cần JWT user (`api` client) — không gọi khi chưa đăng nhập. */

/**
 * @param {{ page?: number, limit?: number, jlpt?: string, tag?: string, q?: string }} params
 */
export async function listGrammars(params = {}) {
	const body = await api.get(GRAMMAR.BASE, { params });
	return {
		items: body.data?.items ?? [],
		jlptLevels: body.data?.jlptLevels ?? [],
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
