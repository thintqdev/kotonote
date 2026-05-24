import AppError from './AppError.js';
import { MEMBERSHIP } from '../constants/messages.js';
import { PAID_TIER_IDS } from '../constants/membership.js';
import { normalizeUserMembership } from '../services/membershipService.js';

/**
 * @param {object | null | undefined} user
 */
export function getMembershipForUser(user) {
	return normalizeUserMembership(user?.membership);
}

/**
 * @param {object | null | undefined} membership
 */
export function isPaidMembership(membership) {
	const m = normalizeUserMembership(membership);
	return PAID_TIER_IDS.includes(m.tierId) && m.status === 'active';
}

/**
 * @param {object | null | undefined} user
 */
export function assertPaidMembership(user) {
	if (!isPaidMembership(user?.membership)) {
		throw new AppError(MEMBERSHIP.PAID_FEATURE_REQUIRED, 403);
	}
}
