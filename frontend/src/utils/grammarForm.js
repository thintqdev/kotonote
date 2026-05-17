const emptyLoc = () => ({ ja: '', vi: '' });

export const emptyGrammarForm = () => ({
	slug: '',
	jlpt: 'N3',
	pattern: '',
	tagIds: [],
	isPublished: true,
	displayOrder: 0,
	teaser: emptyLoc(),
	topicRibbon: emptyLoc(),
	connection: emptyLoc(),
	meaning: emptyLoc(),
	usage: emptyLoc(),
	usageNote: emptyLoc(),
	pointBubble: emptyLoc(),
	examples: [{ ja: '', vi: '' }],
	ngJaText: '',
	ngViText: '',
	ngNote: emptyLoc(),
	compareJson: '{\n  "caption": { "ja": "", "vi": "" },\n  "colLabels": [],\n  "rows": []\n}',
	memo: emptyLoc(),
	practiceItems: [{ ja: '', vi: '' }],
});

/**
 * @param {object} g
 */
export function grammarToForm(g) {
	if (!g) return emptyGrammarForm();
	return {
		slug: g.slug ?? '',
		jlpt: g.jlpt ?? 'N3',
		pattern: g.pattern ?? '',
		tagIds: Array.isArray(g.tagIds) ? [...g.tagIds] : [],
		isPublished: g.isPublished !== false,
		displayOrder: Number(g.displayOrder) || 0,
		teaser: { ja: g.teaser?.ja ?? '', vi: g.teaser?.vi ?? '' },
		topicRibbon: { ja: g.topicRibbon?.ja ?? '', vi: g.topicRibbon?.vi ?? '' },
		connection: { ja: g.connection?.ja ?? '', vi: g.connection?.vi ?? '' },
		meaning: { ja: g.meaning?.ja ?? '', vi: g.meaning?.vi ?? '' },
		usage: { ja: g.usage?.ja ?? '', vi: g.usage?.vi ?? '' },
		usageNote: { ja: g.usageNote?.ja ?? '', vi: g.usageNote?.vi ?? '' },
		pointBubble: { ja: g.pointBubble?.ja ?? '', vi: g.pointBubble?.vi ?? '' },
		examples:
			g.examples?.length > 0
				? g.examples.map((ex) => ({ ja: ex.ja ?? '', vi: ex.vi ?? '' }))
				: [{ ja: '', vi: '' }],
		ngJaText: (g.ng?.ja ?? []).join('\n'),
		ngViText: (g.ng?.vi ?? []).join('\n'),
		ngNote: { ja: g.ngNote?.ja ?? '', vi: g.ngNote?.vi ?? '' },
		compareJson: JSON.stringify(
			g.compare ?? { caption: emptyLoc(), colLabels: [], rows: [] },
			null,
			2,
		),
		memo: { ja: g.memo?.ja ?? '', vi: g.memo?.vi ?? '' },
		practiceItems:
			g.practice?.items?.length > 0
				? g.practice.items.map((it) => ({ ja: it.ja ?? '', vi: it.vi ?? '' }))
				: [{ ja: '', vi: '' }],
	};
}

const linesToArray = (text) =>
	String(text || '')
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean);

/**
 * @param {ReturnType<typeof emptyGrammarForm>} form
 */
export function formToGrammarPayload(form) {
	let compare = { caption: emptyLoc(), colLabels: [], rows: [] };
	try {
		const parsed = JSON.parse(form.compareJson || '{}');
		if (parsed && typeof parsed === 'object') compare = parsed;
	} catch {
		throw new Error('COMPARE_JSON_INVALID');
	}

	return {
		slug: form.slug.trim(),
		jlpt: form.jlpt,
		pattern: form.pattern.trim(),
		tagIds: form.tagIds,
		isPublished: form.isPublished,
		displayOrder: Number(form.displayOrder) || 0,
		teaser: form.teaser,
		topicRibbon: form.topicRibbon,
		connection: form.connection,
		meaning: form.meaning,
		usage: form.usage,
		usageNote: form.usageNote,
		pointBubble: form.pointBubble,
		examples: form.examples.filter((ex) => ex.ja?.trim() || ex.vi?.trim()),
		ng: {
			ja: linesToArray(form.ngJaText),
			vi: linesToArray(form.ngViText),
		},
		ngNote: form.ngNote,
		compare,
		memo: form.memo,
		practice: {
			items: form.practiceItems.filter((it) => it.ja?.trim() || it.vi?.trim()),
		},
	};
}
