import asyncHandler from 'express-async-handler';
import * as dashboardHomeService from '../services/dashboardHomeService.js';
import { apiSuccess } from '../utils/response.js';
import { USER } from '../constants/messages.js';

/**
 * @desc    Dữ liệu trang chủ (môn học, streak, tiến độ hôm nay)
 * @route   GET /api/users/me/dashboard-home
 * @access  Private
 */
export const getMyDashboardHome = asyncHandler(async (req, res) => {
	const home = await dashboardHomeService.getDashboardHome(req.user._id);
	return apiSuccess(res, { home }, USER.DASHBOARD_HOME_FETCHED, 200);
});
