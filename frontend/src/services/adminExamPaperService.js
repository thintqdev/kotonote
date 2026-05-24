import { ADMIN_EXAM_PAPERS } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';
import { multipartAxiosConfig } from '../utils/multipartAxiosConfig.js';

/**
 * @param {Record<string, unknown>} [params]
 */
export async function listAdminExamPapers(params = {}) {
	const body = await adminApi.get(ADMIN_EXAM_PAPERS.BASE, { params });
	return {
		items: body.data?.items ?? [],
		years: body.data?.years ?? [],
		pagination: body.pagination ?? null,
	};
}

export async function getAdminExamPaper(id) {
	const body = await adminApi.get(ADMIN_EXAM_PAPERS.paper(id));
	const data = getApiData(body);
	return {
		paper: data.paper,
		structureMeta: data.structureMeta ?? null,
	};
}

export async function createAdminExamPaper(payload) {
	const body = await adminApi.post(ADMIN_EXAM_PAPERS.BASE, payload);
	return getApiData(body).paper;
}

export async function updateAdminExamPaper(id, payload) {
	const body = await adminApi.put(ADMIN_EXAM_PAPERS.paper(id), payload);
	return getApiData(body).paper;
}

export async function deleteAdminExamPaper(id) {
	await adminApi.delete(ADMIN_EXAM_PAPERS.paper(id));
}

export async function getExamSectionsTemplate(jlpt = 'N3') {
	const body = await adminApi.get(ADMIN_EXAM_PAPERS.TEMPLATE, { params: { jlpt } });
	return body.data?.template ?? null;
}

export async function initAdminExamPaperSections(id) {
	const body = await adminApi.post(ADMIN_EXAM_PAPERS.sectionsInit(id));
	return getApiData(body).paper;
}

export async function updateAdminExamPaperSections(id, sections) {
	const body = await adminApi.put(ADMIN_EXAM_PAPERS.sections(id), { sections });
	return getApiData(body).paper;
}

export async function importAdminExamPaperSections(id, payload) {
	const body = await adminApi.post(ADMIN_EXAM_PAPERS.sectionsImport(id), payload);
	return getApiData(body).paper;
}

/**
 * @param {File} file
 * @returns {Promise<{ url: string, mediaType: 'audio' | 'image' }>}
 */
export async function uploadExamMedia(file) {
	const fd = new FormData();
	fd.append('media', file);
	const body = await adminApi.post(
		ADMIN_EXAM_PAPERS.UPLOAD_MEDIA,
		fd,
		multipartAxiosConfig,
	);
	const data = getApiData(body);
	return {
		url: data.url ?? '',
		mediaType: data.mediaType === 'audio' ? 'audio' : 'image',
	};
}

/**
 * @param {File} file
 * @returns {Promise<{ thumbnailUrl: string }>}
 */
export async function uploadExamPaperThumbnail(file) {
	const fd = new FormData();
	fd.append('thumbnail', file);
	const body = await adminApi.post(
		ADMIN_EXAM_PAPERS.UPLOAD_THUMBNAIL,
		fd,
		multipartAxiosConfig,
	);
	const data = getApiData(body);
	return { thumbnailUrl: data.thumbnailUrl ?? '' };
}
