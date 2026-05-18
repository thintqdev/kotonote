import { ADMIN_READING } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {Record<string, unknown>} [params]
 */
export async function listAdminReadingArticles(params = {}) {
	const body = await adminApi.get(ADMIN_READING.BASE, { params });
	return {
		items: body.data?.items ?? [],
		pagination: body.pagination ?? null,
	};
}

export async function getAdminReadingArticle(id) {
	const body = await adminApi.get(ADMIN_READING.article(id));
	return getApiData(body).article;
}

export async function createAdminReadingArticle(payload) {
	const body = await adminApi.post(ADMIN_READING.BASE, payload);
	return getApiData(body).article;
}

export async function updateAdminReadingArticle(id, payload) {
	const body = await adminApi.put(ADMIN_READING.article(id), payload);
	return getApiData(body).article;
}

export async function deleteAdminReadingArticle(id) {
	await adminApi.delete(ADMIN_READING.article(id));
}

/**
 * @param {File} file
 * @param {string} [articleId] — nếu có: gán luôn vào bài
 */
export async function uploadAdminReadingCover(file, articleId) {
	const fd = new FormData();
	fd.append('cover', file);
	const url = articleId
		? ADMIN_READING.cover(articleId)
		: ADMIN_READING.UPLOAD_COVER;
	const body = await adminApi.post(url, fd, {
		transformRequest: [
			(data, headers) => {
				if (typeof FormData !== 'undefined' && data instanceof FormData) {
					delete headers['Content-Type'];
				}
				return data;
			},
		],
	});
	return {
		imageUrl: body.data?.imageUrl ?? '',
		article: body.data?.article ?? null,
	};
}
