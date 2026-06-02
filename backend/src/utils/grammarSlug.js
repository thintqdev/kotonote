/**
 * Chuẩn hóa slug bài ngữ pháp (a-z, 0-9, dấu gạch).
 * @param {unknown} raw
 * @param {string} [patternFallback]
 */
export function normalizeGrammarSlug(raw, patternFallback = '') {
	let slug = String(raw ?? '')
		.trim()
		.toLowerCase()
		.replace(/[\s_]+/g, '-')
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');

	if (slug) return slug;

	const hint = String(patternFallback ?? '')
		.trim()
		.toLowerCase()
		.replace(/[〜~～]/g, '')
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');

	return hint;
}
