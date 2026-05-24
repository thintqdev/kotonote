import { sanitizeKanaReading } from './japaneseReadingSanitize.js';

/**
 * @param {unknown} raw
 */
function unwrapJournalRoot(raw) {
	if (!raw || typeof raw !== 'object') return null;
	const o = /** @type {Record<string, unknown>} */ (raw);
	for (const key of ['analysis', 'journal', 'data', 'result']) {
		const nested = o[key];
		if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
			return nested;
		}
	}
	return o;
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function parseOverallScore(value) {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}
	const s = String(value ?? '').trim();
	if (!s) return null;
	const m = s.match(/(\d{1,3})/);
	if (!m) return null;
	const n = Number(m[1]);
	return Number.isFinite(n) ? n : null;
}

/**
 * @param {string} contentJa
 */
function sentencesFromContent(contentJa) {
	return contentJa
		.split(/[。！？\n]+/)
		.map((s) => s.trim())
		.filter(Boolean)
		.map((textJa, index) => ({
			index,
			textJa,
			reading: '',
			translationVi: '',
			feedbackVi: '',
			wordSuggestions: [],
		}));
}

/**
 * @param {unknown} raw
 * @param {{ contentJa?: string, jlpt?: string }} [opts]
 * @returns {object | null}
 */
export function normalizeJournalAnalysisFromAI(raw, opts = {}) {
	const root = unwrapJournalRoot(raw);
	if (!root || typeof root !== 'object') return null;
	const o = /** @type {Record<string, unknown>} */ (root);

	const scoreRaw = o.overallScore ?? o.score ?? o.overall_score;
	let overallScore = parseOverallScore(scoreRaw);
	if (overallScore == null) {
		overallScore = 65;
	}

	const sentencesRaw = Array.isArray(o.sentences) ? o.sentences : [];
	let sentences = sentencesRaw
		.map((item, idx) => {
			if (!item || typeof item !== 'object') return null;
			const s = /** @type {Record<string, unknown>} */ (item);
			const textJa = String(s.textJa ?? s.ja ?? s.sentence ?? '').trim();
			if (!textJa) return null;

			const suggestionsRaw = Array.isArray(s.wordSuggestions)
				? s.wordSuggestions
				: Array.isArray(s.suggestions)
					? s.suggestions
					: [];
			const wordSuggestions = suggestionsRaw
				.slice(0, 3)
				.map((w) => {
					if (!w || typeof w !== 'object') return null;
					const x = /** @type {Record<string, unknown>} */ (w);
					const suggestedJa = String(
						x.suggestedJa ?? x.replacementJa ?? x.suggested ?? '',
					).trim();
					if (!suggestedJa) return null;
					const original = String(x.original ?? x.word ?? '').trim();
					return {
						original,
						suggestedJa,
						suggestedReading: sanitizeKanaReading(
							suggestedJa,
							String(x.suggestedReading ?? x.replacementReading ?? ''),
						),
						reasonVi: String(x.reasonVi ?? x.reason ?? '').trim(),
					};
				})
				.filter(Boolean);

			return {
				index: Number(s.index ?? idx),
				textJa,
				reading: sanitizeKanaReading(textJa, String(s.reading ?? '')),
				translationVi: String(s.translationVi ?? s.vi ?? '').trim(),
				feedbackVi: String(s.feedbackVi ?? s.feedback ?? '').trim(),
				wordSuggestions,
			};
		})
		.filter(Boolean);

	if (!sentences.length && opts.contentJa) {
		sentences = sentencesFromContent(opts.contentJa);
	}

	const strengthsVi = (Array.isArray(o.strengthsVi) ? o.strengthsVi : [])
		.map((x) => String(x).trim())
		.filter(Boolean);
	const improvementsVi = (Array.isArray(o.improvementsVi) ? o.improvementsVi : [])
		.map((x) => String(x).trim())
		.filter(Boolean);

	const summaryVi = String(o.summaryVi ?? o.summary ?? '').trim();

	return {
		overallScore: Math.min(100, Math.max(0, Math.round(overallScore))),
		levelEstimate: String(o.levelEstimate ?? o.level ?? opts.jlpt ?? '').trim(),
		summaryVi:
			summaryVi ||
			'Đã phân tích bài viết. Xem chi tiết từng câu bên dưới.',
		strengthsVi,
		improvementsVi,
		sentences,
	};
}
