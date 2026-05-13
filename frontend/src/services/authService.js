import { AUTH, PROFILE } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import api from './api.js';

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function login(credentials) {
	const body = await api.post(AUTH.LOGIN, credentials);
	return getApiData(body);
}

/**
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function register(payload) {
	const body = await api.post(AUTH.REGISTER, payload);
	return getApiData(body);
}

/**
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 * @returns {Promise<{ user: object }>}
 */
export async function fetchCurrentUser(axiosConfig = {}) {
	const body = await api.get(PROFILE.ME, axiosConfig);
	return getApiData(body);
}
