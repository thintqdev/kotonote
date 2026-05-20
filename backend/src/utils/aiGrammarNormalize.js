function normalizeLoc(raw) {
	if (!raw || typeof raw !== 'object') {
		return { ja: '', vi: '' };
	}
	const o = /** @type {Record<string, unknown>} */ (raw);
	return {
		ja: String(o.ja ?? '').trim(),
		vi: String(o.vi ?? '').trim(),
	};
}

function normalizeExamples(raw) {
	if (!Array.isArray(raw)) return [];
	return raw
		.map((ex) => {
			if (!ex || typeof ex !== 'object') return null;
			const e = /** @type {Record<string, unknown>} */ (ex);
			const ja = String(e.ja ?? '').trim();
			const vi = String(e.vi ?? '').trim();
			if (!ja && !vi) return null;
			return { ja, vi };
		})
		.filter(Boolean);
}

function normalizeCompare(raw) {
	if (!raw || typeof raw !== 'object') {
		return { caption: { ja: '', vi: '' }, colLabels: [], rows: [] };
	}
	const o = /** @type {Record<string, unknown>} */ (raw);
	const colLabels = Array.isArray(o.colLabels)
		? o.colLabels.map((c) => normalizeLoc(c))
		: [];
	const rows = Array.isArray(o.rows)
		? o.rows
				.map((row) => {
					if (!row || typeof row !== 'object') return null;
					const r = /** @type {Record<string, unknown>} */ (row);
					return {
						label: normalizeLoc(r.label),
						cells: Array.isArray(r.cells)
							? r.cells.map((c) => normalizeLoc(c))
							: [],
					};
				})
				.filter(Boolean)
		: [];
	return {
		caption: normalizeLoc(o.caption),
		colLabels,
		rows,
	};
}

/**
 * @param {unknown} raw
 * @returns {object | null}
 */
export function normalizeGrammarFromAI(raw) {
	if (!raw || typeof raw !== 'object') {
		return null;
	}
	const o = /** @type {Record<string, unknown>} */ (raw);
	const pattern = String(o.pattern ?? '').trim();
	if (!pattern) {
		return null;
	}

	const ngRaw = o.ng && typeof o.ng === 'object' ? o.ng : {};
	const ng = /** @type {Record<string, unknown>} */ (ngRaw);

	return {
		pattern,
		teaser: normalizeLoc(o.teaser),
		topicRibbon: normalizeLoc(o.topicRibbon),
		connection: normalizeLoc(o.connection),
		meaning: normalizeLoc(o.meaning),
		usage: normalizeLoc(o.usage),
		usageNote: normalizeLoc(o.usageNote),
		pointBubble: normalizeLoc(o.pointBubble),
		examples: normalizeExamples(o.examples),
		ng: {
			ja: Array.isArray(ng.ja)
				? ng.ja.map((s) => String(s).trim()).filter(Boolean)
				: [],
			vi: Array.isArray(ng.vi)
				? ng.vi.map((s) => String(s).trim()).filter(Boolean)
				: [],
		},
		ngNote: normalizeLoc(o.ngNote),
		compare: normalizeCompare(o.compare),
		memo: normalizeLoc(o.memo),
		practice: {
			items: normalizeExamples(
				o.practice &&
					typeof o.practice === 'object' &&
					Array.isArray(
						/** @type {Record<string, unknown>} */ (o.practice).items,
					)
					? /** @type {Record<string, unknown>} */ (o.practice).items
					: o.practiceItems,
			),
		},
	};
}
