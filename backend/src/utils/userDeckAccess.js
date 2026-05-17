import AppError from './AppError.js';
import { MESSAGES } from '../constants/messages.js';
import { isAdminRequest, parseQueryBool } from './queryBool.js';

/**
 * Bộ lọc danh sách deck: user app luôn chỉ `isActive: true`; admin có thể lọc tùy query.
 * @param {import('express').Request} req
 * @param {{ jlpt?: string, level?: string, category?: string, isActive?: unknown }} query
 */
export function buildDeckListFilters(req, query = {}) {
	const filters = {};
	if (query.jlpt) filters.jlpt = query.jlpt;
	if (query.level) filters.level = query.level;
	if (query.category) filters.category = query.category;

	if (isAdminRequest(req)) {
		const parsed = parseQueryBool(query.isActive);
		if (parsed !== undefined) {
			filters.isActive = parsed;
		}
	} else {
		filters.isActive = true;
	}

	return filters;
}

/**
 * Deck tắt không hiển thị cho user (admin vẫn xem được).
 * @param {import('express').Request} req
 * @param {{ isActive?: boolean } | null | undefined} deck
 * @param {{ messageCode?: string }} [opts]
 */
export function assertDeckVisibleToUser(req, deck, opts = {}) {
	if (!deck) return;
	if (isAdminRequest(req)) return;
	if (deck.isActive === false) {
		const code = opts.messageCode ?? MESSAGES.MSG_905;
		throw new AppError(code, 404);
	}
}
