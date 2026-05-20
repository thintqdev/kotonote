import { emptyQuestion } from './readingForm.js';

/**
 * @param {ReturnType<import('./readingForm.js').emptyReadingForm>} form
 * @param {object} ai
 */
export function mergeReadingAIIntoForm(form, ai) {
	if (!ai) return form;

	const paragraphsText =
		Array.isArray(ai.paragraphsJa) && ai.paragraphsJa.length > 0
			? ai.paragraphsJa.join('\n\n')
			: form.paragraphsText;

	const vocabulary =
		Array.isArray(ai.vocabulary) && ai.vocabulary.length > 0
			? ai.vocabulary.map((v) => ({
					termJa: v.termJa ?? '',
					glossVi: v.gloss?.vi ?? '',
					glossJa: v.gloss?.ja ?? '',
				}))
			: form.vocabulary;

	const questions =
		Array.isArray(ai.questions) && ai.questions.length > 0
			? ai.questions.map((q) => {
					const choices = [...(q.choicesJa ?? ['', '', ''])];
					while (choices.length < 3) choices.push('');
					return {
						questionJa: q.questionJa ?? '',
						choices: choices.slice(0, 5),
						answerIndex: q.answerIndex ?? 0,
						explainJa: [...(q.explainPerChoice?.ja ?? ['', '', ''])],
						explainVi: [...(q.explainPerChoice?.vi ?? ['', '', ''])],
					};
				})
			: form.questions;

	const wordCount =
		paragraphsText.replace(/\s+/g, '').length || form.wordCount;

	return {
		...form,
		titleJa: ai.titleJa?.trim() || form.titleJa,
		snippetJa: ai.snippetJa?.trim() || form.snippetJa,
		paragraphsText,
		wordCount,
		vocabulary,
		questions: questions.length ? questions : [emptyQuestion()],
	};
}
