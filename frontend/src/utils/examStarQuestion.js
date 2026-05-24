/**
 * Dạng ★問題 — câu có ô trống ____ và dấu ★ đánh vị trí cần chọn.
 * Ví dụ: きょうは ____ ____ ★ ____ 。
 */

/** @typedef {{ type: 'text', value: string } | { type: 'blank', star: boolean }} StarQuestionToken */

/**
 * @param {string} source
 * @returns {StarQuestionToken[]}
 */
export function tokenizeStarQuestionLine(source = '') {
	/** @type {StarQuestionToken[]} */
	const tokens = [];
	if (!source) return tokens;

	const parts = String(source).split(/(____+|★)/g).filter((p) => p !== '');
	let starNextBlank = false;

	for (const part of parts) {
		if (part === '★') {
			starNextBlank = true;
			continue;
		}
		if (/^_+$/.test(part)) {
			tokens.push({ type: 'blank', star: starNextBlank });
			starNextBlank = false;
			continue;
		}
		tokens.push({ type: 'text', value: part });
	}

	return tokens;
}

/** @param {string} source */
export function isStarQuestionText(source) {
	return String(source).includes('★') && /_{2,}/.test(String(source));
}

/** @param {{ questionType?: string, questionJa?: string, questionVi?: string }} question */
export function isStarQuestion(question) {
	if (question?.questionType === 'star_question') return true;
	return isStarQuestionText(question?.questionJa || question?.questionVi || '');
}

/**
 * Ghép câu hoàn chỉnh khi đã biết đáp án ★ (preview sau nộp bài).
 * @param {string} line
 * @param {string[]} choices
 * @param {number} answerIndex
 */
export function buildStarQuestionFilledLine(line, choices, answerIndex) {
	const tokens = tokenizeStarQuestionLine(line);
	let choiceIdx = 0;
	return tokens
		.map((tok) => {
			if (tok.type === 'text') return tok.value;
			const fill =
				tok.star && typeof answerIndex === 'number'
					? String(choices[answerIndex] ?? '').trim()
					: String(choices[choiceIdx++] ?? '').trim();
			return fill || '＿＿';
		})
		.join('');
}
