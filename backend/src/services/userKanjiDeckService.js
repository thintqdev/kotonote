import KanjiDeckProgress from '../models/KanjiDeckProgress.js';
import * as kanjiRepository from '../repositories/kanjiRepository.js';
import * as kanjiService from './kanjiService.js';
import AppError from '../utils/AppError.js';
import { KANJI, MEMBERSHIP, VOCABULARY } from '../constants/messages.js';
import { normalizeUserMembership } from '../utils/membershipNormalize.js';
import { assertJlptUnlocked } from '../utils/jlptAccess.js';
import { maxUserKanjiDecksForTier, USER_KANJI_DECK_MIN_RANK } from '../constants/userKanjiDeck.js';
import { MEMBERSHIP_TIER_RANK } from '../constants/membership.js';
import { isUserOwnedDeck, userDeckOwnerFilter } from '../utils/userVocabularyDeck.js';

/**
 * @param {import('mongoose').Document|object} user
 */
export function assertUserCanManageKanjiDecks(user) {
	const membership = normalizeUserMembership(user?.membership);
	if (membership.status !== 'active') {
		throw new AppError(MEMBERSHIP.PAID_FEATURE_REQUIRED, 403);
	}
	const rank = MEMBERSHIP_TIER_RANK[membership.tierId] ?? 0;
	if (rank < USER_KANJI_DECK_MIN_RANK) {
		throw new AppError(MEMBERSHIP.PAID_FEATURE_REQUIRED, 403);
	}
	return membership;
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {string} deckId
 */
export async function getOwnedUserKanjiDeck(userId, deckId) {
	const deck = await kanjiService.getDeckById(deckId);
	if (!isUserOwnedDeck(deck) || String(deck.ownerId) !== String(userId)) {
		throw new AppError(KANJI.NOT_FOUND, 404);
	}
	return deck;
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {Record<string, unknown>} query
 */
export async function listMyDecks(user, query = {}) {
	const filters = {
		...userDeckOwnerFilter(user._id),
		isActive: true,
	};
	if (query.jlpt) filters.jlpt = String(query.jlpt).trim().toUpperCase();

	return kanjiService.getAllDecks(filters, {
		page: query.page,
		limit: query.limit,
	});
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {object} body
 */
export async function createMyDeck(user, body) {
	const membership = assertUserCanManageKanjiDecks(user);
	const jlpt = String(body.jlpt || '').trim().toUpperCase();
	assertJlptUnlocked(membership.jlptUnlocked ?? [], jlpt);

	const maxDecks = maxUserKanjiDecksForTier(membership.tierId);
	const current = await kanjiRepository.countDecks(userDeckOwnerFilter(user._id));
	if (current >= maxDecks) {
		throw new AppError(VOCABULARY.USER_DECK_QUOTA_REACHED, 403);
	}

	return kanjiRepository.createDeck({
		ownerId: user._id,
		titleVi: body.titleVi,
		titleJa: body.titleJa,
		descriptionVi: body.descriptionVi ?? '',
		descriptionJa: body.descriptionJa ?? '',
		jlpt,
		displayOrder: Number(body.displayOrder) || current,
		isActive: true,
	});
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} deckId
 * @param {object} body
 */
export async function updateMyDeck(user, deckId, body) {
	await getOwnedUserKanjiDeck(user._id, deckId);

	if (body.jlpt) {
		const membership = normalizeUserMembership(user.membership);
		assertJlptUnlocked(membership.jlptUnlocked ?? [], body.jlpt);
		body.jlpt = String(body.jlpt).trim().toUpperCase();
	}

	const patch = { ...body };
	delete patch.ownerId;

	return kanjiService.updateDeck(deckId, patch);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} deckId
 */
export async function deleteMyDeck(user, deckId) {
	await getOwnedUserKanjiDeck(user._id, deckId);
	await KanjiDeckProgress.deleteMany({ deckId });
	return kanjiService.deleteDeck(deckId);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} deckId
 */
export async function getMyDeckWithKanji(user, deckId) {
	await getOwnedUserKanjiDeck(user._id, deckId);
	return kanjiService.getDeckWithKanji(deckId);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {object} kanjiData
 */
export async function createMyKanji(user, kanjiData) {
	await getOwnedUserKanjiDeck(user._id, kanjiData.deckId);
	return kanjiService.createKanji(kanjiData);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} kanjiId
 * @param {object} updateData
 */
export async function updateMyKanji(user, kanjiId, updateData) {
	const row = await kanjiService.getKanjiById(kanjiId);
	await getOwnedUserKanjiDeck(user._id, row.deckId);
	const patch = { ...updateData };
	delete patch.deckId;
	return kanjiService.updateKanji(kanjiId, patch);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} kanjiId
 */
export async function deleteMyKanji(user, kanjiId) {
	const row = await kanjiService.getKanjiById(kanjiId);
	await getOwnedUserKanjiDeck(user._id, row.deckId);
	return kanjiService.deleteKanji(kanjiId);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} deckId
 * @param {object[]} kanjiList
 */
export async function importMyKanji(user, deckId, kanjiList) {
	await getOwnedUserKanjiDeck(user._id, deckId);
	return kanjiService.bulkCreateKanji(deckId, kanjiList);
}
