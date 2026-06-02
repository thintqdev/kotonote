import { MEMBERSHIP_TIER_RANK } from './membership.js';

/** Tier tối thiểu để tạo bộ Kanji riêng */
export const USER_KANJI_DECK_MIN_TIER = 'pro';

export const USER_KANJI_DECK_MIN_RANK =
	MEMBERSHIP_TIER_RANK[USER_KANJI_DECK_MIN_TIER] ?? 1;

/** Số bộ tối đa theo gói (active) — cùng quota với từ vựng */
export const USER_KANJI_DECK_MAX_BY_TIER = {
	free: 0,
	pro: 10,
	ultra: 30,
	ultimate: 50,
};

/**
 * @param {string} tierId
 */
export function maxUserKanjiDecksForTier(tierId) {
	return USER_KANJI_DECK_MAX_BY_TIER[tierId] ?? 0;
}
