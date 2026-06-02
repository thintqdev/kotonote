import mongoose from 'mongoose';

/**
 * Bộ do user tạo (không phải catalog admin).
 * @param {{ ownerId?: unknown } | null | undefined} deck
 */
export function isUserOwnedDeck(deck) {
	if (!deck?.ownerId) return false;
	return true;
}

/** Filter Mongo: chỉ deck hệ thống */
export function officialDeckFilter() {
	return {
		$or: [{ ownerId: null }, { ownerId: { $exists: false } }],
	};
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export function userDeckOwnerFilter(userId) {
	return { ownerId: new mongoose.Types.ObjectId(String(userId)) };
}
