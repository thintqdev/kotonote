import asyncHandler from 'express-async-handler';
import * as learningSummaryService from '../services/learningSummaryService.js';
import { apiSuccess, apiError } from '../utils/response.js';
import { USER } from '../constants/messages.js';

/**
 * @desc    Tóm tắt học tập (streak, tuần, thi, huy hiệu, thư viện)
 * @route   GET /api/users/me/learning-summary
 * @access  Private
 */
export const getMyLearningSummary = asyncHandler(async (req, res) => {
	const summary = await learningSummaryService.getLearningSummary(req.user._id);

	if (!summary) {
		return apiError(res, USER.NOT_FOUND, 404);
	}

	return apiSuccess(res, { summary }, USER.LEARNING_SUMMARY_FETCHED, 200);
});
