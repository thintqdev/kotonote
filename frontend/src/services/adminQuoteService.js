import { ADMIN_QUOTES } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {{ category?: string, isActive?: boolean }} [params]
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 * @returns {Promise<{ quotes: object[], total: number }>}
 */
export async function listAdminQuotes(params = {}, axiosConfig = {}) {
	const body = await adminApi.get(ADMIN_QUOTES.BASE, {
		params,
		...axiosConfig,
	});
	return getApiData(body);
}

/**
 * @param {Record<string, unknown>} payload
 */
export async function createAdminQuote(payload) {
	const body = await adminApi.post(ADMIN_QUOTES.BASE, payload);
	return getApiData(body);
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} payload
 */
export async function updateAdminQuote(id, payload) {
	const body = await adminApi.put(ADMIN_QUOTES.quote(id), payload);
	return getApiData(body);
}

export async function deleteAdminQuote(id) {
	await adminApi.delete(ADMIN_QUOTES.quote(id));
}
