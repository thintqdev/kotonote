import asyncHandler from 'express-async-handler';
import listeningExerciseService from '../services/listeningExerciseService.js';
import { apiSuccess, apiError } from '../utils/response.js';
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
		return apiSuccess(
			res,
			{
				items: [],
				jlptLevels: await listeningExerciseService.getDistinctJlptLevels(true),
				jlptAccess: buildJlptAccessMeta(unlocked),
				requestedJlptLocked: true,
			},
			LISTENING.LIST_FETCHED,
			200,
		);
	}

	const filters = { isPublished: true };
	if (queryJlpt) {
		filters.jlpt = queryJlpt;
	}

	const items = await listeningExerciseService.getAllPublished(filters);
	const plain = items.map((doc) => toPublicListeningItem(doc));
	const annotated = annotateWithJlptLock(plain, unlocked, (it) => it.jlpt);

	return apiSuccess(
		res,
		{
			items: annotated,
			jlptLevels: await listeningExerciseService.getDistinctJlptLevels(true),
			jlptAccess: buildJlptAccessMeta(unlocked),
		},
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
	return apiSuccess(
		res,
		{
			item: toPublicListeningItem(item),
			jlptAccess: buildJlptAccessMeta(req.jlptUnlocked),
		},
		LISTENING.FETCHED,
		200,
	);
});
