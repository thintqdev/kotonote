import {
	ARENA_DEFAULT_END,
	ARENA_DEFAULT_START,
	ARENA_DEFAULT_TIMEZONE,
	ARENA_DEFAULT_WEEKDAYS,
} from '../constants/arena.js';

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const WEEKDAY_SHORT_TO_INDEX = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6,
};

/**
 * @param {string} raw
 */
export function parseHm(raw) {
	const s = String(raw || '').trim();
	if (s === '24:00') return 24 * 60;
	const m = s.match(TIME_RE);
	if (!m) return null;
	return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * @param {number} minutes
 */
export function formatHm(minutes) {
	const m = Math.max(0, Math.min(24 * 60, Math.floor(minutes)));
	if (m >= 24 * 60) return '24:00';
	const h = Math.floor(m / 60);
	const min = m % 60;
	return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/**
 * @param {Date} date
 * @param {string} [timeZone]
 */
export function getZonedDateKey(date = new Date(), timeZone = ARENA_DEFAULT_TIMEZONE) {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).formatToParts(date);
	const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
	const mo = parts.find((p) => p.type === 'month')?.value ?? '01';
	const d = parts.find((p) => p.type === 'day')?.value ?? '01';
	return `${y}-${mo}-${d}`;
}

/**
 * @param {Date} date
 * @param {string} [timeZone]
 * @returns {number} 0=Sun … 6=Sat
 */
export function getZonedWeekdayIndex(
	date = new Date(),
	timeZone = ARENA_DEFAULT_TIMEZONE,
) {
	const short = new Intl.DateTimeFormat('en-US', {
		timeZone,
		weekday: 'short',
	}).format(date);
	return WEEKDAY_SHORT_TO_INDEX[short] ?? 0;
}

/**
 * @param {Date} date
 * @param {string} [timeZone]
 * @returns {number} minutes since midnight in timezone
 */
export function getZonedMinutesSinceMidnight(
	date = new Date(),
	timeZone = ARENA_DEFAULT_TIMEZONE,
) {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).formatToParts(date);
	const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
	const min = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
	return h * 60 + min;
}

/**
 * @param {{ weekdays?: number[] }} settings
 */
export function normalizeArenaWeekdays(settings = {}) {
	const raw = Array.isArray(settings.weekdays) ? settings.weekdays : ARENA_DEFAULT_WEEKDAYS;
	const set = new Set(
		raw
			.map((d) => Number(d))
			.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6),
	);
	if (!set.size) return [...ARENA_DEFAULT_WEEKDAYS];
	return [...set].sort((a, b) => a - b);
}

/**
 * @param {{ enabled?: boolean, startTime?: string, endTime?: string, timezone?: string, weekdays?: number[] }} settings
 * @param {Date} [now]
 */
export function getArenaWindowState(settings = {}, now = new Date()) {
	const timezone = settings.timezone || ARENA_DEFAULT_TIMEZONE;
	const enabled = settings.enabled !== false;
	const weekdays = normalizeArenaWeekdays(settings);
	const weekday = getZonedWeekdayIndex(now, timezone);
	const isScheduledDay = weekdays.includes(weekday);

	const startMin =
		parseHm(settings.startTime) ?? parseHm(ARENA_DEFAULT_START);
	const endMin = parseHm(settings.endTime) ?? parseHm(ARENA_DEFAULT_END);
	const nowMin = getZonedMinutesSinceMidnight(now, timezone);
	const dateKey = getZonedDateKey(now, timezone);

	if (!enabled || startMin == null || endMin == null || !isScheduledDay) {
		return {
			enabled,
			isScheduledDay,
			isOpen: false,
			dateKey,
			timezone,
			weekdays,
			weekday,
			startTime: settings.startTime || ARENA_DEFAULT_START,
			endTime: settings.endTime || ARENA_DEFAULT_END,
			nowMinutes: nowMin,
		};
	}

	let isOpen = false;
	if (endMin > startMin) {
		isOpen = nowMin >= startMin && nowMin < endMin;
	} else if (endMin < startMin) {
		isOpen = nowMin >= startMin || nowMin < endMin;
	}

	return {
		enabled: true,
		isScheduledDay: true,
		isOpen,
		dateKey,
		timezone,
		weekdays,
		weekday,
		startTime: settings.startTime || ARENA_DEFAULT_START,
		endTime: settings.endTime || ARENA_DEFAULT_END,
		nowMinutes: nowMin,
	};
}

/**
 * @param {{ timezone?: string, weekdays?: number[], startTime?: string, endTime?: string }} settings
 * @param {Date} [now]
 */
export function getNextArenaSession(settings = {}, now = new Date()) {
	const timezone = settings.timezone || ARENA_DEFAULT_TIMEZONE;
	const weekdays = normalizeArenaWeekdays(settings);
	const startTime = settings.startTime || ARENA_DEFAULT_START;
	const endTime = settings.endTime || ARENA_DEFAULT_END;

	for (let offset = 0; offset < 14; offset += 1) {
		const d = new Date(now.getTime() + offset * 86_400_000);
		const wd = getZonedWeekdayIndex(d, timezone);
		if (!weekdays.includes(wd)) continue;
		return {
			dateKey: getZonedDateKey(d, timezone),
			weekday: wd,
			startTime,
			endTime,
			timezone,
			daysFromNow: offset,
		};
	}
	return null;
}

/**
 * @param {{ startTime?: string, reminderMinutesBefore?: number }} settings
 * @param {{ isScheduledDay?: boolean, isOpen?: boolean, nowMinutes?: number }} window
 */
export function isArenaReminderWindow(settings = {}, window = {}) {
	if (!window.isScheduledDay || window.isOpen) return false;
	const startMin = parseHm(settings.startTime);
	if (startMin == null) return false;
	const before = Number(settings.reminderMinutesBefore) || 30;
	const target = startMin - before;
	const nowMin = window.nowMinutes ?? 0;
	return nowMin >= target && nowMin < startMin;
}

/**
 * Phút còn lại tới giờ mở (chỉ trên ngày có lịch, trước khi mở).
 */
export function minutesUntilArenaOpen(settings = {}, window = {}, now = new Date()) {
	if (!window.isScheduledDay || window.isOpen) return null;
	const startMin = parseHm(settings.startTime);
	if (startMin == null) return null;
	const nowMin = window.nowMinutes ?? getZonedMinutesSinceMidnight(now, window.timezone);
	if (nowMin >= startMin) return null;
	return startMin - nowMin;
}
