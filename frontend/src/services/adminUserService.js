import { ADMIN_USERS } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {{
 *   status?: string,
 *   role?: string,
 *   authProvider?: string,
 *   search?: string,
 *   page?: number,
 *   limit?: number,
 * }} [params]
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function listAdminUsers(params = {}, axiosConfig = {}) {
	const body = await adminApi.get(ADMIN_USERS.BASE, {
		params,
		...axiosConfig,
	});
	return getApiData(body);
}

/**
 * @param {string} id
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function getAdminUser(id, axiosConfig = {}) {
	const body = await adminApi.get(ADMIN_USERS.user(id), axiosConfig);
	return getApiData(body);
}

/**
 * @param {string} id
 * @param {'active'|'locked'|'suspended'} status
 */
export async function patchAdminUserStatus(id, status) {
	const body = await adminApi.patch(ADMIN_USERS.status(id), { status });
	return getApiData(body);
}

/**
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function getAdminUserStatistics(axiosConfig = {}) {
	const body = await adminApi.get(ADMIN_USERS.statistics, axiosConfig);
	return getApiData(body);
}
