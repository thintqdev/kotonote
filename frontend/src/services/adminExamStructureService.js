import { ADMIN_EXAM_STRUCTURES } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

export async function listExamStructureTemplates(params = {}) {
	const body = await adminApi.get(ADMIN_EXAM_STRUCTURES.BASE, { params });
	return getApiData(body).items ?? [];
}

export async function getExamStructureTemplate(id) {
	const body = await adminApi.get(ADMIN_EXAM_STRUCTURES.template(id));
	return getApiData(body).template;
}

export async function getDefaultExamStructureByJlpt(jlpt) {
	const body = await adminApi.get(ADMIN_EXAM_STRUCTURES.defaultByJlpt(jlpt));
	return getApiData(body).template;
}

export async function getExamStructureMeta(jlpt = 'N3') {
	const body = await adminApi.get(ADMIN_EXAM_STRUCTURES.META, { params: { jlpt } });
	return getApiData(body).meta;
}

export async function updateExamStructureTemplate(id, payload) {
	const body = await adminApi.put(ADMIN_EXAM_STRUCTURES.template(id), payload);
	return getApiData(body).template;
}

export async function resetExamStructureTemplate(id) {
	const body = await adminApi.post(ADMIN_EXAM_STRUCTURES.reset(id));
	return getApiData(body).template;
}

export async function getExamPartCatalog() {
	const body = await adminApi.get(ADMIN_EXAM_STRUCTURES.CATALOG);
	return getApiData(body).catalog;
}

export async function seedExamStructures() {
	const body = await adminApi.post(ADMIN_EXAM_STRUCTURES.SEED);
	return getApiData(body).items ?? [];
}
