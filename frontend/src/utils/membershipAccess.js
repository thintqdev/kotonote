import { PAID_TIER_IDS } from '../constants/membershipPlans.js';

/**
 * @param {object | null | undefined} membership
 */
export function isPaidMembership(membership) {
	if (!membership || typeof membership !== 'object') return false;
	if (membership.status === 'expired') return false;
	const tierId = membership.tierId ?? 'free';
	return PAID_TIER_IDS.includes(tierId);
}

/**
 * @param {unknown} err
 */
export function isPaidFeatureLockedError(err) {
	const code =
		err?.messageCode ||
		err?.response?.data?.messageCode ||
		err?.data?.messageCode;
	return code === 'MSG_1118';
}
