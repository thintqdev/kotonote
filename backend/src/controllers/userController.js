import asyncHandler from 'express-async-handler';
import * as userService from '../services/userService.js';
import { apiSuccess } from '../utils/response.js';
import { USER } from '../constants/messages.js';

export const getMe = asyncHandler(async (req, res) => {
	const user = await userService.getCurrentUser(req.user._id);
	
	return apiSuccess(res, { user }, USER.FETCHED, 200);
});

export const updateMe = asyncHandler(async (req, res) => {
	const { name, avatar } = req.body;
	
	const user = await userService.updateProfile(req.user._id, { name, avatar });
	
	return apiSuccess(res, { user }, USER.UPDATED, 200);
});
