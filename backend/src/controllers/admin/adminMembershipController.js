import asyncHandler from 'express-async-handler';
import { apiSuccess } from '../../utils/response.js';
import { MEMBERSHIP } from '../../constants/messages.js';
import * as adminMembershipService from '../../services/adminMembershipService.js';

export const getStatistics = asyncHandler(async (req, res) => {
	const data = await adminMembershipService.getAdminMembershipStatistics();
	return apiSuccess(res, data, MEMBERSHIP.ADMIN_STATS_FETCHED, 200);
});

export const listUsers = asyncHandler(async (req, res) => {
	const data = await adminMembershipService.listMembershipUsers(req.query);
	return apiSuccess(res, data, MEMBERSHIP.ADMIN_USERS_LISTED, 200);
});

export const listCheckouts = asyncHandler(async (req, res) => {
	const data = await adminMembershipService.listMembershipCheckouts(req.query);
	return apiSuccess(res, data, MEMBERSHIP.ADMIN_CHECKOUTS_LISTED, 200);
});

export const updateUserMembership = asyncHandler(async (req, res) => {
	const data = await adminMembershipService.updateUserMembershipByAdmin(
		req.params.userId,
		req.body,
	);
	return apiSuccess(res, data, MEMBERSHIP.ADMIN_MEMBERSHIP_UPDATED, 200);
});
