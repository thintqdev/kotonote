import asyncHandler from 'express-async-handler';
import * as journalService from '../services/journalService.js';
import { apiSuccess, apiError } from '../utils/response.js';
import { JOURNAL, COMMON } from '../constants/messages.js';
import { listJournalSchema } from '../validators/journalValidator.js';

export const getQuota = asyncHandler(async (req, res) => {
	const quota = await journalService.getDailyQuota(req.user._id);
	return apiSuccess(res, { quota }, JOURNAL.QUOTA_FETCHED, 200);
});

export const listEntries = asyncHandler(async (req, res) => {
	const { error, value } = listJournalSchema.validate(req.query, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((detail) => ({
			field: detail.path.join('.'),
			message: detail.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}
	const data = await journalService.listEntries(req.user._id, value);
	return apiSuccess(res, data, JOURNAL.LIST_FETCHED, 200);
});

export const getEntry = asyncHandler(async (req, res) => {
	const entry = await journalService.getEntry(req.user._id, req.params.id);
	return apiSuccess(res, { entry }, JOURNAL.FETCHED, 200);
});

export const analyzeEntry = asyncHandler(async (req, res) => {
	const data = await journalService.analyzeAndSaveEntry(req.user._id, req.body);
	return apiSuccess(res, data, JOURNAL.ANALYZED, 201);
});

export const deleteEntry = asyncHandler(async (req, res) => {
	await journalService.deleteEntry(req.user._id, req.params.id);
	return apiSuccess(res, { deleted: true }, JOURNAL.DELETED, 200);
});
