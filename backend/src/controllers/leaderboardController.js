import asyncHandler from 'express-async-handler';
import * as leaderboardService from '../services/leaderboardService.js';
import { apiSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * @route GET /api/leaderboard
 * @query jlpt — N5…N1 (bảng bài đã nở hoa)
 * @query limit — 1…10 (mặc định 10; dashboard dùng 3)
 */
export const getLeaderboards = asyncHandler(async (req, res) => {
	const { jlpt, limit } = req.query;
	const viewerUserId = req.user?._id ?? req.user?.id;
	const data = await leaderboardService.getLeaderboards(
		{ jlpt, limit },
		viewerUserId,
	);

	return apiSuccess(res, data, MESSAGES.MSG_SUCCESS, 200);
});
