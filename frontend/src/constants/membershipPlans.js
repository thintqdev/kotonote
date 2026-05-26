/** Đồng bộ backend/constants/membership.js */

export const MEMBERSHIP_TIER_IDS = ['free', 'pro', 'ultra', 'ultimate'];

export const PAID_TIER_IDS = ['pro', 'ultra', 'ultimate'];

export const MEMBERSHIP_TIER_RANK = {
	free: 0,
	pro: 1,
	ultra: 2,
	ultimate: 3,
};

export const JLPT_BY_TIER = {
	free: ['N5', 'N4'],
	pro: ['N5', 'N4', 'N3'],
	ultra: ['N5', 'N4', 'N3', 'N2'],
	ultimate: ['N5', 'N4', 'N3', 'N2', 'N1'],
};

export const MEMBERSHIP_PRICING = {
	free: { yearly: 0, lifetime: 0 },
	pro: { yearly: 199_000, lifetime: 599_000 },
	ultra: { yearly: 299_000, lifetime: 999_000 },
	ultimate: { yearly: 399_000, lifetime: 1_299_000 },
};

/**
 * @param {number} amountVnd
 * @param {string} [locale]
 */
export function formatVnd(amountVnd, locale = 'vi-VN') {
	const n = Number(amountVnd);
	if (!Number.isFinite(n)) return '—';
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'VND',
		maximumFractionDigits: 0,
	}).format(n);
}
