import { AUTH, PROFILE } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import api, { adminApi } from './api.js';

/**
 * Đăng nhập admin — không cần Bearer; JWT trả về lưu qua tokenStorage.setAdminToken.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function adminLogin(credentials) {
	const body = await api.post(AUTH.ADMIN_LOGIN, credentials);
	return getApiData(body);
}

/**
 * Phiên admin hiện tại — Bearer admin JWT, backend `authenticate` + user từ DB.
 * Dùng để chống token giả / token user thường lẫn vào kho admin.
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 * @returns {Promise<{ user: object }>}
 */
export async function fetchAdminSession(axiosConfig = {}) {
	const body = await adminApi.get(PROFILE.ME, axiosConfig);
	return getApiData(body);
}
