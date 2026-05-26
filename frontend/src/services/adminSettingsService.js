import { ADMIN_SETTINGS } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

export async function getAdminStudioSettings() {
	const body = await adminApi.get(ADMIN_SETTINGS.BASE);
	return getApiData(body)?.settings ?? null;
}
