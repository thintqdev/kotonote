/** Gói membership — catalog tĩnh (sau có thể chuyển DB) */

export const MEMBERSHIP_TIER_IDS = ['free', 'pro', 'ultra', 'ultimate'];

export const MEMBERSHIP_BILLING = {
	FREE: 'free',
	YEARLY: 'yearly',
	LIFETIME: 'lifetime',
};

export const MEMBERSHIP_TIER_RANK = {
	free: 0,
	pro: 1,
	ultra: 2,
	ultimate: 3,
};

/** JLPT mở khóa theo gói */
export const JLPT_BY_TIER = {
	free: ['N5', 'N4'],
	pro: ['N5', 'N4', 'N3'],
	ultra: ['N5', 'N4', 'N3', 'N2'],
	ultimate: ['N5', 'N4', 'N3', 'N2', 'N1'],
};

/** Giá VND — yearly / lifetime; free = 0 */
export const MEMBERSHIP_PRICING = {
	free: { yearly: 0, lifetime: 0 },
	pro: { yearly: 199_000, lifetime: 599_000 },
	ultra: { yearly: 299_000, lifetime: 999_000 },
	ultimate: { yearly: 399_000, lifetime: 1_299_000 },
};

export const PAID_TIER_IDS = ['pro', 'ultra', 'ultimate'];

export const CHECKOUT_TTL_MS = 30 * 60 * 1000;

/**
 * @param {string} tierId
 * @param {'yearly'|'lifetime'} billing
 */
export function getPlanPriceVnd(tierId, billing) {
	const tier = MEMBERSHIP_PRICING[tierId];
	if (!tier) return null;
	const amount = tier[billing];
	return typeof amount === 'number' ? amount : null;
}

/**
 * @param {string} tierId
 */
export function jlptUnlockedForTier(tierId) {
	return JLPT_BY_TIER[tierId] ?? JLPT_BY_TIER.free;
}

export function membershipPlansPayload() {
	return MEMBERSHIP_TIER_IDS.map((id) => ({
		id,
		jlptLevels: jlptUnlockedForTier(id),
		pricing: {
			yearly: MEMBERSHIP_PRICING[id].yearly,
			lifetime: MEMBERSHIP_PRICING[id].lifetime,
		},
		isFree: id === 'free',
		rank: MEMBERSHIP_TIER_RANK[id] ?? 0,
	}));
}

/**
 * @param {string} tierId
 * @param {'yearly'|'lifetime'} billing
 */
export function computeMembershipExpiry(billing, purchasedAt = new Date()) {
	if (billing === MEMBERSHIP_BILLING.LIFETIME) return null;
	if (billing === MEMBERSHIP_BILLING.YEARLY) {
		const d = new Date(purchasedAt);
		d.setFullYear(d.getFullYear() + 1);
		return d;
	}
	return null;
}
