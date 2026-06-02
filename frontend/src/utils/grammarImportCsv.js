import { csvRowToRecord, parseCsv } from './csvParse.js';
import { normalizeGrammarImportPayload } from './grammarImportJson.js';

const LOC_FIELDS = [
	'teaser',
	'topicRibbon',
	'connection',
	'meaning',
	'usage',
	'usageNote',
	'pointBubble',
	'memo',
	'ngNote',
];

function cell(record, key) {
	return String(record[key] ?? '').trim();
}

function parseTagIds(raw) {
	if (!raw) return [];
	return raw
		.split(/[|,;]/)
		.map((t) => t.trim())
		.filter(Boolean);
}

function parseBool(raw) {
	const v = String(raw ?? '')
		.trim()
		.toLowerCase();
	if (!v) return true;
	return v === 'true' || v === '1' || v === 'yes' || v === 'có';
}

function parseListCell(raw) {
	const s = String(raw ?? '').trim();
	if (!s) return [];
	return s
		.split(/\n|(?:\s*\|\s*)/)
		.map((l) => l.trim())
		.filter(Boolean);
}

/**
 * @param {string} raw
 * @param {string} label
 */
function parseJsonCell(raw, label) {
	const s = String(raw ?? '').trim();
	if (!s) return undefined;
	try {
		return JSON.parse(s);
	} catch {
		throw new Error(`${label}: JSON không hợp lệ`);
	}
}

/**
 * @param {Record<string, string>} record
 */
export function csvRecordToGrammarRaw(record) {
	const examplesJson = parseJsonCell(record.examples_json, 'examples_json');
	const practiceJson = parseJsonCell(record.practice_json, 'practice_json');
	const compareJson = parseJsonCell(record.compare_json, 'compare_json');

	/** @type {Record<string, unknown>} */
	const raw = {
		slug: cell(record, 'slug'),
		jlpt: cell(record, 'jlpt'),
		pattern: cell(record, 'pattern'),
		tagIds: parseTagIds(cell(record, 'tagIds')),
		isPublished: parseBool(record.isPublished),
		displayOrder: Number(cell(record, 'displayOrder')) || 0,
		examples: examplesJson,
		ng: {
			ja: parseListCell(record.ng_ja),
			vi: parseListCell(record.ng_vi),
		},
		compare: compareJson,
		practice: practiceJson,
	};

	for (const name of LOC_FIELDS) {
		raw[name] = {
			ja: cell(record, `${name}_ja`),
			vi: cell(record, `${name}_vi`),
		};
	}

	if (!examplesJson) {
		const examples = [];
		for (let n = 1; n <= 12; n += 1) {
			const ja = cell(record, `example${n}_ja`);
			const vi = cell(record, `example${n}_vi`);
			if (ja || vi) examples.push({ ja, vi });
		}
		if (examples.length) raw.examples = examples;
	}

	if (!practiceJson) {
		const items = [];
		for (let n = 1; n <= 12; n += 1) {
			const ja = cell(record, `practice${n}_ja`);
			const vi = cell(record, `practice${n}_vi`);
			if (ja || vi) items.push({ ja, vi });
		}
		if (items.length) raw.practice = { items };
	}

	return raw;
}

/**
 * @param {Record<string, string>} record
 */
function recordToPayload(record) {
	const raw = csvRecordToGrammarRaw(record);
	const data = normalizeGrammarImportPayload(raw);
	if (!data.pattern && !data.slug) {
		throw new Error('Thiếu slug và pattern');
	}
	return data;
}

/**
 * @param {string} text
 * @returns {{ ok: true, data: ReturnType<typeof normalizeGrammarImportPayload> } | { ok: false, error: string }}
 */
export function parseGrammarImportCsv(text) {
	const trimmed = String(text ?? '').trim();
	if (!trimmed) {
		return { ok: false, error: 'Chưa có nội dung CSV' };
	}

	try {
		const { headers, rows } = parseCsv(trimmed);
		if (!headers.length) {
			return { ok: false, error: 'CSV không có header' };
		}
		const dataRow = rows.find((r) => r.some((c) => String(c).trim()));
		if (!dataRow) {
			return { ok: false, error: 'CSV không có dòng dữ liệu' };
		}
		const record = csvRowToRecord(headers, dataRow);
		const data = recordToPayload(record);
		return { ok: true, data };
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : 'CSV không hợp lệ',
		};
	}
}

/**
 * Import nhiều bài (mỗi dòng CSV = 1 bài).
 * @param {string} text
 */
export function parseGrammarImportCsvBulk(text) {
	const trimmed = String(text ?? '').trim();
	if (!trimmed) {
		return { ok: false, error: 'Chưa có nội dung CSV', items: [] };
	}

	try {
		const { headers, rows } = parseCsv(trimmed);
		if (!headers.length) {
			return { ok: false, error: 'CSV không có header', items: [] };
		}

		const items = [];
		const errors = [];

		rows.forEach((row, idx) => {
			if (!row.some((c) => String(c).trim())) return;
			const line = idx + 2;
			try {
				const record = csvRowToRecord(headers, row);
				items.push(recordToPayload(record));
			} catch (e) {
				errors.push(
					`Dòng ${line}: ${e instanceof Error ? e.message : 'lỗi'}`,
				);
			}
		});

		if (items.length === 0) {
			return {
				ok: false,
				error: errors[0] ?? 'Không có dòng hợp lệ',
				items: [],
				errors,
			};
		}

		return { ok: true, items, errors };
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : 'CSV không hợp lệ',
			items: [],
		};
	}
}

export const GRAMMAR_IMPORT_CSV_SAMPLE_URL =
	'/samples/grammar-import-sample.csv';

export const GRAMMAR_IMPORT_CSV_BULK_SAMPLE_URL =
	'/samples/grammar-import-bulk-sample.csv';
