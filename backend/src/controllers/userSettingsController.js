import asyncHandler from 'express-async-handler';
import * as userSettingsService from '../services/userSettingsService.js';
import { apiSuccess, apiError } from '../utils/response.js';
import { USER } from '../constants/messages.js';

/**
 * @route GET /api/users/me/settings
 */
export const getMySettings = asyncHandler(async (req, res) => {
	const settings = await userSettingsService.getUserSettings(req.user._id);
	if (!settings) {
		return apiError(res, USER.NOT_FOUND, 404);
	}
	return apiSuccess(res, { settings }, USER.SETTINGS_FETCHED, 200);
});

/**
 * @route PUT /api/users/me/settings
 */
export const updateMySettings = asyncHandler(async (req, res) => {
	const settings = await userSettingsService.updateUserSettings(
		req.user._id,
		req.body,
	);
	if (!settings) {
		return apiError(res, USER.NOT_FOUND, 404);
	}
	return apiSuccess(res, { settings }, USER.SETTINGS_UPDATED, 200);
});
