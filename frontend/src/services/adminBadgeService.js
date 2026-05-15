import { ADMIN_BADGES } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {{ category?: string, isActive?: boolean }} [params]
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 * @returns {Promise<{ badges: object[], total: number }>}
 */
export async function listAdminBadges(params = {}, axiosConfig = {}) {
	const body = await adminApi.get(ADMIN_BADGES.BASE, {
		params,
		...axiosConfig,
	});
	return getApiData(body);
}

/**
 * @param {Record<string, unknown>} payload
 */
export async function createAdminBadge(payload) {
	const body = await adminApi.post(ADMIN_BADGES.BASE, payload);
	return getApiData(body);
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} payload
 */
export async function updateAdminBadge(id, payload) {
	const body = await adminApi.put(ADMIN_BADGES.badge(id), payload);
	return getApiData(body);
}

export async function deleteAdminBadge(id) {
	await adminApi.delete(ADMIN_BADGES.badge(id));
}

/**
 * @param {string} id
 * @param {File} file
 * @returns {Promise<{ badge: object }>}
 */
export async function uploadAdminBadgeIcon(id, file) {
	const fd = new FormData();
	fd.append('icon', file);
	const body = await adminApi.post(ADMIN_BADGES.icon(id), fd, {
		transformRequest: [
			(data, headers) => {
				if (typeof FormData !== 'undefined' && data instanceof FormData) {
					delete headers['Content-Type'];
				}
				return data;
			},
		],
	});
	return getApiData(body);
}

/**
 * @param {string} id
 * @returns {Promise<{ badge: object }>}
 */
export async function clearAdminBadgeIcon(id) {
	const body = await adminApi.delete(ADMIN_BADGES.icon(id));
	return getApiData(body);
}
