import { PROFILE } from '../constants/apiEndpoints.js';
import api from './api.js';

/** Cần JWT user — không gọi khi chưa đăng nhập. */

export async function getMyFocusAreas() {
	const body = await api.get(PROFILE.FOCUS_AREAS);
	return body.data?.focus ?? null;
}

/**
 * @param {string[]} focusAreaKeys
 */
export async function updateMyFocusAreas(focusAreaKeys) {
	const body = await api.put(PROFILE.FOCUS_AREAS, { focusAreaKeys });
	return body.data?.focus ?? null;
}
