import asyncHandler from 'express-async-handler';
import * as kaiwaContextService from '../services/kaiwaContextService.js';
import * as kaiwaPracticeService from '../services/kaiwaPracticeService.js';
import * as kaiwaPracticeSessionService from '../services/kaiwaPracticeSessionService.js';
import { apiSuccess } from '../utils/response.js';
import { KAIWA } from '../constants/messages.js';
import {
	annotateWithJlptLock,
	assertJlptUnlocked,
	buildJlptAccessMeta,
	isJlptUnlocked,
} from '../utils/jlptAccess.js';

/** @param {Record<string, unknown>} doc */
function toPublicKaiwaItem(doc) {
	const raw = { ...doc };
	const idRaw = raw?._id ?? raw?.id;
	const id =
		idRaw != null && String(idRaw).trim() !== ''
			? String(idRaw).trim()
			: '';
	const { isPublished: _omit, ...rest } = raw;
	return { ...rest, ...(id ? { id } : {}) };
}

export const listPublished = asyncHandler(async (req, res) => {
	const unlocked = req.jlptUnlocked ?? [];
	const queryJlpt = req.query.jlpt;

	if (queryJlpt && !isJlptUnlocked(unlocked, queryJlpt)) {
		return apiSuccess(
			res,
			{
				items: [],
				pagination: { page: 1, limit: 20, total: 0, pages: 0 },
				jlptLevels: await kaiwaContextService.getDistinctJlptLevels(true),
				jlptAccess: buildJlptAccessMeta(unlocked),
				requestedJlptLocked: true,
			},
			KAIWA.LIST_FETCHED,
			200,
		);
	}

	const result = await kaiwaContextService.listPublishedContexts(req.query);
	const plain = result.items.map((doc) => toPublicKaiwaItem(doc));
	const annotated = annotateWithJlptLock(plain, unlocked, (it) => it.jlpt);

	return apiSuccess(
		res,
		{
			items: annotated,
			pagination: result.pagination,
			jlptLevels: result.jlptLevels,
			jlptAccess: buildJlptAccessMeta(unlocked),
		},
		KAIWA.LIST_FETCHED,
		200,
	);
});

export const getById = asyncHandler(async (req, res) => {
	const ctx = await kaiwaContextService.getPublishedContextById(req.params.id);
	assertJlptUnlocked(req.jlptUnlocked, ctx.jlpt);
	return apiSuccess(
		res,
		{
			item: toPublicKaiwaItem(ctx),
			jlptAccess: buildJlptAccessMeta(req.jlptUnlocked),
		},
		KAIWA.FETCHED,
		200,
	);
});

export const practiceTurn = asyncHandler(async (req, res) => {
	const ctx = await kaiwaContextService.getPublishedContextById(req.params.id);
	assertJlptUnlocked(req.jlptUnlocked, ctx.jlpt);

	const result = await kaiwaPracticeService.runKaiwaPracticeTurn({
		contextId: req.params.id,
		userMessage: req.body.userMessage,
		messages: req.body.messages,
		userRoleIndex: req.body.userRoleIndex,
		partnerRoleIndex: req.body.partnerRoleIndex,
	});

	const session = await kaiwaPracticeSessionService.appendPracticeTurn({
		userId: req.user._id,
		contextId: req.params.id,
		sessionId: req.body.sessionId,
		userMessage: req.body.userMessage,
		turn: result.turn,
		userRoleIndex: result.userRoleIndex,
		partnerRoleIndex: result.partnerRoleIndex,
	});

	return apiSuccess(
		res,
		{
			turn: result.turn,
			source: result.source,
			userRoleIndex: result.userRoleIndex,
			partnerRoleIndex: result.partnerRoleIndex,
			session: session
				? {
						id: session.id,
						turnCount: session.turnCount,
						messageCount: session.messageCount,
						isCompleted: session.isCompleted,
					}
				: null,
		},
		KAIWA.PRACTICE_TURN_OK,
		200,
	);
});

export const listPracticeSessions = asyncHandler(async (req, res) => {
	const result = await kaiwaPracticeSessionService.listUserSessions(
		req.user._id,
		req.query,
	);
	return apiSuccess(
		res,
		{
			items: result.items,
			pagination: result.pagination,
		},
		KAIWA.SESSION_LIST_FETCHED,
		200,
	);
});

export const getPracticeSession = asyncHandler(async (req, res) => {
	const result = await kaiwaPracticeSessionService.getUserSessionById(
		req.user._id,
		req.params.sessionId,
	);
	return apiSuccess(res, { session: result.session }, KAIWA.SESSION_FETCHED, 200);
});

export const listContextPracticeSessions = asyncHandler(async (req, res) => {
	const ctx = await kaiwaContextService.getPublishedContextById(req.params.id);
	assertJlptUnlocked(req.jlptUnlocked, ctx.jlpt);
	const result = await kaiwaPracticeSessionService.listUserSessions(req.user._id, {
		...req.query,
		contextId: req.params.id,
	});
	return apiSuccess(
		res,
		{
			items: result.items,
			pagination: result.pagination,
		},
		KAIWA.SESSION_LIST_FETCHED,
		200,
	);
});
