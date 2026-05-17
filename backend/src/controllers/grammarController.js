import asyncHandler from 'express-async-handler';
import * as grammarService from '../services/grammarService.js';
import { apiSuccess, apiPaginated } from '../utils/response.js';
import { GRAMMAR } from '../constants/messages.js';

export const listPublishedGrammars = asyncHandler(async (req, res) => {
	const result = await grammarService.listPublishedGrammars(req.query);
	const { items, pagination, messageCode } = result;
	return apiPaginated(
		res,
		{ items, jlptLevels: await grammarService.getDistinctJlptLevels(true) },
		pagination,
		messageCode,
		200,
	);
});

export const getPublishedGrammarBySlug = asyncHandler(async (req, res) => {
	const grammar = await grammarService.getPublishedGrammarBySlug(req.params.slug);
	return apiSuccess(res, { grammar }, GRAMMAR.FETCHED, 200);
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
