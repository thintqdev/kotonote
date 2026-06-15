import { AUTH, PROFILE } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import api, { adminApi } from './api.js';

/**
 * @param {{ email: string, password: string, remember?: boolean }} credentials
 * @returns {Promise<{ user: object }>}
 */
export async function adminLogin(credentials) {
	const body = await api.post(AUTH.ADMIN_LOGIN, credentials);
	return getApiData(body);
}

export async function adminLogout() {
	const body = await api.post(AUTH.ADMIN_LOGOUT);
	return getApiData(body);
}

/**
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 * @returns {Promise<{ user: object }>}
 */
export async function fetchAdminSession(axiosConfig = {}) {
	const body = await adminApi.get(PROFILE.ME, axiosConfig);
	return getApiData(body);
}
