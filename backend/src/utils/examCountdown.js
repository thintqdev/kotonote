import { EXAM_COUNTDOWN_DAYS } from '../constants/smartReminders.js';
import { getUserLocalDateParts } from './userLocalTime.js';

/**
 * Số ngày lịch tới ngày thi (theo ngày local của user).
 * @param {string} examDateIso YYYY-MM-DD
 * @param {number} offsetMinutes
 * @param {Date} [now]
 * @returns {number | null} null nếu không hợp lệ
 */
export function daysUntilExamForUser(examDateIso, offsetMinutes, now = new Date()) {
	const iso = String(examDateIso || '').trim();
	if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

	const todayIso = getUserLocalDateParts(now, offsetMinutes).dateIso;
	const [ty, tm, td] = todayIso.split('-').map(Number);
	const [ey, em, ed] = iso.split('-').map(Number);
	const tMs = Date.UTC(ty, tm - 1, td);
	const eMs = Date.UTC(ey, em - 1, ed);
	return Math.round((eMs - tMs) / 86400000);
}

/**
 * @param {number | null} daysUntil
 */
export function isExamCountdownMilestone(daysUntil) {
	if (daysUntil == null || daysUntil <= 0) return false;
	return EXAM_COUNTDOWN_DAYS.includes(daysUntil);
}
