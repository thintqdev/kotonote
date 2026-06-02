import AppError from './AppError.js';
import { VOCABULARY } from '../constants/messages.js';
import { isAdminRequest, parseQueryBool } from './queryBool.js';
import { isUserOwnedDeck, officialDeckFilter } from './userVocabularyDeck.js';

/**
 * Bộ lọc danh sách deck catalog (user app).
 * @param {import('express').Request} req
 * @param {{ jlpt?: string, level?: string, category?: string, isActive?: unknown }} query
 */
export function buildDeckListFilters(req, query = {}) {
	const filters = { ...officialDeckFilter() };
	if (query.jlpt) filters.jlpt = query.jlpt;
	if (query.level) filters.level = query.level;
	if (query.category) filters.category = query.category;

	if (isAdminRequest(req)) {
		delete filters.$or;
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
 * User đọc được deck: catalog active hoặc bộ của chính mình.
 * @param {import('express').Request} req
 * @param {{ ownerId?: unknown, isActive?: boolean } | null | undefined} deck
 * @param {{ messageCode?: string }} [opts]
 */
export function assertDeckReadable(req, deck, opts = {}) {
	if (!deck) {
		throw new AppError(opts.messageCode ?? VOCABULARY.DECK_NOT_FOUND, 404);
	}
	if (isAdminRequest(req)) return;

	if (isUserOwnedDeck(deck)) {
		if (String(deck.ownerId) !== String(req.user?._id)) {
			throw new AppError(VOCABULARY.DECK_NOT_FOUND, 404);
		}
		return;
	}

	if (deck.isActive === false) {
		throw new AppError(opts.messageCode ?? VOCABULARY.DECK_NOT_FOUND, 404);
	}
}

/**
 * @deprecated Dùng assertDeckReadable — giữ tương thích gọi cũ.
 */
export function assertDeckVisibleToUser(req, deck, opts = {}) {
	assertDeckReadable(req, deck, opts);
}
