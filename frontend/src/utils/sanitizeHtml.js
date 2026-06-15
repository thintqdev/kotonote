import DOMPurify from 'dompurify';

const DEFAULT_CONFIG = {
	USE_PROFILES: { html: true },
	ALLOWED_URI_REGEXP:
		/^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

/**
 * Sanitize HTML trước khi render (dangerouslySetInnerHTML / contentEditable load).
 * @param {unknown} html
 * @param {import('dompurify').Config} [config]
 * @returns {string}
 */
export function sanitizeHtml(html, config = {}) {
	if (html == null) return '';
	const raw = String(html);
	if (!raw.trim()) return '';
	return DOMPurify.sanitize(raw, { ...DEFAULT_CONFIG, ...config });
}

/** Notebook editor — cho phép img/table, chặn script/event handlers. */
export function sanitizeNotebookHtml(html) {
	return sanitizeHtml(html, {
		ADD_TAGS: ['figure', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'],
		ADD_ATTR: ['class', 'src', 'alt', 'colspan', 'rowspan'],
	});
}
