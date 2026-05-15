import asyncHandler from 'express-async-handler';
import fs from 'fs/promises';
import * as badgeService from '../services/badgeService.js';
import { apiSuccess, apiError } from '../utils/response.js';
import { BADGE, COMMON } from '../constants/messages.js';

export const getAllBadges = asyncHandler(async (req, res) => {
	const { category, isActive } = req.query;

	const filters = {};
	if (category) filters.category = category;
	if (isActive !== undefined) filters.isActive = isActive === 'true';

	const badges = await badgeService.getAllBadges(filters);

	return apiSuccess(res, { badges, total: badges.length }, BADGE.LIST_FETCHED, 200);
});

export const getBadgeById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const badge = await badgeService.getBadgeById(id);
	return apiSuccess(res, { badge }, BADGE.FETCHED, 200);
});

export const createBadge = asyncHandler(async (req, res) => {
	const badge = await badgeService.createBadge(req.body);
	return apiSuccess(res, { badge }, BADGE.CREATED, 201);
});

export const updateBadge = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const badge = await badgeService.updateBadge(id, req.body);
	return apiSuccess(res, { badge }, BADGE.UPDATED, 200);
});

export const deleteBadge = asyncHandler(async (req, res) => {
	const { id } = req.params;
	await badgeService.deleteBadge(id);
	return apiSuccess(res, null, BADGE.DELETED, 200);
});

export const uploadBadgeIcon = asyncHandler(async (req, res) => {
	if (!req.file) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'icon', message: 'Image file is required' },
		]);
	}
	const publicPath = `/uploads/badges/${req.file.filename}`;
	try {
		const badge = await badgeService.setBadgeIconFromUploadedFile(
			req.params.id,
			publicPath
		);
		return apiSuccess(res, { badge }, BADGE.UPDATED, 200);
	} catch (err) {
		await fs.unlink(req.file.path).catch(() => {});
		throw err;
	}
});

export const deleteBadgeIcon = asyncHandler(async (req, res) => {
	const badge = await badgeService.clearBadgeIcon(req.params.id);
	return apiSuccess(res, { badge }, BADGE.UPDATED, 200);
});
