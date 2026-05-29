/**
 * @param {URLSearchParams | string} searchParams
 */
export function parseVocabListPage(searchParams) {
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
export function vocabListSearchParams({ page = 1, jlpt = '' } = {}) {
	const p = new URLSearchParams();
	if (page > 1) p.set('page', String(page));
	if (jlpt) p.set('jlpt', jlpt);
	return p;
}

/**
 * @param {{ page?: number, jlpt?: string }} opts
 */
export function vocabListPath(opts = {}) {
	const q = vocabListSearchParams(opts).toString();
	return q ? `/vocabulary?${q}` : '/vocabulary';
}

/**
 * Cửa sổ số trang hiển thị (tránh render quá nhiều nút).
 * @param {number} current
 * @param {number} totalPages
 * @param {number} [maxVisible]
 */
export function paginationPageNumbers(current, totalPages, maxVisible = 7) {
	if (totalPages <= maxVisible) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}
	const half = Math.floor(maxVisible / 2);
	let start = Math.max(1, current - half);
	let end = Math.min(totalPages, start + maxVisible - 1);
	if (end - start + 1 < maxVisible) {
		start = Math.max(1, end - maxVisible + 1);
	}
	return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
