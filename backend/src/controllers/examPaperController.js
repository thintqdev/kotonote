import asyncHandler from 'express-async-handler';
import * as publicExamPaperService from '../services/publicExamPaperService.js';
import { EXAM_PAPER } from '../constants/messages.js';
import { apiSuccess, apiPaginated, apiError } from '../utils/response.js';
import { COMMON } from '../constants/messages.js';
import {
	annotateWithJlptLock,
	assertJlptUnlocked,
	buildJlptAccessMeta,
	isJlptUnlocked,
} from '../utils/jlptAccess.js';
import {
	isPaidMembership,
	assertPaidMembership,
} from '../utils/membershipAccess.js';
import {
	listExamPaperSchema,
	submitExamPaperSchema,
	listExamAttemptsSchema,
} from '../validators/examPaperValidator.js';

export const listPublishedExamPapers = asyncHandler(async (req, res) => {
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

	const unlocked = req.jlptUnlocked ?? [];
	if (value.jlpt && !isJlptUnlocked(unlocked, value.jlpt)) {
		const jlptLevels = await publicExamPaperService.listPublishedExamPapers(
			{},
			unlocked,
		);
		return apiPaginated(
			res,
			{
				items: [],
				jlptLevels: jlptLevels.jlptLevels,
				jlptAccess: buildJlptAccessMeta(unlocked),
				requestedJlptLocked: true,
			},
			{ page: 1, limit: 10, total: 0, pages: 0 },
			EXAM_PAPER.LIST_FETCHED,
			200,
		);
	}

	const result = await publicExamPaperService.listPublishedExamPapers(
		value,
		unlocked,
	);
	return apiPaginated(
		res,
		{
			items: result.items,
			jlptLevels: result.jlptLevels,
			jlptAccess: buildJlptAccessMeta(unlocked),
		},
		result.pagination,
		result.messageCode,
		200,
	);
});

export const getPublishedExamPaperBySlug = asyncHandler(async (req, res) => {
	const { paper, messageCode } =
		await publicExamPaperService.getPublishedExamPaperBySlug(req.params.slug);
	assertJlptUnlocked(req.jlptUnlocked, paper.jlpt);
	return apiSuccess(
		res,
		{ paper, jlptAccess: buildJlptAccessMeta(req.jlptUnlocked) },
		messageCode,
		200,
	);
});

export const submitPublishedExamPaper = asyncHandler(async (req, res) => {
	const { error, value } = submitExamPaperSchema.validate(req.body, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((detail) => ({
			field: detail.path.join('.'),
			message: detail.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}

	const full = await publicExamPaperService.getPublishedExamPaperBySlug(
		req.params.slug,
	);
	assertJlptUnlocked(req.jlptUnlocked, full.paper.jlpt);

	const { result, attemptId, messageCode } =
		await publicExamPaperService.submitPublishedExamPaper(
			req.params.slug,
			value.answers,
			req.user,
		);

	const payload = isPaidMembership(req.user?.membership)
		? result
		: publicExamPaperService.sanitizeSubmitResultForUser(result, req.user);

	return apiSuccess(res, { result: payload, attemptId }, messageCode, 200);
});

export const reviewPublishedExamPaper = asyncHandler(async (req, res) => {
	const { error, value } = submitExamPaperSchema.validate(req.body, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((detail) => ({
			field: detail.path.join('.'),
			message: detail.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}

	assertPaidMembership(req.user);

	const full = await publicExamPaperService.getPublishedExamPaperBySlug(
		req.params.slug,
	);
	assertJlptUnlocked(req.jlptUnlocked, full.paper.jlpt);

	const { result, paper, messageCode } =
		await publicExamPaperService.reviewPublishedExamPaper(
			req.params.slug,
			value.answers,
		);

	return apiSuccess(res, { result, paper }, messageCode, 200);
});

export const listExamPaperAttempts = asyncHandler(async (req, res) => {
	const { error, value } = listExamAttemptsSchema.validate(req.query, {
		abortEarly: false,
	});
	if (error) {
		const errors = error.details.map((detail) => ({
			field: detail.path.join('.'),
			message: detail.message,
		}));
		return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
	}

	const { items, pagination, messageCode } =
		await publicExamPaperService.listUserExamPaperAttempts(req.user._id, value);

	return apiPaginated(res, { items }, pagination, messageCode, 200);
});

export const getExamPaperAttempt = asyncHandler(async (req, res) => {
	const { attempt, result, paper, messageCode } =
		await publicExamPaperService.getUserExamPaperAttemptById(
			req.params.attemptId,
			req.user,
		);
	return apiSuccess(res, { attempt, result, paper }, messageCode, 200);
});

export const reviewExamPaperAttempt = asyncHandler(async (req, res) => {
	assertPaidMembership(req.user);

	const data = await publicExamPaperService.reviewUserExamPaperAttempt(
		req.params.attemptId,
		req.user,
	);
	return apiSuccess(
		res,
		{ attempt: data.attempt, result: data.result, paper: data.paper },
		data.messageCode,
		200,
	);
});
