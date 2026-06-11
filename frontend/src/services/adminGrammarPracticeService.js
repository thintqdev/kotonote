import { ADMIN_GRAMMAR } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {Record<string, unknown>} [params]
 */
export async function listAdminGrammarPracticeQuestions(params = {}) {
	const body = await adminApi.get(ADMIN_GRAMMAR.PRACTICE_BASE, { params });
	return {
		items: body.data?.items ?? [],
		pagination: body.pagination ?? null,
	};
}

export async function getAdminGrammarPracticeQuestion(id) {
	const body = await adminApi.get(ADMIN_GRAMMAR.practice(id));
	return getApiData(body).question;
}

/**
 * @param {{ jlpt: string, count?: number, isPublished?: boolean }} payload
 */
export async function generateAdminGrammarPracticeQuestions(payload) {
	const body = await adminApi.post(ADMIN_GRAMMAR.PRACTICE_GENERATE, payload);
	return getApiData(body);
}

/**
 * @param {{ jlpt: string, isPublished?: boolean, items: unknown[] }} payload
 */
export async function importAdminGrammarPracticeQuestions(payload) {
	const body = await adminApi.post(ADMIN_GRAMMAR.PRACTICE_IMPORT, payload);
	return getApiData(body);
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} payload
 */
export async function updateAdminGrammarPracticeQuestion(id, payload) {
	const body = await adminApi.put(ADMIN_GRAMMAR.practice(id), payload);
	return getApiData(body).question;
}

export async function deleteAdminGrammarPracticeQuestion(id) {
	await adminApi.delete(ADMIN_GRAMMAR.practice(id));
}
