import asyncHandler from 'express-async-handler';
import * as sentenceTemplateService from '../services/sentenceTemplateService.js';
import { apiSuccess } from '../utils/response.js';
import { SENTENCE } from '../constants/messages.js';

// Specialties
export const adminListSpecialties = asyncHandler(async (req, res) => {
	const { isActive } = req.query;
	const filters = {};
	if (isActive === 'true') filters.isActive = true;
	if (isActive === 'false') filters.isActive = false;
	const specialties = await sentenceTemplateService.adminListSpecialties(filters);
	return apiSuccess(
		res,
		{ specialties, total: specialties.length },
		SENTENCE.SPECIALTY_LIST_FETCHED,
		200,
	);
});

export const adminGetSpecialty = asyncHandler(async (req, res) => {
	const specialty = await sentenceTemplateService.adminGetSpecialty(req.params.id);
	return apiSuccess(res, { specialty }, SENTENCE.SPECIALTY_FETCHED, 200);
});

export const adminCreateSpecialty = asyncHandler(async (req, res) => {
	const specialty = await sentenceTemplateService.adminCreateSpecialty(req.body);
	return apiSuccess(res, { specialty }, SENTENCE.SPECIALTY_CREATED, 201);
});

export const adminUpdateSpecialty = asyncHandler(async (req, res) => {
	const specialty = await sentenceTemplateService.adminUpdateSpecialty(
		req.params.id,
		req.body,
	);
	return apiSuccess(res, { specialty }, SENTENCE.SPECIALTY_UPDATED, 200);
});

export const adminDeleteSpecialty = asyncHandler(async (req, res) => {
	await sentenceTemplateService.adminDeleteSpecialty(req.params.id);
	return apiSuccess(res, null, SENTENCE.SPECIALTY_DELETED, 200);
});

// Templates
export const adminListTemplates = asyncHandler(async (req, res) => {
	const { specialtyId, isActive } = req.query;
	const filters = {};
	if (specialtyId) filters.specialtyId = specialtyId;
	if (isActive === 'true') filters.isActive = true;
	if (isActive === 'false') filters.isActive = false;
	const templates = await sentenceTemplateService.adminListTemplates(filters);
	return apiSuccess(
		res,
		{ templates, total: templates.length },
		SENTENCE.TEMPLATE_LIST_FETCHED,
		200,
	);
});

export const adminGetTemplate = asyncHandler(async (req, res) => {
	const template = await sentenceTemplateService.adminGetTemplate(req.params.id);
	return apiSuccess(res, { template }, SENTENCE.TEMPLATE_FETCHED, 200);
});

export const adminCreateTemplate = asyncHandler(async (req, res) => {
	const template = await sentenceTemplateService.adminCreateTemplate(req.body);
	return apiSuccess(res, { template }, SENTENCE.TEMPLATE_CREATED, 201);
});

export const adminUpdateTemplate = asyncHandler(async (req, res) => {
	const template = await sentenceTemplateService.adminUpdateTemplate(
		req.params.id,
		req.body,
	);
	return apiSuccess(res, { template }, SENTENCE.TEMPLATE_UPDATED, 200);
});

export const adminDeleteTemplate = asyncHandler(async (req, res) => {
	await sentenceTemplateService.adminDeleteTemplate(req.params.id);
	return apiSuccess(res, null, SENTENCE.TEMPLATE_DELETED, 200);
});

export const adminSeed = asyncHandler(async (req, res) => {
	const { seedSentenceTemplates } = await import('../seeds/sentenceTemplateSeed.js');
	const result = await seedSentenceTemplates();
	return apiSuccess(res, result, SENTENCE.SEEDED, 200);
});
