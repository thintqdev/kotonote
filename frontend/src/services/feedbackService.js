import { FEEDBACK_API } from '../constants/feedbackApi.js';
import { getApiData } from '../utils/apiEnvelope.js';
import api from './api.js';

/**
 * @param {File} file
 * @returns {Promise<{ url: string, kind: 'image' | 'video' }>}
 */
export async function uploadFeedbackMedia(file) {
	const form = new FormData();
	form.append('file', file);
	const body = await api.post(FEEDBACK_API.UPLOADS, form);
	const data = body?.data ?? {};
	const url = data.url ?? '';
	const kind = data.kind === 'video' ? 'video' : 'image';
	return { url, kind };
}

/**
 * @param {{ category: string, message: string, pageUrl?: string, locale?: string, userAgent?: string, appVersion?: string, attachments?: { url: string, kind: string }[] }} payload
 */
export async function submitFeedback(payload) {
	const body = await api.post(FEEDBACK_API.BASE, payload);
	return getApiData(body);
}

/**
 * @param {{ page?: number, limit?: number }} [params]
 */
export async function listMyFeedbacks(params = {}) {
	const body = await api.get(FEEDBACK_API.ME, { params });
	return getApiData(body);
}
