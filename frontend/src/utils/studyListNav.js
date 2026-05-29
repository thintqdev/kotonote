export { paginationPageNumbers } from './vocabularyListNav.js';

/**
 * @param {URLSearchParams | string} searchParams
 */
export function parseStudyListPage(searchParams) {
	const p =
		searchParams instanceof URLSearchParams
			? searchParams
			: new URLSearchParams(searchParams);
	const raw = parseInt(p.get('page') || '1', 10);
	return Number.isFinite(raw) && raw >= 1 ? raw : 1;
}

/**
 * @param {{ page?: number, jlpt?: string, mode?: string }} opts
 */
export function studyListSearchParams({ page = 1, jlpt = '', mode = '' } = {}) {
	const p = new URLSearchParams();
	if (page > 1) p.set('page', String(page));
	if (jlpt) p.set('jlpt', jlpt);
	if (mode && mode !== 'all') p.set('mode', mode);
	return p;
}

/**
 * @param {string} basePath
 * @param {{ page?: number, jlpt?: string, mode?: string }} opts
 */
export function studyListPath(basePath, opts = {}) {
	const q = studyListSearchParams(opts).toString();
	return q ? `${basePath}?${q}` : basePath;
}
