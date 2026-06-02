import asyncHandler from 'express-async-handler';
import * as userKanjiDeckService from '../services/userKanjiDeckService.js';
import { apiSuccess } from '../utils/response.js';
import { KANJI, VOCABULARY } from '../constants/messages.js';
import { buildJlptAccessMeta } from '../utils/jlptAccess.js';
import { maxUserKanjiDecksForTier } from '../constants/userKanjiDeck.js';
import { normalizeUserMembership } from '../utils/membershipNormalize.js';

export const listMyDecks = asyncHandler(async (req, res) => {
	const { jlpt, page, limit } = req.query;
	const result = await userKanjiDeckService.listMyDecks(req.user, {
		jlpt,
		page,
		limit,
	});

	const membership = normalizeUserMembership(req.user.membership);
	const maxDecks = maxUserKanjiDecksForTier(membership.tierId);

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
	const deck = await userKanjiDeckService.createMyDeck(req.user, req.body);
	return apiSuccess(res, { deck }, KANJI.DECK_CREATED, 201);
});

export const getMyDeck = asyncHandler(async (req, res) => {
	const deck = await userKanjiDeckService.getOwnedUserKanjiDeck(
		req.user._id,
		req.params.id,
	);
	return apiSuccess(
		res,
		{ deck, jlptAccess: buildJlptAccessMeta(req.jlptUnlocked) },
		KANJI.FETCHED,
		200,
	);
});

export const getMyDeckWithKanji = asyncHandler(async (req, res) => {
	const result = await userKanjiDeckService.getMyDeckWithKanji(
		req.user,
		req.params.id,
	);
	return apiSuccess(
		res,
		{ ...result, jlptAccess: buildJlptAccessMeta(req.jlptUnlocked) },
		KANJI.LIST_FETCHED,
		200,
	);
});

export const updateMyDeck = asyncHandler(async (req, res) => {
	const deck = await userKanjiDeckService.updateMyDeck(
		req.user,
		req.params.id,
		req.body,
	);
	return apiSuccess(res, { deck }, KANJI.DECK_UPDATED, 200);
});

export const deleteMyDeck = asyncHandler(async (req, res) => {
	await userKanjiDeckService.deleteMyDeck(req.user, req.params.id);
	return apiSuccess(res, null, KANJI.DECK_DELETED, 200);
});

export const createMyKanji = asyncHandler(async (req, res) => {
	const kanji = await userKanjiDeckService.createMyKanji(req.user, req.body);
	return apiSuccess(res, { kanji }, KANJI.CREATED, 201);
});

export const updateMyKanji = asyncHandler(async (req, res) => {
	const kanji = await userKanjiDeckService.updateMyKanji(
		req.user,
		req.params.kanjiId,
		req.body,
	);
	return apiSuccess(res, { kanji }, KANJI.UPDATED, 200);
});

export const deleteMyKanji = asyncHandler(async (req, res) => {
	await userKanjiDeckService.deleteMyKanji(req.user, req.params.kanjiId);
	return apiSuccess(res, null, KANJI.DELETED, 200);
});

export const importMyKanji = asyncHandler(async (req, res) => {
	const { kanjiList } = req.body;
	const result = await userKanjiDeckService.importMyKanji(
		req.user,
		req.params.deckId,
		kanjiList,
	);
	return apiSuccess(res, result, KANJI.CREATED, 201);
});
