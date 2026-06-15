import { MEMBERSHIP_TIER_RANK } from './membership.js';

/** Tier tối thiểu để tạo bộ từ riêng */
export const USER_VOCAB_DECK_MIN_TIER = 'pro';

export const USER_VOCAB_DECK_MIN_RANK =
	MEMBERSHIP_TIER_RANK[USER_VOCAB_DECK_MIN_TIER] ?? 1;

/** Số bộ tối đa theo gói (active) */
export const USER_VOCAB_DECK_MAX_BY_TIER = {
	free: 0,
	pro: 10,
	ultra: 30,
	ultimate: 50,
};

/**
 * @param {string} tierId
 */
export function maxUserVocabDecksForTier(tierId) {
	return USER_VOCAB_DECK_MAX_BY_TIER[tierId] ?? 0;
}
