import asyncHandler from 'express-async-handler';
import { apiSuccess } from '../../utils/response.js';
import { MEMBERSHIP } from '../../constants/messages.js';
import * as adminSettingsService from '../../services/adminSettingsService.js';

export const getStudioSettings = asyncHandler(async (req, res) => {
	const settings = await adminSettingsService.getStudioSettings();
	return apiSuccess(res, { settings }, MEMBERSHIP.STUDIO_SETTINGS_FETCHED, 200);
});
