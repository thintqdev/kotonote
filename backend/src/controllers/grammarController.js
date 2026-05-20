import asyncHandler from 'express-async-handler';
import * as grammarService from '../services/grammarService.js';
import { apiSuccess, apiPaginated } from '../utils/response.js';
import { GRAMMAR } from '../constants/messages.js';
import {
	annotateWithJlptLock,
	assertJlptUnlocked,
	buildJlptAccessMeta,
	isJlptUnlocked,
} from '../utils/jlptAccess.js';

export const listPublishedGrammars = asyncHandler(async (req, res) => {
	const unlocked = req.jlptUnlocked ?? [];
	const queryJlpt = req.query.jlpt;

	if (queryJlpt && !isJlptUnlocked(unlocked, queryJlpt)) {
		return apiPaginated(
			res,
			{
				items: [],
				jlptLevels: await grammarService.getDistinctJlptLevels(true),
				jlptAccess: buildJlptAccessMeta(unlocked),
				requestedJlptLocked: true,
			},
			{ page: 1, limit: 10, total: 0, pages: 0 },
			GRAMMAR.LIST_FETCHED,
			200,
		);
	}

	const result = await grammarService.listPublishedGrammars(req.query);
	const { items, pagination, messageCode } = result;
	const annotated = annotateWithJlptLock(items, unlocked, (it) => it.jlpt);

	return apiPaginated(
		res,
		{
			items: annotated,
			jlptLevels: await grammarService.getDistinctJlptLevels(true),
			jlptAccess: buildJlptAccessMeta(unlocked),
		},
		pagination,
		messageCode,
		200,
	);
});

export const getPublishedGrammarBySlug = asyncHandler(async (req, res) => {
	const grammar = await grammarService.getPublishedGrammarBySlug(req.params.slug);
	assertJlptUnlocked(req.jlptUnlocked, grammar.jlpt);
	return apiSuccess(
		res,
		{ grammar, jlptAccess: buildJlptAccessMeta(req.jlptUnlocked) },
		GRAMMAR.FETCHED,
		200,
	);
});

export const listAdminGrammars = asyncHandler(async (req, res) => {
	const result = await grammarService.listAdminGrammars(req.query);
	const { items, pagination, messageCode } = result;
	return apiPaginated(res, { items }, pagination, messageCode, 200);
});

export const getAdminGrammarById = asyncHandler(async (req, res) => {
	const grammar = await grammarService.getGrammarById(req.params.id);
	return apiSuccess(res, { grammar }, GRAMMAR.FETCHED, 200);
});

export const createGrammar = asyncHandler(async (req, res) => {
	const grammar = await grammarService.createGrammar(req.body);
	return apiSuccess(res, { grammar }, GRAMMAR.CREATED, 201);
});

export const updateGrammar = asyncHandler(async (req, res) => {
	const grammar = await grammarService.updateGrammar(req.params.id, req.body);
	return apiSuccess(res, { grammar }, GRAMMAR.UPDATED, 200);
});

export const deleteGrammar = asyncHandler(async (req, res) => {
	await grammarService.deleteGrammar(req.params.id);
	return apiSuccess(res, null, GRAMMAR.DELETED, 200);
});
