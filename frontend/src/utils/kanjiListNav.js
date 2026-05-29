/**
 * @param {URLSearchParams | string} searchParams
 */
export function parseKanjiListPage(searchParams) {
	const p =
		searchParams instanceof URLSearchParams
			? searchParams
			: new URLSearchParams(searchParams);
	const raw = parseInt(p.get('page') || '1', 10);
	return Number.isFinite(raw) && raw >= 1 ? raw : 1;
}

/**
 * @param {{ page?: number, jlpt?: string }} opts
 */
export function kanjiListSearchParams({ page = 1, jlpt = '' } = {}) {
	const p = new URLSearchParams();
	if (page > 1) p.set('page', String(page));
	if (jlpt) p.set('jlpt', jlpt);
	return p;
}

/**
 * @param {{ page?: number, jlpt?: string }} opts
 */
export function kanjiListPath(opts = {}) {
	const q = kanjiListSearchParams(opts).toString();
	return q ? `/kanji?${q}` : '/kanji';
}

export { paginationPageNumbers } from './vocabularyListNav.js';
