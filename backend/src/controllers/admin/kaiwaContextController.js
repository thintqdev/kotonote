import asyncHandler from 'express-async-handler';
import * as kaiwaContextService from '../../services/kaiwaContextService.js';
import { KAIWA } from '../../constants/messages.js';
import { apiPaginated, apiSuccess } from '../../utils/response.js';

export const listAdminContexts = asyncHandler(async (req, res) => {
	const result = await kaiwaContextService.listAdminContexts(req.query);
	const { items, pagination, messageCode } = result;
	return apiPaginated(res, { items }, pagination, messageCode, 200);
});

export const getAdminContextById = asyncHandler(async (req, res) => {
	const context = await kaiwaContextService.getContextById(req.params.id);
	return apiSuccess(res, { context }, KAIWA.FETCHED, 200);
});

export const createContext = asyncHandler(async (req, res) => {
	const context = await kaiwaContextService.createContext(req.body);
	return apiSuccess(res, { context }, KAIWA.CREATED, 201);
});

export const updateContext = asyncHandler(async (req, res) => {
	const context = await kaiwaContextService.updateContext(
		req.params.id,
		req.body,
	);
	return apiSuccess(res, { context }, KAIWA.UPDATED, 200);
});

export const deleteContext = asyncHandler(async (req, res) => {
	await kaiwaContextService.deleteContext(req.params.id);
	return apiSuccess(res, null, KAIWA.DELETED, 200);
});
