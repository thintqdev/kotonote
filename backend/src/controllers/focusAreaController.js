import asyncHandler from 'express-async-handler';
import * as focusAreaService from '../services/focusAreaService.js';
import { apiSuccess, apiError } from '../utils/response.js';
import { USER } from '../constants/messages.js';

/**
 * @route GET /api/users/me/focus-areas
 */
export const getMyFocusAreas = asyncHandler(async (req, res) => {
	const focus = await focusAreaService.getFocusAreas(req.user._id);
	if (!focus) {
		return apiError(res, USER.NOT_FOUND, 404);
	}
	return apiSuccess(res, { focus }, USER.FOCUS_AREAS_FETCHED, 200);
});

/**
 * @route PUT /api/users/me/focus-areas
 */
export const updateMyFocusAreas = asyncHandler(async (req, res) => {
	const focus = await focusAreaService.updateFocusAreas(
		req.user._id,
		req.body.focusAreaKeys,
	);
	if (!focus) {
		return apiError(res, USER.NOT_FOUND, 404);
	}
	return apiSuccess(res, { focus }, USER.FOCUS_AREAS_UPDATED, 200);
});
