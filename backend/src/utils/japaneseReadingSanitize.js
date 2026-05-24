const LATIN = /[A-Za-z]/;
const KANA = /[\u3040-\u309F\u30A0-\u30FF]/;

/**
 * Chuỗi chỉ là romaji (có chữ Latin, không có kana).
 * @param {string} str
 */
export function isRomajiOnly(str) {
	const s = String(str ?? '').trim();
	if (!s) return false;
	return LATIN.test(s) && !KANA.test(s);
}

/**
 * Chuẩn hóa trường đọc: bỏ romaji; nếu thiếu/kana sai thì fallback sang primary khi primary có kana.
 * @param {string} primary — từ/cụm tiếng Nhật (word, phraseJa, char…)
 * @param {string} [reading]
 */
export function sanitizeKanaReading(primary, reading) {
	const r = String(reading ?? '').trim();
	const p = String(primary ?? '').trim();

	if (r && !isRomajiOnly(r)) {
		return r;
	}

	if (p && KANA.test(p)) {
		return p;
	}

	return '';
}

/**
 * @param {string} value
 * @param {string} [fallbackPrimary]
 */
export function sanitizeOnYomiReading(value, fallbackPrimary = '') {
	return sanitizeKanaReading(fallbackPrimary, value);
}

/**
 * @param {string} value
 * @param {string} [fallbackPrimary]
 */
export function sanitizeKunYomiReading(value, fallbackPrimary = '') {
	const v = sanitizeKanaReading(fallbackPrimary, value);
	return v || '—';
}
