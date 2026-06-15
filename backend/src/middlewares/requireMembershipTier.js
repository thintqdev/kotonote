import asyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';
import { COMMON, MEMBERSHIP } from '../constants/messages.js';
import { MEMBERSHIP_TIER_RANK } from '../constants/membership.js';
import { normalizeUserMembership } from '../utils/membershipNormalize.js';

/**
 * @param {string} minTierId
 */
export function requireMinMembershipTier(minTierId) {
	const minRank = MEMBERSHIP_TIER_RANK[minTierId] ?? 0;

	return asyncHandler(async (req, res, next) => {
		if (!req.user) {
			throw new AppError(COMMON.UNAUTHORIZED, 401);
		}

		const membership = normalizeUserMembership(req.user.membership);
		if (membership.status !== 'active') {
			throw new AppError(MEMBERSHIP.PAID_FEATURE_REQUIRED, 403);
		}

		const rank = MEMBERSHIP_TIER_RANK[membership.tierId] ?? 0;
		if (rank < minRank) {
			throw new AppError(MEMBERSHIP.PAID_FEATURE_REQUIRED, 403);
		}

		req.membership = membership;
		next();
	});
}
