import asyncHandler from 'express-async-handler';
import * as notebookService from '../services/notebookService.js';
import { apiSuccess, apiError } from '../utils/response.js';
import { NOTEBOOK, COMMON } from '../constants/messages.js';
import { listNotesSchema } from '../validators/notebookValidator.js';

export const listNotes = asyncHandler(async (req, res) => {
	const { error, value } = listNotesSchema.validate(req.query, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((detail) => ({
			field: detail.path.join('.'),
			message: detail.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}
	const data = await notebookService.listNotes(req.user._id, value);
	return apiSuccess(res, data, NOTEBOOK.LIST_FETCHED, 200);
});

export const getNote = asyncHandler(async (req, res) => {
	const note = await notebookService.getNote(req.user._id, req.params.id);
	return apiSuccess(res, { note }, NOTEBOOK.FETCHED, 200);
});

export const createNote = asyncHandler(async (req, res) => {
	const note = await notebookService.createNote(req.user._id, req.body);
	return apiSuccess(res, { note }, NOTEBOOK.CREATED, 201);
});

export const updateNote = asyncHandler(async (req, res) => {
	const note = await notebookService.updateNote(
		req.user._id,
		req.params.id,
		req.body,
	);
	return apiSuccess(res, { note }, NOTEBOOK.UPDATED, 200);
});

export const deleteNote = asyncHandler(async (req, res) => {
	await notebookService.deleteNote(req.user._id, req.params.id);
	return apiSuccess(res, { deleted: true }, NOTEBOOK.DELETED, 200);
});

export const uploadNoteImage = asyncHandler(async (req, res) => {
	if (!req.file) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'image', message: 'Image file is required' },
		]);
	}
	const publicPath = `/uploads/notebook/${req.user._id}/${req.file.filename}`;
	return apiSuccess(res, { url: publicPath }, NOTEBOOK.IMAGE_UPLOADED, 201);
});
