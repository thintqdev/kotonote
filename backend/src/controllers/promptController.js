import asyncHandler from 'express-async-handler';
import * as promptService from '../services/promptService.js';
import { apiSuccess } from '../utils/response.js';
import { PROMPT } from '../constants/messages.js';

export const getAllPrompts = asyncHandler(async (req, res) => {
	const { type, isActive, jlptLevel } = req.query;

	const filters = {};
	if (type) filters.type = type;
	if (jlptLevel) filters.jlptLevel = jlptLevel;
	if (isActive !== undefined) filters.isActive = isActive === 'true';

	const prompts = await promptService.getAllPrompts(filters);

	return apiSuccess(res, { prompts, total: prompts.length }, PROMPT.LIST_FETCHED, 200);
});

export const getPromptById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const prompt = await promptService.getPromptById(id);

	return apiSuccess(res, { prompt }, PROMPT.FETCHED, 200);
});

export const createPrompt = asyncHandler(async (req, res) => {
	const prompt = await promptService.createPrompt(req.body);

	return apiSuccess(res, { prompt }, PROMPT.CREATED, 201);
});

export const updatePrompt = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const prompt = await promptService.updatePrompt(id, req.body);

	return apiSuccess(res, { prompt }, PROMPT.UPDATED, 200);
});

export const deletePrompt = asyncHandler(async (req, res) => {
	const { id } = req.params;

	await promptService.deletePrompt(id);

	return apiSuccess(res, null, PROMPT.DELETED, 200);
});
