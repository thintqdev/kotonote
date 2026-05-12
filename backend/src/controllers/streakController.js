import asyncHandler from 'express-async-handler';
import * as streakService from '../services/streakService.js';
import { apiSuccess } from '../utils/response.js';
import { STREAK } from '../constants/messages.js';

export const getMyStreak = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	
	const streak = await streakService.getUserStreak(userId);
	
	return apiSuccess(res, { streak }, STREAK.FETCHED, 200);
});

export const checkIn = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	
	const result = await streakService.checkIn(userId);
	
	return apiSuccess(res, result, result.messageCode, 200);
});

export const useFreeze = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	
	const result = await streakService.useFreeze(userId);
	
	return apiSuccess(res, result, result.messageCode, 200);
});

export const getWeeklyCheckIns = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	
	const weeklyData = await streakService.getWeeklyCheckIns(userId);
	
	return apiSuccess(res, { weeklyData }, STREAK.FETCHED, 200);
});

export const getTopStreaks = asyncHandler(async (req, res) => {
	const { limit = 10 } = req.query;
	
	const topStreaks = await streakService.getTopStreaks(parseInt(limit));
	
	return apiSuccess(res, { topStreaks, total: topStreaks.length }, STREAK.FETCHED, 200);
});

export const getStreakStats = asyncHandler(async (req, res) => {
	const stats = await streakService.getStreakStats();
	
	return apiSuccess(res, { stats }, STREAK.FETCHED, 200);
});
