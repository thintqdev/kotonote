const emptyLoc = () => ({ ja: '', vi: '' });

/**
 * @param {unknown} raw
 */
export function normalizeLoc(raw) {
	if (!raw || typeof raw !== 'object') {
		return emptyLoc();
	}
	const o = /** @type {Record<string, unknown>} */ (raw);
	return {
		ja: String(o.ja ?? '').trim(),
		vi: String(o.vi ?? '').trim(),
	};
}

/**
 * @param {unknown} raw
 */
function normalizeCompareRows(raw) {
	if (!Array.isArray(raw)) return [];
	return raw
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
		.filter(Boolean);
}

/**
 * @param {unknown} raw
 */
function normalizeCompareSections(raw) {
	if (!Array.isArray(raw)) return [];
	return raw
		.map((sec) => {
			if (!sec || typeof sec !== 'object') return null;
			const s = /** @type {Record<string, unknown>} */ (sec);
			const rows = normalizeCompareRows(s.rows);
			if (!rows.length) return null;
			return {
				id: String(s.id ?? '').trim(),
				title: normalizeLoc(s.title),
				intro: normalizeLoc(s.intro),
				rows,
			};
		})
		.filter(Boolean);
}

/**
 * Chuẩn hóa compare (bảng phẳng hoặc sections I/II/III + quy tắc con).
 * @param {unknown} raw
 */
export function normalizeGrammarCompare(raw) {
	if (!raw || typeof raw !== 'object') {
		return {
			caption: emptyLoc(),
			colLabels: [],
			rows: [],
			sections: [],
		};
	}
	const o = /** @type {Record<string, unknown>} */ (raw);
	const colLabels = Array.isArray(o.colLabels)
		? o.colLabels.map((c) => normalizeLoc(c))
		: [];
	const sections = normalizeCompareSections(o.sections);
	const rows = sections.length ? [] : normalizeCompareRows(o.rows);

	return {
		caption: normalizeLoc(o.caption),
		colLabels,
		rows,
		sections,
	};
}

/** Có nội dung compare để hiển thị. */
export function hasGrammarCompareContent(compare) {
	if (!compare) return false;
	if (compare.sections?.length) return true;
	return Boolean(compare.rows?.length);
}
