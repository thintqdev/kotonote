import * as siteViewRepository from '../repositories/siteViewRepository.js';

const SKIP_PREFIXES = [
	'/admin',
	'/login',
	'/register',
	'/forgot-password',
	'/reset-password',
	'/verify-email',
];

/**
 * @param {string} path
 */
export function shouldTrackPageView(path) {
	const p = String(path || '').trim() || '/';
	if (!p.startsWith('/')) return false;
	const lower = p.toLowerCase();
	return !SKIP_PREFIXES.some((prefix) => lower === prefix || lower.startsWith(`${prefix}/`));
}

/**
 * @param {string} path
 */
export async function recordPageView(path) {
	if (!shouldTrackPageView(path)) {
		return { recorded: false, viewsToday: await siteViewRepository.getViewsForDateKey() };
	}
	const viewsToday = await siteViewRepository.incrementDailyViews();
	return { recorded: true, viewsToday };
}
