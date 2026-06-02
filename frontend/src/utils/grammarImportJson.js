import { GRAMMAR_JLPT_LEVELS, GRAMMAR_TAG_IDS } from '../constants/grammarFieldMeta.js';
import { normalizeGrammarCompare, normalizeLoc } from './grammarCompareNormalize.js';

const allowedJlpt = new Set(GRAMMAR_JLPT_LEVELS);
const allowedTags = new Set(GRAMMAR_TAG_IDS);

const META_KEY = /^_/;

/**
 * @param {unknown} raw
 */
function normalizeExamples(raw) {
	if (!Array.isArray(raw)) return [];
	return raw
		.map((ex) => {
			if (!ex || typeof ex !== 'object') return null;
			const e = /** @type {Record<string, unknown>} */ (ex);
			const ja = String(e.ja ?? '').trim();
			const vi = String(e.vi ?? '').trim();
			if (!ja && !vi) return null;
			return { ja, vi };
		})
		.filter(Boolean);
}

/**
 * @param {Record<string, unknown>} obj
 */
function stripMetaKeys(obj) {
	const next = { ...obj };
	for (const key of Object.keys(next)) {
		if (META_KEY.test(key)) delete next[key];
	}
	return next;
}

/**
 * Chuẩn hóa object import → shape API Grammar (trước grammarToForm).
 * @param {Record<string, unknown>} raw
 */
export function normalizeGrammarImportPayload(raw) {
	const o = stripMetaKeys(raw);
	const ngRaw = o.ng && typeof o.ng === 'object' ? o.ng : {};
	const ng = /** @type {Record<string, unknown>} */ (ngRaw);

	const practiceRaw =
		o.practice && typeof o.practice === 'object' ? o.practice : {};
	const practice = /** @type {Record<string, unknown>} */ (practiceRaw);

	const jlpt = String(o.jlpt ?? 'N3')
		.trim()
		.toUpperCase();

	return {
		slug: String(o.slug ?? '')
			.trim()
			.toLowerCase(),
		jlpt: allowedJlpt.has(jlpt) ? jlpt : 'N3',
		pattern: String(o.pattern ?? '').trim(),
		tagIds: Array.isArray(o.tagIds)
			? [...new Set(o.tagIds.map((t) => String(t).trim()).filter((t) => allowedTags.has(t)))]
			: [],
		isPublished: o.isPublished !== false,
		displayOrder: Number(o.displayOrder) || 0,
		teaser: normalizeLoc(o.teaser),
		topicRibbon: normalizeLoc(o.topicRibbon),
		connection: normalizeLoc(o.connection),
		meaning: normalizeLoc(o.meaning),
		usage: normalizeLoc(o.usage),
		usageNote: normalizeLoc(o.usageNote),
		pointBubble: normalizeLoc(o.pointBubble),
		examples: normalizeExamples(o.examples),
		ng: {
			ja: Array.isArray(ng.ja)
				? ng.ja.map((s) => String(s).trim()).filter(Boolean)
				: [],
			vi: Array.isArray(ng.vi)
				? ng.vi.map((s) => String(s).trim()).filter(Boolean)
				: [],
		},
		ngNote: normalizeLoc(o.ngNote),
		compare: normalizeGrammarCompare(o.compare),
		memo: normalizeLoc(o.memo),
		practice: {
			items: normalizeExamples(practice.items ?? o.practiceItems),
		},
	};
}

/**
 * @param {string} text
 * @returns {{ ok: true, data: ReturnType<typeof normalizeGrammarImportPayload> } | { ok: false, error: string }}
 */
export function parseGrammarImportJson(text) {
	const trimmed = String(text ?? '').trim();
	if (!trimmed) {
		return { ok: false, error: 'Chưa có nội dung JSON' };
	}

	let parsed;
	try {
		parsed = JSON.parse(trimmed);
	} catch {
		return { ok: false, error: 'JSON không hợp lệ — kiểm tra dấu phẩy, ngoặc' };
	}

	let raw = parsed;
	if (Array.isArray(parsed)) {
		if (parsed.length === 0) {
			return { ok: false, error: 'Mảng JSON rỗng' };
		}
		raw = parsed[0];
	} else if (parsed && typeof parsed === 'object' && parsed.grammar) {
		raw = parsed.grammar;
	}

	if (!raw || typeof raw !== 'object') {
		return { ok: false, error: 'Cần một object bài ngữ pháp (hoặc mảng 1 phần tử)' };
	}

	const data = normalizeGrammarImportPayload(
		/** @type {Record<string, unknown>} */ (raw),
	);

	if (!data.pattern && !data.slug) {
		return {
			ok: false,
			error: 'Thiếu pattern và slug — cần ít nhất một trong hai',
		};
	}

	return { ok: true, data };
}

/** URL tải file mẫu (public/). */
export const GRAMMAR_IMPORT_SAMPLE_URL = '/samples/grammar-import-sample.json';
