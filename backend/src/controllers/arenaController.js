import asyncHandler from 'express-async-handler';
import * as arenaService from '../services/arenaService.js';
import { apiSuccess } from '../utils/response.js';

export const getArenaStatus = asyncHandler(async (req, res) => {
	const data = await arenaService.getArenaStatus(req.user._id);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const beginArenaChallenge = asyncHandler(async (req, res) => {
	const data = await arenaService.beginArenaChallenge(req.user._id);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const checkKanjiAnswer = asyncHandler(async (req, res) => {
	const data = await arenaService.checkKanjiAnswer(req.user._id, req.body);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const submitArenaChallenge = asyncHandler(async (req, res) => {
	const data = await arenaService.submitArenaChallenge(req.user._id, req.body);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});

export const getArenaLeaderboard = asyncHandler(async (req, res) => {
	const data = await arenaService.getArenaLeaderboard(req.user._id, req.query.dateKey);
	const { messageCode, ...payload } = data;
	return apiSuccess(res, payload, messageCode, 200);
});
