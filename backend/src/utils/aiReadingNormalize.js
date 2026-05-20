/**
 * @param {unknown} raw
 * @returns {object | null}
 */
function normalizeQuestion(raw) {
	if (!raw || typeof raw !== 'object') {
		return null;
	}
	const q = /** @type {Record<string, unknown>} */ (raw);
	const questionJa = String(q.questionJa ?? '').trim();
	const choicesJa = Array.isArray(q.choicesJa)
		? q.choicesJa.map((c) => String(c).trim()).filter(Boolean)
		: [];
	if (!questionJa || choicesJa.length < 2) {
		return null;
	}
	const answerIndex = Math.min(
		Math.max(0, Number(q.answerIndex) || 0),
		choicesJa.length - 1,
	);
	const explainRaw =
		q.explainPerChoice && typeof q.explainPerChoice === 'object'
			? q.explainPerChoice
			: {};
	const ex = /** @type {Record<string, unknown>} */ (explainRaw);
	const pad = (arr) => {
		const base = Array.isArray(arr)
			? arr.map((s) => String(s).trim())
			: [];
		while (base.length < choicesJa.length) base.push('');
		return base.slice(0, choicesJa.length);
	};
	return {
		questionJa,
		choicesJa,
		answerIndex,
		explainPerChoice: {
			ja: pad(ex.ja),
			vi: pad(ex.vi),
		},
	};
}

/**
 * @param {unknown} raw
 * @returns {object | null}
 */
export function normalizeReadingArticleFromAI(raw) {
	if (!raw || typeof raw !== 'object') {
		return null;
	}
	const o = /** @type {Record<string, unknown>} */ (raw);
	const titleJa = String(o.titleJa ?? o.title ?? '').trim();
	const paragraphsJa = Array.isArray(o.paragraphsJa)
		? o.paragraphsJa.map((p) => String(p).trim()).filter(Boolean)
		: Array.isArray(o.paragraphs)
			? o.paragraphs.map((p) => String(p).trim()).filter(Boolean)
			: [];

	if (!titleJa || paragraphsJa.length === 0) {
		return null;
	}

	const vocabulary = Array.isArray(o.vocabulary)
		? o.vocabulary
				.map((v) => {
					if (!v || typeof v !== 'object') return null;
					const item = /** @type {Record<string, unknown>} */ (v);
					const termJa = String(item.termJa ?? item.word ?? '').trim();
					if (!termJa) return null;
					const glossRaw =
						item.gloss && typeof item.gloss === 'object'
							? item.gloss
							: item;
					const g = /** @type {Record<string, unknown>} */ (glossRaw);
					return {
						termJa,
						gloss: {
							vi: String(g.vi ?? g.glossVi ?? '').trim(),
							ja: String(g.ja ?? g.glossJa ?? '').trim(),
						},
					};
				})
				.filter(Boolean)
		: [];

	const questions = Array.isArray(o.questions)
		? o.questions.map((q) => normalizeQuestion(q)).filter(Boolean)
		: [];

	return {
		titleJa,
		snippetJa: String(o.snippetJa ?? o.snippet ?? '').trim(),
		paragraphsJa,
		vocabulary,
		questions,
	};
}
