import asyncHandler from 'express-async-handler';
import * as userVocabularyDeckService from '../services/userVocabularyDeckService.js';
import { apiSuccess } from '../utils/response.js';
import { VOCABULARY } from '../constants/messages.js';
import { buildJlptAccessMeta } from '../utils/jlptAccess.js';
import { maxUserVocabDecksForTier } from '../constants/userVocabularyDeck.js';
import { normalizeUserMembership } from '../utils/membershipNormalize.js';

export const listMyDecks = asyncHandler(async (req, res) => {
	const { level, page, limit } = req.query;
	const result = await userVocabularyDeckService.listMyDecks(req.user, {
		level,
		page,
		limit,
	});

	const membership = normalizeUserMembership(req.user.membership);
	const maxDecks = maxUserVocabDecksForTier(membership.tierId);

	return apiSuccess(
		res,
		{
			...result,
			quota: {
				maxDecks,
				used: result.pagination?.total ?? result.decks?.length ?? 0,
			},
			jlptAccess: buildJlptAccessMeta(req.jlptUnlocked),
		},
		VOCABULARY.USER_DECK_LIST_FETCHED,
		200,
	);
});

export const createMyDeck = asyncHandler(async (req, res) => {
	const deck = await userVocabularyDeckService.createMyDeck(req.user, req.body);
	return apiSuccess(res, { deck }, VOCABULARY.DECK_CREATED, 201);
});

export const getMyDeck = asyncHandler(async (req, res) => {
	const deck = await userVocabularyDeckService.getOwnedUserDeck(
		req.user._id,
		req.params.id,
	);
	return apiSuccess(
		res,
		{ deck, jlptAccess: buildJlptAccessMeta(req.jlptUnlocked) },
		VOCABULARY.DECK_FETCHED,
		200,
	);
});

export const getMyDeckWithVocabulary = asyncHandler(async (req, res) => {
	const result = await userVocabularyDeckService.getMyDeckWithVocabulary(
		req.user,
		req.params.id,
	);
	return apiSuccess(
		res,
		{ ...result, jlptAccess: buildJlptAccessMeta(req.jlptUnlocked) },
		VOCABULARY.DECK_FETCHED,
		200,
	);
});

export const updateMyDeck = asyncHandler(async (req, res) => {
	const deck = await userVocabularyDeckService.updateMyDeck(
		req.user,
		req.params.id,
		req.body,
	);
	return apiSuccess(res, { deck }, VOCABULARY.DECK_UPDATED, 200);
});

export const deleteMyDeck = asyncHandler(async (req, res) => {
	await userVocabularyDeckService.deleteMyDeck(req.user, req.params.id);
	return apiSuccess(res, null, VOCABULARY.DECK_DELETED, 200);
});

export const createMyVocab = asyncHandler(async (req, res) => {
	const vocab = await userVocabularyDeckService.createMyVocab(req.user, req.body);
	return apiSuccess(res, { vocab }, VOCABULARY.WORD_CREATED, 201);
});

export const updateMyVocab = asyncHandler(async (req, res) => {
	const vocab = await userVocabularyDeckService.updateMyVocab(
		req.user,
		req.params.vocabId,
		req.body,
	);
	return apiSuccess(res, { vocab }, VOCABULARY.WORD_UPDATED, 200);
});

export const deleteMyVocab = asyncHandler(async (req, res) => {
	await userVocabularyDeckService.deleteMyVocab(req.user, req.params.vocabId);
	return apiSuccess(res, null, VOCABULARY.WORD_DELETED, 200);
});

export const importMyVocabulary = asyncHandler(async (req, res) => {
	const { vocabularyList } = req.body;
	const result = await userVocabularyDeckService.importMyVocabulary(
		req.user,
		req.params.deckId,
		vocabularyList,
	);
	return apiSuccess(res, result, VOCABULARY.WORD_CREATED, 201);
});
