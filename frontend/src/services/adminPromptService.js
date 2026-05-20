import { ADMIN_PROMPTS } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {{ type?: string, isActive?: boolean, jlptLevel?: string }} [params]
 */
export async function listAdminPrompts(params = {}, axiosConfig = {}) {
	const body = await adminApi.get(ADMIN_PROMPTS.BASE, {
		params,
		...axiosConfig,
	});
	return getApiData(body);
}

export async function createAdminPrompt(payload) {
	const body = await adminApi.post(ADMIN_PROMPTS.BASE, payload);
	return getApiData(body);
}

export async function updateAdminPrompt(id, payload) {
	const body = await adminApi.put(ADMIN_PROMPTS.prompt(id), payload);
	return getApiData(body);
}

export async function deleteAdminPrompt(id) {
	await adminApi.delete(ADMIN_PROMPTS.prompt(id));
}
