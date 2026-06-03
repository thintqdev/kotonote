import { ADMIN_SENTENCE } from '../constants/apiEndpoints.js';
import { adminApi } from './api.js';

export async function listAdminSentenceSpecialties(params = {}) {
	const body = await adminApi.get(ADMIN_SENTENCE.SPECIALTIES, { params });
	return body.data?.specialties ?? [];
}

export async function listAdminSentenceTemplates(params = {}) {
	const body = await adminApi.get(ADMIN_SENTENCE.TEMPLATES, { params });
	return body.data?.templates ?? [];
}

export async function createAdminSentenceSpecialty(payload) {
	const body = await adminApi.post(ADMIN_SENTENCE.SPECIALTIES, payload);
	return body.data?.specialty ?? null;
}

export async function createAdminSentenceTemplate(payload) {
	const body = await adminApi.post(ADMIN_SENTENCE.TEMPLATES, payload);
	return body.data?.template ?? null;
}

export async function updateAdminSentenceTemplate(id, payload) {
	const body = await adminApi.put(ADMIN_SENTENCE.template(id), payload);
	return body.data?.template ?? null;
}

export async function deleteAdminSentenceTemplate(id) {
	await adminApi.delete(ADMIN_SENTENCE.template(id));
}

export async function deleteAdminSentenceSpecialty(id) {
	await adminApi.delete(ADMIN_SENTENCE.specialty(id));
}

export async function seedAdminSentenceTemplates() {
	const body = await adminApi.post(ADMIN_SENTENCE.SEED);
	return body.data ?? {};
}
