import api from './api.js';

const PAGE_VIEWS = '/analytics/page-views';

/**
 * @param {string} path
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function recordPageView(path, options = {}) {
	await api.post(
		PAGE_VIEWS,
		{ path },
		{ signal: options.signal, timeout: 8000 },
	);
}
