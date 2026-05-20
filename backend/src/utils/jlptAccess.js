import AppError from './AppError.js';
import { JLPT_ALL_LEVELS } from '../constants/jlpt.js';
import { normalizeUserMembership } from '../services/membershipService.js';
import { MEMBERSHIP } from '../constants/messages.js';

/**
 * Chuẩn hóa JLPT: `n3`, `N3`, `3` → `N3`
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
 * @param {import('mongoose').Document|object|null|undefined} user
 */
export function getJlptUnlockedForUser(user) {
	const membership = normalizeUserMembership(user?.membership);
	return Array.isArray(membership.jlptUnlocked)
		? membership.jlptUnlocked
		: ['N5', 'N4'];
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
 * @param {string[]} unlocked
 * @param {unknown} jlpt
 * @param {string} [messageCode]
 */
export function assertJlptUnlocked(
	unlocked,
	jlpt,
	messageCode = MEMBERSHIP.JLPT_LOCKED,
) {
	if (!isJlptUnlocked(unlocked, jlpt)) {
		throw new AppError(messageCode, 403, [
			{ field: 'jlpt', message: normalizeJlptLevel(jlpt) || String(jlpt) },
		]);
	}
}

/**
 * @param {object} deck
 */
export function jlptFromDeck(deck) {
	if (!deck) return '';
	return normalizeJlptLevel(deck.jlpt ?? deck.level);
}

/**
 * @param {unknown[]} items
 * @param {string[]} unlocked
 * @param {(item: unknown) => unknown} getJlpt
 */
export function annotateWithJlptLock(items, unlocked, getJlpt) {
	return items.map((item) => {
		const level = normalizeJlptLevel(getJlpt(item));
		const locked = level ? !isJlptUnlocked(unlocked, level) : false;
		if (item && typeof item === 'object') {
			return { ...item, locked };
		}
		return item;
	});
}

/**
 * @param {string[]} unlocked
 */
export function buildJlptAccessMeta(unlocked) {
	return {
		unlocked,
		all: JLPT_ALL_LEVELS,
	};
}
