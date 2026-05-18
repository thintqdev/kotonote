import { PROFILE } from '../constants/apiEndpoints.js';
import api from './api.js';

export async function getMySettings() {
	const body = await api.get(PROFILE.SETTINGS);
	return body.data?.settings ?? null;
}

/**
 * @param {object} settings
 */
export async function updateMySettings(settings) {
	const body = await api.put(PROFILE.SETTINGS, settings);
	return body.data?.settings ?? null;
}
