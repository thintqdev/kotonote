import asyncHandler from 'express-async-handler';
import * as examStructureService from '../../services/examStructureService.js';
import { EXAM_STRUCTURE, COMMON } from '../../constants/messages.js';
import { apiSuccess, apiError } from '../../utils/response.js';
import {
	jlptParamSchema,
	listExamStructureSchema,
	metaQuerySchema,
	updateExamStructureSchema,
} from '../../validators/examStructureValidator.js';

export const listExamStructureTemplates = asyncHandler(async (req, res) => {
	const { error, value } = listExamStructureSchema.validate(req.query, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((d) => ({
			field: d.path.join('.'),
			message: d.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}
	const filters = {};
	if (value.jlpt) filters.jlpt = value.jlpt;
	if (value.isActive === 'true') filters.isActive = true;
	if (value.isActive === 'false') filters.isActive = false;
	const result = await examStructureService.listExamStructureTemplates(filters);
	return apiSuccess(res, { items: result.items }, result.messageCode, 200);
});

export const getExamStructureTemplate = asyncHandler(async (req, res) => {
	const template = await examStructureService.getExamStructureTemplateById(
		req.params.id,
	);
	return apiSuccess(res, { template }, EXAM_STRUCTURE.FETCHED, 200);
});

export const getDefaultExamStructureByJlpt = asyncHandler(async (req, res) => {
	const { error, value } = jlptParamSchema.validate(
		{ jlpt: req.params.jlpt },
		{ abortEarly: false },
	);
	if (error) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'jlpt', message: error.details[0]?.message },
		]);
	}
	const template = await examStructureService.getDefaultTemplateByJlpt(value.jlpt);
	return apiSuccess(res, { template }, EXAM_STRUCTURE.FETCHED, 200);
});

export const getExamStructureMeta = asyncHandler(async (req, res) => {
	const { error, value } = metaQuerySchema.validate(req.query, {
		abortEarly: false,
	});
	if (error) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'jlpt', message: error.details[0]?.message },
		]);
	}
	const meta = await examStructureService.getExamStructureMeta(value.jlpt);
	return apiSuccess(res, { meta }, EXAM_STRUCTURE.META_FETCHED, 200);
});

export const updateExamStructureTemplate = asyncHandler(async (req, res) => {
	const { error, value } = updateExamStructureSchema.validate(req.body, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((d) => ({
			field: d.path.join('.'),
			message: d.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}
	try {
		const template = await examStructureService.updateExamStructureTemplate(
			req.params.id,
			value,
		);
		return apiSuccess(res, { template }, EXAM_STRUCTURE.UPDATED, 200);
	} catch (err) {
		if (err?.errors) {
			return apiError(res, EXAM_STRUCTURE.INVALID, err.statusCode ?? 400, err.errors);
		}
		throw err;
	}
});

export const resetExamStructureTemplate = asyncHandler(async (req, res) => {
	const template = await examStructureService.resetExamStructureTemplate(
		req.params.id,
	);
	return apiSuccess(res, { template }, EXAM_STRUCTURE.RESET, 200);
});

export const seedExamStructures = asyncHandler(async (_req, res) => {
	await examStructureService.ensureDefaultTemplatesSeeded();
	const result = await examStructureService.listExamStructureTemplates();
	return apiSuccess(res, { items: result.items }, EXAM_STRUCTURE.SEEDED, 200);
});

export const getPartCatalog = asyncHandler(async (_req, res) => {
	const catalog = examStructureService.getPartCatalog();
	return apiSuccess(res, { catalog }, EXAM_STRUCTURE.CATALOG_FETCHED, 200);
});
