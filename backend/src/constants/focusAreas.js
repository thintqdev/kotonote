/** Môn / kỹ năng user có thể chọn làm trọng tâm ôn trên hồ sơ */
export const FOCUS_AREA_KEYS = [
	'grammar',
	'vocab',
	'kanji',
	'reading',
	'listening',
];

export const FOCUS_AREA_MAX = 4;

export const DEFAULT_FOCUS_AREA_KEYS = ['grammar', 'vocab', 'kanji'];

/** @param {unknown} keys */
export function normalizeFocusAreaKeys(keys) {
	if (!Array.isArray(keys)) return [...DEFAULT_FOCUS_AREA_KEYS];
	const seen = new Set();
	const out = [];
	for (const raw of keys) {
		const k = String(raw || '').trim().toLowerCase();
		if (!FOCUS_AREA_KEYS.includes(k) || seen.has(k)) continue;
		seen.add(k);
		out.push(k);
		if (out.length >= FOCUS_AREA_MAX) break;
	}
	return out.length ? out : [...DEFAULT_FOCUS_AREA_KEYS];
}

export function focusAreaOptionsPayload() {
	return FOCUS_AREA_KEYS.map((key) => ({
		key,
		route:
			key === 'vocab'
				? '/vocabulary'
				: key === 'grammar'
					? '/grammar'
					: `/${key}`,
	}));
}
