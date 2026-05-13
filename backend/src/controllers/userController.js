import asyncHandler from 'express-async-handler';
import * as userService from '../services/userService.js';
import { apiSuccess } from '../utils/response.js';
import { USER } from '../constants/messages.js';

// ============ USER PROFILE CONTROLLERS ============

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
	const user = await userService.getCurrentUser(req.user._id);
	
	return apiSuccess(res, { user }, USER.FETCHED, 200);
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateMe = asyncHandler(async (req, res) => {
	const { name, avatar } = req.body;
	
	const user = await userService.updateProfile(req.user._id, { name, avatar });
	
	return apiSuccess(res, { user }, USER.UPDATED, 200);
});

// ============ ADMIN USER MANAGEMENT CONTROLLERS ============

/**
 * @desc    Get all users (admin)
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
	const { status, role, authProvider, search, page, limit } = req.query;
	
	const result = await userService.getAllUsers({
		status,
		role,
		authProvider,
		search,
		page,
		limit,
	});
	
	return apiSuccess(res, result, USER.LIST_FETCHED, 200);
});

/**
 * @desc    Get user by ID (admin)
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
	const user = await userService.getUserById(req.params.id);
	
	return apiSuccess(res, { user }, USER.FETCHED, 200);
});

/**
 * @desc    Update user status (admin)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Admin
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
	const { status } = req.body;
	
	const user = await userService.updateUserStatus(req.params.id, status);
	
	return apiSuccess(res, { user }, USER.UPDATED, 200);
});

/**
 * @desc    Cập nhật trạng thái nhiều user (admin)
 * @route   PATCH /api/admin/users/bulk/status
 * @access  Admin
 */
export const bulkUpdateUsersStatus = asyncHandler(async (req, res) => {
	const { userIds, status } = req.body;
	const actorId = req.user?._id != null ? String(req.user._id) : undefined;

	const result = await userService.bulkUpdateUsersStatus(userIds, status, actorId);

	return apiSuccess(res, result, USER.UPDATED, 200);
});

/**
 * @desc    Get user statistics (admin)
 * @route   GET /api/admin/users/statistics
 * @access  Admin
 */
export const getUserStatistics = asyncHandler(async (req, res) => {
	const statistics = await userService.getUserStatistics();
	
	return apiSuccess(res, { statistics }, USER.FETCHED, 200);
});
