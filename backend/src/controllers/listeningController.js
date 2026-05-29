import asyncHandler from 'express-async-handler';
import listeningExerciseService from '../services/listeningExerciseService.js';
import * as listeningProgressService from '../services/listeningProgressService.js';
import { apiSuccess, apiPaginated, apiError } from '../utils/response.js';
import { LISTENING } from '../constants/messages.js';
import {
	annotateWithJlptLock,
	assertJlptUnlocked,
	buildJlptAccessMeta,
	isJlptUnlocked,
} from '../utils/jlptAccess.js';

/** @param {import('mongoose').Document|Record<string, unknown>} doc */
function toPublicListeningItem(doc) {
	const raw =
		doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
	const idRaw = raw?._id ?? raw?.id;
	const id =
		idRaw != null && String(idRaw).trim() !== ''
			? String(idRaw).trim()
			: '';
	return { ...raw, ...(id ? { id } : {}) };
}

export const getAllPublished = asyncHandler(async (req, res) => {
	const unlocked = req.jlptUnlocked ?? [];
	const queryJlpt = req.query.jlpt;

	if (queryJlpt && !isJlptUnlocked(unlocked, queryJlpt)) {
		return apiPaginated(
			res,
			{
				items: [],
				jlptLevels: await listeningExerciseService.getDistinctJlptLevels(true),
				jlptAccess: buildJlptAccessMeta(unlocked),
				requestedJlptLocked: true,
			},
			{ page: 1, limit: 10, total: 0, pages: 0 },
			LISTENING.LIST_FETCHED,
			200,
		);
	}

	const filters = { isPublished: true };
	if (queryJlpt) {
		filters.jlpt = queryJlpt;
	}

	const { page, limit } = req.query;
	const { items, pagination } =
		await listeningExerciseService.getAllPublishedPaginated(filters, {
			page,
			limit,
		});
	const plain = items.map((doc) => toPublicListeningItem(doc));
	const annotated = annotateWithJlptLock(plain, unlocked, (it) => it.jlpt);

	return apiPaginated(
		res,
		{
			items: annotated,
			jlptLevels: await listeningExerciseService.getDistinctJlptLevels(true),
			jlptAccess: buildJlptAccessMeta(unlocked),
		},
		pagination,
		LISTENING.LIST_FETCHED,
		200,
	);
});

export const getById = asyncHandler(async (req, res) => {
	const item = await listeningExerciseService.getById(req.params.id);
	if (!item || !item.isPublished) {
		return apiError(res, LISTENING.NOT_FOUND, 404);
	}
	assertJlptUnlocked(req.jlptUnlocked, item.jlpt);
	const exerciseId = item._id ?? item.id;
	const progressRow = await listeningProgressService.saveListeningProgress(
		req.user._id,
		exerciseId,
		{ status: 'in_progress' },
	);
	return apiSuccess(
		res,
		{
			item: {
				...toPublicListeningItem(item),
				progress: {
					status: progressRow.status,
					questionAnswers: progressRow.questionAnswers ?? [],
				},
			},
			jlptAccess: buildJlptAccessMeta(req.jlptUnlocked),
		},
		LISTENING.FETCHED,
		200,
	);
});

export const saveExerciseProgress = asyncHandler(async (req, res) => {
	const progress = await listeningProgressService.saveListeningProgress(
		req.user._id,
		req.params.id,
		req.body,
	);
	return apiSuccess(
		res,
		{ progress },
		LISTENING.PROGRESS_SAVED,
		200,
	);
});
