import asyncHandler from 'express-async-handler';
import * as sentenceTemplateService from '../services/sentenceTemplateService.js';
import { apiSuccess } from '../utils/response.js';
import { SENTENCE } from '../constants/messages.js';

export const listSpecialties = asyncHandler(async (req, res) => {
	const specialties = await sentenceTemplateService.listActiveSpecialties();
	return apiSuccess(
		res,
		{ specialties, total: specialties.length },
		SENTENCE.SPECIALTY_LIST_FETCHED,
		200,
	);
});

export const getStudyPack = asyncHandler(async (req, res) => {
	const { code } = req.params;
	const pack = await sentenceTemplateService.getSpecialtyStudyPack(
		code,
		req.user._id,
	);
	return apiSuccess(res, pack, SENTENCE.PACK_FETCHED, 200);
});

export const getTemplate = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const template = await sentenceTemplateService.getTemplateForStudy(
		id,
		req.user._id,
	);
	return apiSuccess(res, { template }, SENTENCE.TEMPLATE_FETCHED, 200);
});

export const updateProgress = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { action } = req.body;
	const progress = await sentenceTemplateService.recordProgress(
		req.user._id,
		id,
		action,
	);
	return apiSuccess(res, { progress }, SENTENCE.PROGRESS_UPDATED, 200);
});

export const getQuiz = asyncHandler(async (req, res) => {
	const { code } = req.params;
	const count = Math.min(Math.max(Number(req.query.count) || 5, 1), 20);
	const quiz = await sentenceTemplateService.buildQuizForSpecialty(
		code,
		req.user._id,
		{ count },
	);
	return apiSuccess(res, quiz, SENTENCE.QUIZ_FETCHED, 200);
});
