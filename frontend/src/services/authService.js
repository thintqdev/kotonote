import { AUTH, PROFILE } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { dedupePromise } from '../utils/dedupePromise.js';
import api from './api.js';
import { getUserToken } from './tokenStorage.js';

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function login(credentials) {
	const body = await api.post(AUTH.LOGIN, credentials);
	return getApiData(body);
}

/**
 * Đăng ký — không trả JWT; client chuyển sang trang chờ xác minh email.
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<{ email: string }>}
 */
export async function register(payload) {
	const body = await api.post(AUTH.REGISTER, payload);
	return getApiData(body);
}

/**
 * @param {string} token — token từ link email
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function verifyEmail(token, axiosConfig = {}) {
	const body = await api.post(
		AUTH.VERIFY_EMAIL,
		{ token: String(token || '').trim() },
		axiosConfig,
	);
	return getApiData(body);
}

/**
 * @param {string} email
 */
export async function resendVerificationEmail(email, axiosConfig = {}) {
	const body = await api.post(
		AUTH.RESEND_VERIFICATION,
		{ email: String(email || '').trim() },
		axiosConfig,
	);
	return getApiData(body);
}

/**
 * @param {{ currentPassword: string, newPassword: string }} payload
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function changePassword(payload, axiosConfig = {}) {
	const body = await api.post(AUTH.CHANGE_PASSWORD, payload, axiosConfig);
	return getApiData(body);
}

/**
 * @param {string} email
 */
export async function requestPasswordReset(email, axiosConfig = {}) {
	const trimmed = String(email || '').trim();
	const body = await api.post(
		AUTH.FORGOT_PASSWORD,
		{ email: trimmed },
		axiosConfig,
	);
	return getApiData(body);
}

/**
 * @param {{ token: string, newPassword: string }} payload
 */
export async function resetPassword(payload, axiosConfig = {}) {
	const body = await api.post(AUTH.RESET_PASSWORD, payload, axiosConfig);
	return getApiData(body);
}

/**
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 * @returns {Promise<{ user: object }>}
 */
export async function fetchCurrentUser(axiosConfig = {}) {
	if (axiosConfig.signal) {
		const body = await api.get(PROFILE.ME, axiosConfig);
		return getApiData(body);
	}
	const token = getUserToken() || '';
	return dedupePromise(`users/me:${token}`, async () => {
		const body = await api.get(PROFILE.ME, axiosConfig);
		return getApiData(body);
	});
}

/**
 * @param {{ name: string, avatar?: string | null, profile?: object }} payload
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 * @returns {Promise<{ user: object }>}
 */
export async function updateCurrentUser(payload, axiosConfig = {}) {
	const body = await api.put(PROFILE.ME, payload, axiosConfig);
	return getApiData(body);
}

/**
 * @param {File} file
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 * @returns {Promise<{ user: object }>}
 */
export async function uploadMyAvatar(file, axiosConfig = {}) {
	const fd = new FormData();
	fd.append('avatar', file);
	const body = await api.post(PROFILE.AVATAR, fd, {
		...axiosConfig,
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
 * @param {{ badgeKey: string }} payload
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function testUnlockBadge(payload, axiosConfig = {}) {
	const body = await api.post(PROFILE.BADGE_TEST_UNLOCK, payload, axiosConfig);
	return getApiData(body);
}
