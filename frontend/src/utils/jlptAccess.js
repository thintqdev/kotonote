import { JLPT_BY_TIER } from '../constants/membershipPlans.js';

export const JLPT_ALL_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

/**
 * @param {unknown} raw
 */
export function normalizeJlptLevel(raw) {
	const s = String(raw ?? '').trim();
	if (!s) return '';
	const upper = s.toUpperCase();
	if (/^N[1-5]$/.test(upper)) return upper;
	if (/^[1-5]$/.test(s)) return `N${s}`;
	const lower = s.toLowerCase();
	if (['n5', 'n4', 'n3', 'n2', 'n1'].includes(lower)) {
		return lower.toUpperCase();
	}
	return '';
}

/**
 * @param {object | null | undefined} membership
 */
export function jlptUnlockedFromMembership(membership) {
	const list = membership?.jlptUnlocked;
	if (Array.isArray(list) && list.length > 0) {
		return list.map(normalizeJlptLevel).filter(Boolean);
	}
	const tierId = membership?.tierId ?? 'free';
	return JLPT_BY_TIER[tierId] ?? JLPT_BY_TIER.free;
}

/**
 * @param {string[]} unlocked
 * @param {unknown} jlpt
 */
export function isJlptUnlocked(unlocked, jlpt) {
	const level = normalizeJlptLevel(jlpt);
	if (!level) return true;
	return unlocked.includes(level);
}

/**
 * @param {object} deck
 */
export function jlptFromDeck(deck) {
	if (!deck) return '';
	return normalizeJlptLevel(deck.jlpt ?? deck.level);
}

/**
 * @param {unknown} err
 */
export function isJlptLockedError(err) {
	const code =
		err?.messageCode ||
		err?.response?.data?.messageCode ||
		err?.data?.messageCode;
	return code === 'MSG_1113';
}
