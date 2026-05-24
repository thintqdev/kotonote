import {
	sanitizeKunYomiReading,
	sanitizeOnYomiReading,
} from './japaneseReadingSanitize.js';

/**
 * Chuẩn hóa object kanji từ AI / JSON import.
 * @param {unknown} raw
 * @returns {object | null}
 */
export function normalizeKanjiFromAI(raw) {
	if (!raw || typeof raw !== 'object') {
		return null;
	}

	const o = /** @type {Record<string, unknown>} */ (raw);
	const char = String(o.char ?? '').trim();
	const onYomi = sanitizeOnYomiReading(String(o.onYomi ?? o.on ?? ''), char);
	const hanViet = String(o.hanViet ?? o.hanVietReading ?? '').trim();
	const meaningVi = String(o.meaningVi ?? o.meaning ?? '').trim();
	const vocabJa = String(o.vocabJa ?? o.vocabulary ?? '').trim();
	const exampleJa = String(o.exampleJa ?? o.example ?? '').trim();
	const exampleVi = String(o.exampleVi ?? o.exampleMeaning ?? '').trim();

	if (!char || !onYomi || !hanViet || !meaningVi || !vocabJa || !exampleJa || !exampleVi) {
		return null;
	}

	const kunYomi = sanitizeKunYomiReading(
		String(o.kunYomi ?? o.kun ?? ''),
		char,
	);
	const displayOrder = Number(o.displayOrder);

	const payload = {
		char,
		onYomi,
		kunYomi,
		hanViet,
		meaningVi,
		vocabJa,
		exampleJa,
		exampleVi,
		displayOrder:
			Number.isFinite(displayOrder) && displayOrder >= 0 ? displayOrder : undefined,
	};

	return Object.fromEntries(
		Object.entries(payload).filter(([, v]) => v !== undefined)
	);
}

/**
 * @param {unknown} data
 * @returns {object[]}
 */
export function normalizeKanjiListFromAI(data) {
	if (!Array.isArray(data)) {
		return [];
	}
	return data.map((item) => normalizeKanjiFromAI(item)).filter(Boolean);
}
