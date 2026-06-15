import { MEMBERSHIP_TIER_RANK, PAID_TIER_IDS } from '../constants/membershipPlans.js';

const MIN_RANK = MEMBERSHIP_TIER_RANK.pro ?? 1;

/**
 * @param {object | null | undefined} membership
 */
export function canCreateUserVocabularyDecks(membership) {
	if (!membership) return false;
	if (membership.status === 'expired') return false;
	const tierId = PAID_TIER_IDS.includes(membership.tierId)
		? membership.tierId
		: 'free';
	const rank = MEMBERSHIP_TIER_RANK[tierId] ?? 0;
	return rank >= MIN_RANK;
}

/** Cùng điều kiện Pro+ với bộ từ vựng */
export const canCreateUserKanjiDecks = canCreateUserVocabularyDecks;
