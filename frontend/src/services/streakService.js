import { STREAK } from '../constants/apiEndpoints.js';
import api from './api.js';

/** Cần JWT user — không gọi khi chưa đăng nhập. */

export async function getMyStreak() {
	const body = await api.get(STREAK.ME);
	return body.data?.streak ?? null;
}

export async function checkInStreak() {
	const body = await api.post(STREAK.CHECK_IN);
	return body.data ?? {};
}

/** Ngày local YYYY-MM-DD từ ISO / Date API */
export function streakDateToIsoLocal(d) {
	const dt = d instanceof Date ? d : new Date(d);
	if (Number.isNaN(dt.getTime())) return '';
	const y = dt.getFullYear();
	const m = String(dt.getMonth() + 1).padStart(2, '0');
	const day = String(dt.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

/**
 * @param {object | null} streak — document từ GET /streaks/me
 * @param {number} [fallbackCount]
 */
export function mapStreakToCardState(streak, fallbackCount = 0) {
	if (!streak) {
		return { count: fallbackCount, checkIns: [] };
	}
	const checkIns = [
		...new Set(
			(streak.checkInDates ?? [])
				.map(streakDateToIsoLocal)
				.filter(Boolean),
		),
	].sort();
	return {
		count:
			typeof streak.currentStreak === 'number' && streak.currentStreak >= 0
				? streak.currentStreak
				: fallbackCount,
		checkIns,
	};
}
