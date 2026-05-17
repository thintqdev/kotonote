export const PROFILE_REGION_KEYS = ['vn', 'jp'];

export const PROFILE_TIMEZONE_KEYS = ['gmt+7', 'gmt+9'];

export const DEFAULT_TIMEZONE_BY_REGION = {
	vn: 'gmt+7',
	jp: 'gmt+9',
};

/** Múi giờ khớp khu vực — dùng lọc select */
export const PROFILE_TIMEZONES = [
	{ key: 'gmt+7', region: 'vn' },
	{ key: 'gmt+9', region: 'jp' },
];

/** @param {unknown} value */
export function normalizeProfileRegionKey(value) {
	const s = String(value || '').trim().toLowerCase();
	if (PROFILE_REGION_KEYS.includes(s)) return s;
	const raw = String(value || '').toLowerCase();
	if (raw.includes('việt') || raw.includes('viet') || raw.includes('vn')) {
		return 'vn';
	}
	if (
		raw.includes('nhật') ||
		raw.includes('japan') ||
		raw.includes('日本') ||
		raw.includes('nihon')
	) {
		return 'jp';
	}
	return '';
}

/**
 * @param {unknown} value
 * @param {string} [regionKey]
 */
export function normalizeProfileTimeZoneKey(value, regionKey = '') {
	const s = String(value || '').trim().toLowerCase();
	if (PROFILE_TIMEZONE_KEYS.includes(s)) return s;
	const raw = String(value || '').toLowerCase();
	if (/gmt\+7|utc\+7|ict|indochina/.test(raw)) return 'gmt+7';
	if (/gmt\+9|utc\+9|jst|tokyo/.test(raw)) return 'gmt+9';
	const region = normalizeProfileRegionKey(regionKey);
	if (region && DEFAULT_TIMEZONE_BY_REGION[region]) {
		return DEFAULT_TIMEZONE_BY_REGION[region];
	}
	return '';
}

/**
 * @param {import('i18next').TFunction} t
 * @param {string} regionKey
 */
export function profileRegionLabel(t, regionKey) {
	const k = normalizeProfileRegionKey(regionKey);
	if (!k) return regionKey ? String(regionKey) : '—';
	return t(`profile.regions.${k}`);
}

/**
 * @param {import('i18next').TFunction} t
 * @param {string} timeZoneKey
 */
export function profileTimeZoneLabel(t, timeZoneKey) {
	const k = normalizeProfileTimeZoneKey(timeZoneKey);
	if (!k) return timeZoneKey ? String(timeZoneKey) : '—';
	return t(`profile.timezones.${k}`);
}
