/**
 * Làm sạch HTML ghi chú — loại script và handler inline.
 * @param {unknown} html
 * @param {number} [maxLen]
 */
export function sanitizeNoteHtml(html, maxLen = 500_000) {
	if (html == null) return '';
	let s = String(html);
	s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
	s = s.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
	s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
	if (s.length > maxLen) s = s.slice(0, maxLen);
	return s;
}

/** @param {string} html */
export function noteExcerptFromHtml(html) {
	const text = String(html || '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (!text) return '';
	return text.length > 140 ? `${text.slice(0, 137)}…` : text;
}
