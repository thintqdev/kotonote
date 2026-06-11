const VALID_TYPES = new Set([
	'grammar_form',
	'particle',
	'conjugation',
	'usage',
]);

/**
 * @param {unknown} raw
 * @param {number} index
 */
function normalizeImportItem(raw, index) {
	if (!raw || typeof raw !== 'object') return null;

	const promptJa = String(raw.promptJa ?? raw.sentenceJa ?? '').trim();
	const promptVi = String(raw.promptVi ?? raw.instructionVi ?? '').trim();
	const options = Array.isArray(raw.options)
		? raw.options.map((o) => String(o ?? '').trim()).filter(Boolean)
		: [];

	if (!promptJa || options.length < 2) return null;

	while (options.length < 4) {
		options.push('—');
	}

	let answerIndex = Number(raw.answerIndex);
	if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
		answerIndex = 0;
	}

	const type = VALID_TYPES.has(raw.type) ? raw.type : 'grammar_form';

	return {
		type,
		promptJa,
		promptVi,
		options: options.slice(0, 4),
		answerIndex,
		explainVi: String(raw.explainVi ?? raw.explanationVi ?? '').trim(),
		pattern: String(raw.pattern ?? '').trim(),
		_index: index,
	};
}

/**
 * @param {string} text
 */
export function parseGrammarPracticeImportJson(text) {
	const trimmed = String(text ?? '').trim();
	if (!trimmed) {
		return { ok: false, error: 'JSON trống' };
	}

	let parsed;
	try {
		parsed = JSON.parse(trimmed);
	} catch {
		return { ok: false, error: 'JSON không hợp lệ' };
	}

	const list = Array.isArray(parsed)
		? parsed
		: parsed && typeof parsed === 'object' && Array.isArray(parsed.questions)
			? parsed.questions
			: null;

	if (!list?.length) {
		return {
			ok: false,
			error: 'Cần mảng câu hỏi `[...]` hoặc object `{ "questions": [...] }`',
		};
	}

	if (list.length > 200) {
		return { ok: false, error: 'Tối đa 200 câu mỗi lần import' };
	}

	const items = [];
	const errors = [];
	const seen = new Set();

	for (let i = 0; i < list.length; i += 1) {
		const row = normalizeImportItem(list[i], i);
		if (!row) {
			errors.push(`Dòng ${i + 1}: thiếu promptJa hoặc options`);
			continue;
		}
		const sig = `${row.promptJa}|${row.options.join('|')}`;
		if (seen.has(sig)) {
			errors.push(`Dòng ${i + 1}: trùng câu hỏi`);
			continue;
		}
		seen.add(sig);
		const { _index: _i, ...item } = row;
		items.push(item);
	}

	if (!items.length) {
		return {
			ok: false,
			error: 'Không có câu hợp lệ',
			errors,
		};
	}

	return { ok: true, items, errors, total: list.length };
}

export const GRAMMAR_PRACTICE_IMPORT_SAMPLE = `[
  {
    "type": "particle",
    "promptJa": "彼は日本語＿＿＿上手です。",
    "promptVi": "Chọn trợ từ đúng",
    "options": ["が", "を", "に", "で"],
    "answerIndex": 0,
    "explainVi": "が đánh dấu chủ ngữ của 上手だ",
    "pattern": "が"
  },
  {
    "type": "grammar_form",
    "promptJa": "明日、友達＿＿＿会います。",
    "promptVi": "Chọn dạng đúng",
    "options": ["に", "で", "を", "が"],
    "answerIndex": 0,
    "explainVi": "に dùng với 会う (gặp ai)",
    "pattern": "に"
  }
]`;
