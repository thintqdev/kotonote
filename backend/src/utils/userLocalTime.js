import {
	DEFAULT_TIMEZONE_BY_REGION,
	normalizeProfileTimeZoneKey,
} from '../constants/profileLocale.js';

const OFFSET_MINUTES = {
	'gmt+7': 7 * 60,
	'gmt+9': 9 * 60,
};

/**
 * @param {string} timeZoneKey
 * @param {string} [regionKey]
 */
export function resolveUserOffsetMinutes(timeZoneKey, regionKey = '') {
	const key =
		normalizeProfileTimeZoneKey(timeZoneKey, regionKey) ||
		DEFAULT_TIMEZONE_BY_REGION.vn;
	return OFFSET_MINUTES[key] ?? OFFSET_MINUTES['gmt+7'];
}

/**
 * Thời điểm local của user (offset cố định GMT+7/+9).
 * @param {Date} [now]
 * @param {number} offsetMinutes
 */
export function getUserLocalDateParts(now = new Date(), offsetMinutes) {
	const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
	const local = new Date(utcMs + offsetMinutes * 60_000);
	const y = local.getUTCFullYear();
	const m = String(local.getUTCMonth() + 1).padStart(2, '0');
	const d = String(local.getUTCDate()).padStart(2, '0');
	const hh = String(local.getUTCHours()).padStart(2, '0');
	const mm = String(local.getUTCMinutes()).padStart(2, '0');
	return {
		dateIso: `${y}-${m}-${d}`,
		time: `${hh}:${mm}`,
		dayOfWeek: local.getUTCDay(),
	};
}

/** @param {number} dayOfWeek 0=CN … 6=T7 */
export function isWeekendDay(dayOfWeek) {
	return dayOfWeek === 0 || dayOfWeek === 6;
}

/** Thứ Hai (YYYY-MM-DD) của tuần chứa `now` theo offset user. */
export function getUserLocalWeekStartIso(now = new Date(), offsetMinutes) {
	const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
	const local = new Date(utcMs + offsetMinutes * 60_000);
	const y = local.getUTCFullYear();
	const m = local.getUTCMonth();
	const d = local.getUTCDate();
	const day = local.getUTCDay();
	const mondayOffset = (day + 6) % 7;
	const mon = new Date(Date.UTC(y, m, d - mondayOffset, 12, 0, 0, 0));
	const my = mon.getUTCFullYear();
	const mm = String(mon.getUTCMonth() + 1).padStart(2, '0');
	const md = String(mon.getUTCDate()).padStart(2, '0');
	return `${my}-${mm}-${md}`;
}
