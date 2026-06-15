const BLOCKED_SCHEME_RE = /^(javascript|vbscript|data)(?::|&)/i;

/**
 * URL an toàn cho thẻ `<a href>` / createLink trong editor.
 * @param {unknown} raw
 * @returns {string | null}
 */
export function normalizeSafeLinkUrl(raw) {
	const s = String(raw ?? '').trim();
	if (!s) return null;
	if (BLOCKED_SCHEME_RE.test(s)) return null;
	if (s.startsWith('//')) return null;

	if (s.startsWith('/')) {
		if (s.startsWith('//') || s.startsWith('/\\')) return null;
		return s;
	}

	try {
		const u = new URL(s);
		if (u.protocol !== 'http:' && u.protocol !== 'https:' && u.protocol !== 'mailto:') {
			return null;
		}
		return u.href;
	} catch {
		return null;
	}
}

/**
 * @param {unknown} raw
 * @returns {boolean}
 */
export function isSafeLinkUrl(raw) {
	return normalizeSafeLinkUrl(raw) != null;
}
