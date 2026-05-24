import { normalizeVocabularyListFromAI } from './aiVocabularyNormalize.js';
import { normalizeKanjiListFromAI } from './aiKanjiNormalize.js';

const DECK_JSON_SUFFIX = {
	vocabulary: `
Trả về CHỈ một object JSON hợp lệ (không markdown):
{
  "deck": {
    "title": "tên deck tiếng Việt (ngắn)",
    "titleJa": "tên deck tiếng Nhật",
    "description": "mô tả deck tiếng Việt (1–2 câu)",
    "descriptionJa": "mô tả tiếng Nhật ngắn"
  },
  "vocabulary": [ /* mỗi mục theo yêu cầu ở trên */ ]
}`,
	kanji: `
Trả về CHỈ một object JSON hợp lệ (không markdown):
{
  "deck": {
    "titleVi": "tên deck tiếng Việt (ngắn)",
    "titleJa": "tên deck tiếng Nhật",
    "descriptionVi": "mô tả deck tiếng Việt (1–2 câu)",
    "descriptionJa": "mô tả tiếng Nhật ngắn"
  },
  "kanji": [ /* mỗi mục theo yêu cầu ở trên */ ]
}`,
};

/**
 * @param {'vocabulary'|'kanji'} type
 */
export function getDeckBundleJsonSuffix(type) {
	return DECK_JSON_SUFFIX[type] ?? '';
}

/**
 * @param {unknown} raw
 * @param {'vocabulary'|'kanji'} type
 */
export function normalizeDeckMetaFromAI(raw, type) {
	if (!raw || typeof raw !== 'object') return null;
	const o = /** @type {Record<string, unknown>} */ (raw);
	const deck = o.deck;
	if (!deck || typeof deck !== 'object') return null;
	const d = /** @type {Record<string, unknown>} */ (deck);

	if (type === 'vocabulary') {
		const title = String(d.title ?? d.titleVi ?? '').trim();
		const titleJa = String(d.titleJa ?? '').trim();
		const description = String(d.description ?? d.descriptionVi ?? '').trim();
		const descriptionJa = String(d.descriptionJa ?? '').trim();
		if (!title && !titleJa && !description && !descriptionJa) return null;
		return { title, titleJa, description, descriptionJa };
	}

	const titleVi = String(d.titleVi ?? d.title ?? '').trim();
	const titleJa = String(d.titleJa ?? '').trim();
	const descriptionVi = String(d.descriptionVi ?? d.description ?? '').trim();
	const descriptionJa = String(d.descriptionJa ?? '').trim();
	if (!titleVi && !titleJa && !descriptionVi && !descriptionJa) return null;
	return { titleVi, titleJa, descriptionVi, descriptionJa };
}

/**
 * @param {unknown} data
 * @param {'vocabulary'|'kanji'} type
 */
export function normalizeDeckItemsBundleFromAI(data, type) {
	const itemsKey = type === 'kanji' ? 'kanji' : 'vocabulary';

	if (Array.isArray(data)) {
		const items =
			type === 'vocabulary'
				? normalizeVocabularyListFromAI(data)
				: normalizeKanjiListFromAI(data);
		return { deck: null, items };
	}

	if (!data || typeof data !== 'object') {
		return { deck: null, items: [] };
	}

	const o = /** @type {Record<string, unknown>} */ (data);
	const rawList = o[itemsKey];
	const items = Array.isArray(rawList)
		? type === 'vocabulary'
			? normalizeVocabularyListFromAI(rawList)
			: normalizeKanjiListFromAI(rawList)
		: [];

	return {
		deck: normalizeDeckMetaFromAI(o, type),
		items,
	};
}
