import asyncHandler from 'express-async-handler';
import * as adminArenaService from '../../services/adminArenaService.js';
import { apiSuccess } from '../../utils/response.js';

export const getArenaDashboard = asyncHandler(async (req, res) => {
	const data = await adminArenaService.getAdminArenaDashboard();
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const updateArenaSettings = asyncHandler(async (req, res) => {
	const data = await adminArenaService.updateAdminArenaSettings(req.body);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const updateArenaGame = asyncHandler(async (req, res) => {
	const data = await adminArenaService.updateAdminArenaGame(req.params.gameKey, req.body);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const listKanji = asyncHandler(async (req, res) => {
	const data = await adminArenaService.listAdminKanji(req.query.jlpt);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const importKanji = asyncHandler(async (req, res) => {
	const data = await adminArenaService.importAdminKanji(
		req.body.items,
		req.body.jlpt,
	);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const updateKanji = asyncHandler(async (req, res) => {
	const data = await adminArenaService.updateAdminKanji(req.params.id, req.body);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const deleteKanji = asyncHandler(async (req, res) => {
	const data = await adminArenaService.deleteAdminKanji(req.params.id);
	return apiSuccess(res, null, data.messageCode, 200);
});

export const listVocab = asyncHandler(async (req, res) => {
	const data = await adminArenaService.listAdminVocab(req.query.jlpt);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const importVocab = asyncHandler(async (req, res) => {
	const data = await adminArenaService.importAdminVocab(req.body.items, req.body.jlpt);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const createVocab = asyncHandler(async (req, res) => {
	const data = await adminArenaService.createAdminVocab(req.body);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 201);
});

export const updateVocab = asyncHandler(async (req, res) => {
	const data = await adminArenaService.updateAdminVocab(req.params.id, req.body);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const deleteVocab = asyncHandler(async (req, res) => {
	const data = await adminArenaService.deleteAdminVocab(req.params.id);
	return apiSuccess(res, null, data.messageCode, 200);
});

export const listParticles = asyncHandler(async (req, res) => {
	const data = await adminArenaService.listAdminParticles(req.query.jlpt);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const importParticles = asyncHandler(async (req, res) => {
	const data = await adminArenaService.importAdminParticles(
		req.body.items,
		req.body.jlpt,
	);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const createParticle = asyncHandler(async (req, res) => {
	const data = await adminArenaService.createAdminParticle(req.body);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 201);
});

export const updateParticle = asyncHandler(async (req, res) => {
	const data = await adminArenaService.updateAdminParticle(req.params.id, req.body);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const deleteParticle = asyncHandler(async (req, res) => {
	const data = await adminArenaService.deleteAdminParticle(req.params.id);
	return apiSuccess(res, null, data.messageCode, 200);
});
