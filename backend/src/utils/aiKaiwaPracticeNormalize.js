import { sanitizeKanaReading } from './japaneseReadingSanitize.js';

/**
 * @param {unknown} raw
 * @returns {object | null}
 */
export function normalizeKaiwaPracticeTurnFromAI(raw) {
	if (!raw || typeof raw !== 'object') return null;
	const o = /** @type {Record<string, unknown>} */ (raw);

	const partnerMessageJa = String(
		o.partnerMessageJa ?? o.partnerReplyJa ?? o.replyJa ?? '',
	).trim();
	if (!partnerMessageJa) return null;

	const suggestionRaw =
		o.suggestion && typeof o.suggestion === 'object'
			? o.suggestion
			: o.suggestedReply && typeof o.suggestedReply === 'object'
				? o.suggestedReply
				: null;
	const sug = /** @type {Record<string, unknown>} */ (suggestionRaw ?? {});

	const replyJa = String(sug.replyJa ?? sug.ja ?? o.suggestedReplyJa ?? '').trim();
	const replyReading = sanitizeKanaReading(
		replyJa,
		String(sug.replyReading ?? sug.reading ?? o.suggestedReplyReading ?? ''),
	);

	const analysisRaw =
		o.analysis && typeof o.analysis === 'object' ? o.analysis : o.feedback;
	const analysis =
		analysisRaw && typeof analysisRaw === 'object'
			? {
					summaryVi: String(
						/** @type {Record<string, unknown>} */ (analysisRaw).summaryVi ??
							/** @type {Record<string, unknown>} */ (analysisRaw).summary ??
							'',
					).trim(),
					grammarNoteVi: String(
						/** @type {Record<string, unknown>} */ (analysisRaw).grammarNoteVi ??
							/** @type {Record<string, unknown>} */ (analysisRaw).grammar ??
							'',
					).trim(),
					politenessVi: String(
						/** @type {Record<string, unknown>} */ (analysisRaw).politenessVi ??
							'',
					).trim(),
					naturalnessVi: String(
						/** @type {Record<string, unknown>} */ (analysisRaw).naturalnessVi ??
							'',
					).trim(),
				}
			: {
					summaryVi: String(o.feedbackVi ?? o.analysisVi ?? '').trim(),
					grammarNoteVi: '',
					politenessVi: '',
					naturalnessVi: '',
				};

	return {
		partnerMessageJa,
		partnerMessageVi: String(
			o.partnerMessageVi ?? o.partnerReplyVi ?? '',
		).trim(),
		analysis,
		suggestion: replyJa
			? {
					replyJa,
					replyReading,
					replyVi: String(sug.replyVi ?? sug.vi ?? o.suggestedReplyVi ?? '').trim(),
				}
			: null,
		conversationEnded: Boolean(o.conversationEnded),
	};
}
