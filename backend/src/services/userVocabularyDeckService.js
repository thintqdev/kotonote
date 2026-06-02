import VocabularyDeckProgress from '../models/VocabularyDeckProgress.js';
import * as vocabularyRepository from '../repositories/vocabularyRepository.js';
import * as vocabularyService from './vocabularyService.js';
import AppError from '../utils/AppError.js';
import { VOCABULARY } from '../constants/messages.js';
import { MEMBERSHIP } from '../constants/messages.js';
import { normalizeUserMembership } from '../utils/membershipNormalize.js';
import { assertJlptUnlocked } from '../utils/jlptAccess.js';
import { jlptFromDeck } from '../utils/jlptAccess.js';
import {
	maxUserVocabDecksForTier,
	USER_VOCAB_DECK_MIN_RANK,
} from '../constants/userVocabularyDeck.js';
import { MEMBERSHIP_TIER_RANK } from '../constants/membership.js';
import { isUserOwnedDeck, userDeckOwnerFilter } from '../utils/userVocabularyDeck.js';

/**
 * @param {import('mongoose').Document|object} user
 */
export function assertUserCanManageDecks(user) {
	const membership = normalizeUserMembership(user?.membership);
	if (membership.status !== 'active') {
		throw new AppError(MEMBERSHIP.PAID_FEATURE_REQUIRED, 403);
	}
	const rank = MEMBERSHIP_TIER_RANK[membership.tierId] ?? 0;
	if (rank < USER_VOCAB_DECK_MIN_RANK) {
		throw new AppError(MEMBERSHIP.PAID_FEATURE_REQUIRED, 403);
	}
	return membership;
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {import('mongoose').Types.ObjectId | string} deckId
 */
export async function getOwnedUserDeck(userId, deckId) {
	const deck = await vocabularyService.getDeckById(deckId);
	if (!isUserOwnedDeck(deck) || String(deck.ownerId) !== String(userId)) {
		throw new AppError(VOCABULARY.DECK_NOT_FOUND, 404);
	}
	return deck;
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {Record<string, unknown>} query
 */
export async function listMyDecks(user, query = {}) {
	const userId = user._id;
	const filters = {
		...userDeckOwnerFilter(userId),
		isActive: true,
	};
	if (query.level) filters.level = query.level;

	return vocabularyService.getAllDecks(filters, {
		page: query.page,
		limit: query.limit,
	});
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {object} body
 */
export async function createMyDeck(user, body) {
	const membership = assertUserCanManageDecks(user);
	const unlocked = membership.jlptUnlocked ?? [];
	assertJlptUnlocked(unlocked, body.level);

	const maxDecks = maxUserVocabDecksForTier(membership.tierId);
	const current = await vocabularyRepository.countDecks(
		userDeckOwnerFilter(user._id),
	);
	if (current >= maxDecks) {
		throw new AppError(VOCABULARY.USER_DECK_QUOTA_REACHED, 403);
	}

	const deck = await vocabularyRepository.createDeck({
		ownerId: user._id,
		title: body.title,
		titleJa: body.titleJa ?? '',
		description: body.description ?? '',
		descriptionJa: body.descriptionJa ?? '',
		level: body.level,
		category: body.category ?? 'other',
		thumbnail: body.thumbnail ?? null,
		displayOrder: Number(body.displayOrder) || current,
		isActive: true,
		totalWords: 0,
	});

	return deck;
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} deckId
 * @param {object} body
 */
export async function updateMyDeck(user, deckId, body) {
	await getOwnedUserDeck(user._id, deckId);

	if (body.level) {
		const membership = normalizeUserMembership(user.membership);
		assertJlptUnlocked(membership.jlptUnlocked ?? [], body.level);
	}

	const patch = { ...body };
	delete patch.ownerId;
	delete patch.totalWords;

	return vocabularyService.updateDeck(deckId, patch);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} deckId
 */
export async function deleteMyDeck(user, deckId) {
	await getOwnedUserDeck(user._id, deckId);
	await VocabularyDeckProgress.deleteMany({ deckId });
	return vocabularyService.deleteDeck(deckId);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} deckId
 */
export async function getMyDeckWithVocabulary(user, deckId) {
	await getOwnedUserDeck(user._id, deckId);
	return vocabularyService.getDeckWithVocabulary(deckId);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {object} vocabData
 */
export async function createMyVocab(user, vocabData) {
	await getOwnedUserDeck(user._id, vocabData.deckId);
	return vocabularyService.createVocab(vocabData);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} vocabId
 * @param {object} updateData
 */
export async function updateMyVocab(user, vocabId, updateData) {
	const vocab = await vocabularyService.getVocabById(vocabId);
	await getOwnedUserDeck(user._id, vocab.deckId);
	const patch = { ...updateData };
	delete patch.deckId;
	return vocabularyService.updateVocab(vocabId, patch);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} vocabId
 */
export async function deleteMyVocab(user, vocabId) {
	const vocab = await vocabularyService.getVocabById(vocabId);
	await getOwnedUserDeck(user._id, vocab.deckId);
	return vocabularyService.deleteVocab(vocabId);
}

/**
 * @param {import('mongoose').Document|object} user
 * @param {string} deckId
 * @param {object[]} vocabularyList
 */
export async function importMyVocabulary(user, deckId, vocabularyList) {
	await getOwnedUserDeck(user._id, deckId);
	return vocabularyService.bulkCreateVocabulary(deckId, vocabularyList);
}
