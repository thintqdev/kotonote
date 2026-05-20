/**
 * Gộp nội dung AI vào form editor ngữ pháp (giữ slug, jlpt, tags nếu đã có).
 * @param {ReturnType<import('./grammarForm.js').emptyGrammarForm>} form
 * @param {object} ai
 */
export function mergeGrammarAIIntoForm(form, ai) {
	if (!ai) return form;

	const examples =
		ai.examples?.length > 0
			? ai.examples.map((ex) => ({
					ja: ex.ja ?? '',
					vi: ex.vi ?? '',
				}))
			: form.examples;

	const practiceItems =
		ai.practice?.items?.length > 0
			? ai.practice.items.map((it) => ({
					ja: it.ja ?? '',
					vi: it.vi ?? '',
				}))
			: form.practiceItems;

	return {
		...form,
		pattern: ai.pattern?.trim() || form.pattern,
		teaser: ai.teaser ?? form.teaser,
		topicRibbon: ai.topicRibbon ?? form.topicRibbon,
		connection: ai.connection ?? form.connection,
		meaning: ai.meaning ?? form.meaning,
		usage: ai.usage ?? form.usage,
		usageNote: ai.usageNote ?? form.usageNote,
		pointBubble: ai.pointBubble ?? form.pointBubble,
		examples,
		ngJaText:
			Array.isArray(ai.ng?.ja) && ai.ng.ja.length > 0
				? ai.ng.ja.join('\n')
				: form.ngJaText,
		ngViText:
			Array.isArray(ai.ng?.vi) && ai.ng.vi.length > 0
				? ai.ng.vi.join('\n')
				: form.ngViText,
		ngNote: ai.ngNote ?? form.ngNote,
		compareJson: ai.compare
			? JSON.stringify(ai.compare, null, 2)
			: form.compareJson,
		memo: ai.memo ?? form.memo,
		practiceItems,
	};
}
