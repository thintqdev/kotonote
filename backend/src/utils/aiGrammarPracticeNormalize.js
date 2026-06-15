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
export function normalizeOneGrammarPracticeQuestion(raw, index) {
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
	const four = options.slice(0, 4);

	let answerIndex = Number(raw.answerIndex);
	if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
		answerIndex = 0;
	}

	const type = VALID_TYPES.has(raw.type) ? raw.type : 'grammar_form';
	const explainVi = String(raw.explainVi ?? raw.explanationVi ?? '').trim();
	const pattern = String(raw.pattern ?? '').trim();

	return {
		id: String(raw.id ?? `q${index + 1}`),
		type,
		promptJa,
		promptVi,
		options: four,
		answerIndex,
		explainVi: explainVi || 'Đáp án đúng theo ngữ pháp JLPT tương ứng.',
		pattern,
	};
}

/**
 * @param {unknown} aiRaw
 * @param {number} expectedCount
 */
export function normalizeGrammarPracticeFromAI(aiRaw, expectedCount) {
	const list = Array.isArray(aiRaw) ? aiRaw : [];
	const seen = new Set();
	const out = [];

	for (let i = 0; i < list.length; i += 1) {
		const row = normalizeOneGrammarPracticeQuestion(list[i], i);
		if (!row) continue;
		const sig = `${row.promptJa}|${row.options.join('|')}`;
		if (seen.has(sig)) continue;
		seen.add(sig);
		out.push(row);
		if (out.length >= expectedCount) break;
	}

	return out;
}

/**
 * Chuẩn hóa danh sách import JSON (không giới hạn số câu như AI).
 * @param {unknown} raw
 */
export function normalizeGrammarPracticeImportList(raw) {
	const list = Array.isArray(raw)
		? raw
		: raw && typeof raw === 'object' && Array.isArray(raw.questions)
			? raw.questions
			: [];

	const seen = new Set();
	const out = [];
	const errors = [];

	for (let i = 0; i < list.length; i += 1) {
		const row = normalizeOneGrammarPracticeQuestion(list[i], i);
		if (!row) {
			errors.push({ index: i, message: 'Thiếu promptJa hoặc options hợp lệ' });
			continue;
		}
		const sig = `${row.promptJa}|${row.options.join('|')}`;
		if (seen.has(sig)) {
			errors.push({ index: i, message: 'Trùng câu hỏi trong file' });
			continue;
		}
		seen.add(sig);
		out.push(row);
	}

	return { questions: out, errors };
}
