import asyncHandler from 'express-async-handler';
import * as examPaperService from '../../services/examPaperService.js';
import { EXAM_PAPER, COMMON } from '../../constants/messages.js';
import { apiPaginated, apiSuccess, apiError } from '../../utils/response.js';
import {
	examTemplateQuerySchema,
	importExamSectionsSchema,
	listExamPaperSchema,
	updateExamSectionsSchema,
} from '../../validators/examPaperValidator.js';

export const listAdminExamPapers = asyncHandler(async (req, res) => {
	const { error, value } = listExamPaperSchema.validate(req.query, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((detail) => ({
			field: detail.path.join('.'),
			message: detail.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}
	const result = await examPaperService.listAdminExamPapers(value);
	const { items, pagination, years, messageCode } = result;
	return apiPaginated(res, { items, years }, pagination, messageCode, 200);
});

export const getExamSectionsTemplate = asyncHandler(async (req, res) => {
	const { error, value } = examTemplateQuerySchema.validate(req.query, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((detail) => ({
			field: detail.path.join('.'),
			message: detail.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}
	const template = await examPaperService.getExamSectionsTemplate(value.jlpt);
	return apiSuccess(res, { template }, EXAM_PAPER.TEMPLATE_FETCHED, 200);
});

export const getAdminExamPaperById = asyncHandler(async (req, res) => {
	const { paper, structureMeta } = await examPaperService.getExamPaperForEditor(
		req.params.id,
	);
	return apiSuccess(res, { paper, structureMeta }, EXAM_PAPER.FETCHED, 200);
});

export const createExamPaper = asyncHandler(async (req, res) => {
	const paper = await examPaperService.createExamPaper(req.body);
	return apiSuccess(res, { paper }, EXAM_PAPER.CREATED, 201);
});

export const updateExamPaper = asyncHandler(async (req, res) => {
	const paper = await examPaperService.updateExamPaper(req.params.id, req.body);
	return apiSuccess(res, { paper }, EXAM_PAPER.UPDATED, 200);
});

export const deleteExamPaper = asyncHandler(async (req, res) => {
	await examPaperService.deleteExamPaper(req.params.id);
	return apiSuccess(res, null, EXAM_PAPER.DELETED, 200);
});

export const initExamPaperSections = asyncHandler(async (req, res) => {
	const paper = await examPaperService.initExamPaperSections(req.params.id);
	return apiSuccess(res, { paper }, EXAM_PAPER.SECTIONS_INITIALIZED, 200);
});

export const updateExamPaperSections = asyncHandler(async (req, res) => {
	const paper = await examPaperService.updateExamPaperSections(
		req.params.id,
		req.body.sections,
	);
	return apiSuccess(res, { paper }, EXAM_PAPER.SECTIONS_UPDATED, 200);
});

export const importExamPaperSections = asyncHandler(async (req, res) => {
	try {
		const paper = await examPaperService.importExamPaperSections(
			req.params.id,
			req.body,
		);
		return apiSuccess(res, { paper }, EXAM_PAPER.SECTIONS_IMPORTED, 200);
	} catch (err) {
		if (err?.errors && Array.isArray(err.errors)) {
			return apiError(
				res,
				EXAM_PAPER.IMPORT_INVALID,
				err.statusCode ?? 400,
				err.errors.map((message) => ({ message })),
			);
		}
		throw err;
	}
});

export const uploadExamMedia = asyncHandler(async (req, res) => {
	if (!req.file?.publicPath) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'media', message: 'Cần chọn file media' },
		]);
	}
	const isAudio = (req.file.mimetype || '').startsWith('audio/');
	return apiSuccess(
		res,
		{
			url: req.file.publicPath,
			mediaType: isAudio ? 'audio' : 'image',
		},
		EXAM_PAPER.MEDIA_UPLOADED,
		201,
	);
});

/** Upload thumbnail trước khi tạo đề (chưa có id) */
export const uploadExamPaperThumbnailDraft = asyncHandler(async (req, res) => {
	if (!req.file?.publicPath) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'thumbnail', message: 'Cần chọn ảnh thumbnail' },
		]);
	}
	return apiSuccess(
		res,
		{ thumbnailUrl: req.file.publicPath },
		EXAM_PAPER.MEDIA_UPLOADED,
		200,
	);
});
