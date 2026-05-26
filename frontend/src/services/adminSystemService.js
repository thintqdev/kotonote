import { ADMIN_SYSTEM } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * Hiệu suất / sức khỏe hệ thống (admin).
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function getAdminSystemHealth(axiosConfig = {}) {
	const body = await adminApi.get(ADMIN_SYSTEM.health, axiosConfig);
	return getApiData(body)?.health ?? getApiData(body);
}
