export const PROFILE_REGION_KEYS = ['vn', 'jp'];

export const PROFILE_TIMEZONE_KEYS = ['gmt+7', 'gmt+9'];

export const DEFAULT_TIMEZONE_BY_REGION = {
	vn: 'gmt+7',
	jp: 'gmt+9',
};

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
