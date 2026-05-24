import { ADMIN_KAIWA } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {Record<string, unknown>} [params]
 */
export async function listAdminKaiwaContexts(params = {}) {
	const body = await adminApi.get(ADMIN_KAIWA.BASE, { params });
	return {
		items: body.data?.items ?? [],
		pagination: body.pagination ?? null,
	};
}

export async function getAdminKaiwaContext(id) {
	const body = await adminApi.get(ADMIN_KAIWA.context(id));
	return getApiData(body).context;
}

export async function createAdminKaiwaContext(payload) {
	const body = await adminApi.post(ADMIN_KAIWA.BASE, payload);
	return getApiData(body).context;
}

export async function updateAdminKaiwaContext(id, payload) {
	const body = await adminApi.put(ADMIN_KAIWA.context(id), payload);
	return getApiData(body).context;
}

export async function deleteAdminKaiwaContext(id) {
	await adminApi.delete(ADMIN_KAIWA.context(id));
}
