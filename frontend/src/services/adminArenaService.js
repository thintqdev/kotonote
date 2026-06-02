import { adminApi } from './api.js';

const BASE = '/admin/arena';

export async function getAdminArenaDashboard() {
	const body = await adminApi.get(`${BASE}/dashboard`);
	return body.data ?? {};
}

export async function updateAdminArenaSettings(payload) {
	const body = await adminApi.put(`${BASE}/settings`, payload);
	return body.data ?? {};
}

export async function updateAdminArenaGame(gameKey, payload) {
	const body = await adminApi.put(`${BASE}/games/${encodeURIComponent(gameKey)}`, payload);
	return body.data ?? {};
}

export async function listAdminKanji(jlpt) {
	const body = await adminApi.get(`${BASE}/kanji`, { params: jlpt ? { jlpt } : undefined });
	return body.data?.items ?? [];
}

export async function importAdminKanji(items, jlpt) {
	const body = await adminApi.post(`${BASE}/kanji/import`, { items, jlpt });
	return body.data ?? {};
}

export async function updateAdminKanji(id, payload) {
	const body = await adminApi.put(`${BASE}/kanji/${encodeURIComponent(id)}`, payload);
	return body.data?.item ?? null;
}

export async function deleteAdminKanji(id) {
	await adminApi.delete(`${BASE}/kanji/${encodeURIComponent(id)}`);
}

export async function listAdminVocab(jlpt) {
	const body = await adminApi.get(`${BASE}/vocab`, { params: jlpt ? { jlpt } : undefined });
	return body.data?.items ?? [];
}

export async function importAdminVocab(items, jlpt) {
	const body = await adminApi.post(`${BASE}/vocab/import`, { items, jlpt });
	return body.data ?? {};
}

export async function createAdminVocab(payload) {
	const body = await adminApi.post(`${BASE}/vocab`, payload);
	return body.data?.item ?? null;
}

export async function updateAdminVocab(id, payload) {
	const body = await adminApi.put(`${BASE}/vocab/${encodeURIComponent(id)}`, payload);
	return body.data?.item ?? null;
}

export async function deleteAdminVocab(id) {
	await adminApi.delete(`${BASE}/vocab/${encodeURIComponent(id)}`);
}

export async function listAdminParticles(jlpt) {
	const body = await adminApi.get(`${BASE}/particles`, { params: jlpt ? { jlpt } : undefined });
	return body.data?.items ?? [];
}

export async function importAdminParticles(items, jlpt) {
	const body = await adminApi.post(`${BASE}/particles/import`, { items, jlpt });
	return body.data ?? {};
}

export async function createAdminParticle(payload) {
	const body = await adminApi.post(`${BASE}/particles`, payload);
	return body.data?.item ?? null;
}

export async function updateAdminParticle(id, payload) {
	const body = await adminApi.put(`${BASE}/particles/${encodeURIComponent(id)}`, payload);
	return body.data?.item ?? null;
}

export async function deleteAdminParticle(id) {
	await adminApi.delete(`${BASE}/particles/${encodeURIComponent(id)}`);
}
