import { ADMIN_SURVEYS } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * Thống kê khảo sát (biểu đồ admin).
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function getAdminSurveyStatistics(axiosConfig = {}) {
	const body = await adminApi.get(ADMIN_SURVEYS.stats, axiosConfig);
	return getApiData(body);
}

/**
 * Tổng quan vận hành admin (KPI, trend 7 ngày, việc cần xử lý).
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function getAdminOverviewStatistics(axiosConfig = {}) {
	const body = await adminApi.get(ADMIN_SURVEYS.overview, axiosConfig);
	return getApiData(body);
}
