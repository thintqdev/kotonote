import { PROFILE } from '../constants/apiEndpoints.js';
import api from './api.js';

/** Cần JWT user — không gọi khi chưa đăng nhập. */

export async function getMyLearningSummary() {
	const body = await api.get(PROFILE.LEARNING_SUMMARY);
	return body.data?.summary ?? null;
}
