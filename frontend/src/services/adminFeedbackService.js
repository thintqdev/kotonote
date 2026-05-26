import { ADMIN_FEEDBACK } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {{ status?: string, category?: string, search?: string, page?: number, limit?: number }} [params]
 */
export async function listAdminFeedbacks(params = {}) {
	const body = await adminApi.get(ADMIN_FEEDBACK.BASE, { params });
	return getApiData(body);
}

/**
 * @param {string} id
 * @param {{ status: string, adminNote?: string }} payload
 */
export async function patchAdminFeedbackStatus(id, payload) {
	const body = await adminApi.patch(ADMIN_FEEDBACK.feedback(id), payload);
	return getApiData(body);
}
