import asyncHandler from 'express-async-handler';
import * as pageViewService from '../services/pageViewService.js';
import { apiSuccess } from '../utils/response.js';
import { COMMON } from '../constants/messages.js';

export const recordPageView = asyncHandler(async (req, res) => {
	const path = String(req.body?.path || req.query?.path || '').trim();
	if (!path) {
		return apiSuccess(res, { recorded: false }, COMMON.SUCCESS, 200);
	}
	const result = await pageViewService.recordPageView(path);
	return apiSuccess(res, result, COMMON.SUCCESS, 200);
});
