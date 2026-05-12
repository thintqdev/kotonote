import asyncHandler from 'express-async-handler';
import * as kanaService from '../services/kanaService.js';
import { apiSuccess } from '../utils/response.js';
import { KANA } from '../constants/messages.js';

export const getAllKana = asyncHandler(async (req, res) => {
	const { script, type, isActive } = req.query;
	
	const filters = {};
	if (script) filters.script = script;
	if (type) filters.type = type;
	if (isActive !== undefined) filters.isActive = isActive === 'true';
	
	const kanaList = await kanaService.getAllKana(filters);
	
	return apiSuccess(res, { kanaList, total: kanaList.length }, KANA.LIST_FETCHED, 200);
});

export const getKanaByScript = asyncHandler(async (req, res) => {
	const { script } = req.params;
	const { type } = req.query;
	
	const kanaList = await kanaService.getKanaByScript(script, type);
	
	return apiSuccess(res, { kanaList, total: kanaList.length }, KANA.LIST_FETCHED, 200);
});

export const getKanaGrouped = asyncHandler(async (req, res) => {
	const { script } = req.params;
	const { type } = req.query;
	
	const grouped = await kanaService.getKanaGroupedByRow(script, type);
	
	return apiSuccess(res, { grouped }, KANA.LIST_FETCHED, 200);
});

export const getKanaById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	
	const kana = await kanaService.getKanaById(id);
	
	return apiSuccess(res, { kana }, KANA.FETCHED, 200);
});

export const createKana = asyncHandler(async (req, res) => {
	const kanaData = req.body;
	
	const kana = await kanaService.createKana(kanaData);
	
	return apiSuccess(res, { kana }, KANA.CREATED, 201);
});

export const updateKana = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const updateData = req.body;
	
	const kana = await kanaService.updateKana(id, updateData);
	
	return apiSuccess(res, { kana }, KANA.UPDATED, 200);
});

export const deleteKana = asyncHandler(async (req, res) => {
	const { id } = req.params;
	
	await kanaService.deleteKana(id);
	
	return apiSuccess(res, null, KANA.DELETED, 200);
});

export const bulkCreateKana = asyncHandler(async (req, res) => {
	const { kanaArray } = req.body;
	
	const result = await kanaService.bulkCreateKana(kanaArray);
	
	return apiSuccess(res, { created: result.length }, KANA.CREATED, 201);
});
