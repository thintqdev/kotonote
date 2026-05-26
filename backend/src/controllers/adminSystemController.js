import asyncHandler from 'express-async-handler';
import * as adminSystemService from '../services/adminSystemService.js';
import { apiSuccess } from '../utils/response.js';
import { SYSTEM } from '../constants/messages.js';

export const getSystemHealth = asyncHandler(async (_req, res) => {
	const health = await adminSystemService.getAdminSystemHealth();
	return apiSuccess(res, { health }, SYSTEM.HEALTH_FETCHED, 200);
});
