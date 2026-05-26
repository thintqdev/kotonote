import {
	MEMBERSHIP_BILLING,
	PAID_TIER_IDS,
	jlptUnlockedForTier,
} from '../constants/membership.js';

/**
 * @param {object | null | undefined} raw
 */
export function normalizeUserMembership(raw) {
	const m = raw && typeof raw === 'object' ? raw : {};
	const tierId = PAID_TIER_IDS.includes(m.tierId) ? m.tierId : 'free';
	const billing =
		m.billing === MEMBERSHIP_BILLING.YEARLY ||
		m.billing === MEMBERSHIP_BILLING.LIFETIME
			? m.billing
			: MEMBERSHIP_BILLING.FREE;

	let status = m.status === 'expired' ? 'expired' : 'active';
	if (
		status === 'active' &&
		billing === MEMBERSHIP_BILLING.YEARLY &&
		m.expiresAt &&
		new Date(m.expiresAt) < new Date()
	) {
		status = 'expired';
	}

	const effectiveTierId =
		status === 'expired' && tierId !== 'free' ? 'free' : tierId;
	const effectiveBilling =
		status === 'expired' && tierId !== 'free'
			? MEMBERSHIP_BILLING.FREE
			: billing;

	return {
		tierId: effectiveTierId,
		billing: effectiveBilling,
		status,
		jlptUnlocked: jlptUnlockedForTier(effectiveTierId),
		purchasedAt: m.purchasedAt ?? null,
		expiresAt: m.expiresAt ?? null,
	};
}
