import asyncHandler from 'express-async-handler';
import * as feedbackService from '../services/feedbackService.js';
import { apiSuccess, apiError } from '../utils/response.js';
import { FEEDBACK, COMMON } from '../constants/messages.js';
import {
	adminListFeedbackQuerySchema,
} from '../validators/feedbackValidator.js';

export const uploadFeedbackMedia = asyncHandler(async (req, res) => {
	if (!req.file) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'file', message: 'File is required' },
		]);
	}
	const kind = req.file.mimetype?.startsWith('video/') ? 'video' : 'image';
	return apiSuccess(
		res,
		{ url: req.file.publicPath, kind },
		FEEDBACK.MEDIA_UPLOADED,
		201
	);
});

export const submitFeedback = asyncHandler(async (req, res) => {
	const feedback = await feedbackService.submitFeedback(req.user._id, req.body);
	return apiSuccess(res, { feedback }, FEEDBACK.CREATED, 201);
});

export const getMyFeedbacks = asyncHandler(async (req, res) => {
	const { page, limit } = req.query;
	const result = await feedbackService.getMyFeedbacks(req.user._id, {
		page,
		limit,
	});
	return apiSuccess(res, result, FEEDBACK.MY_LIST_FETCHED, 200);
});

export const listFeedbacksAdmin = asyncHandler(async (req, res) => {
	const { error, value } = adminListFeedbackQuerySchema.validate(req.query, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((detail) => ({
			field: detail.path.join('.'),
			message: detail.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}
	const result = await feedbackService.listFeedbacksAdmin(value);
	return apiSuccess(res, result, FEEDBACK.LIST_FETCHED, 200);
});

export const updateFeedbackStatusAdmin = asyncHandler(async (req, res) => {
	const feedback = await feedbackService.updateFeedbackStatusAdmin(
		req.params.id,
		req.body
	);
	return apiSuccess(res, { feedback }, FEEDBACK.UPDATED, 200);
});
