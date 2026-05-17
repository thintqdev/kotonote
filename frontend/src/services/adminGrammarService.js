import { ADMIN_GRAMMAR } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {Record<string, unknown>} [params]
 */
export async function listAdminGrammars(params = {}) {
	const body = await adminApi.get(ADMIN_GRAMMAR.BASE, { params });
	return {
		items: body.data?.items ?? [],
		pagination: body.pagination ?? null,
	};
}

export async function getAdminGrammar(id) {
	const body = await adminApi.get(ADMIN_GRAMMAR.grammar(id));
	return getApiData(body).grammar;
}

export async function createAdminGrammar(payload) {
	const body = await adminApi.post(ADMIN_GRAMMAR.BASE, payload);
	return getApiData(body).grammar;
}

export async function updateAdminGrammar(id, payload) {
	const body = await adminApi.put(ADMIN_GRAMMAR.grammar(id), payload);
	return getApiData(body).grammar;
}

export async function deleteAdminGrammar(id) {
	await adminApi.delete(ADMIN_GRAMMAR.grammar(id));
}
