import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';
import { KAIWA } from '../constants/messages.js';
import * as kaiwaPracticeSessionRepository from '../repositories/kaiwaPracticeSessionRepository.js';
import { getPublishedContextById } from './kaiwaContextService.js';

/**
 * @param {Record<string, unknown>} doc
 */
function toPublicSession(doc, { includeMessages = false } = {}) {
	if (!doc) return null;
	const id = String(doc._id ?? doc.id ?? '');
	const base = {
		id,
		contextId: String(doc.contextId ?? ''),
		contextTitleVi: doc.contextTitleVi ?? '',
		contextTitleJa: doc.contextTitleJa ?? '',
		jlpt: doc.jlpt ?? 'N5',
		category: doc.category ?? 'daily',
		userRoleIndex: doc.userRoleIndex ?? 0,
		partnerRoleIndex: doc.partnerRoleIndex ?? 1,
		turnCount: doc.turnCount ?? 0,
		messageCount: Array.isArray(doc.messages) ? doc.messages.length : 0,
		isCompleted: Boolean(doc.isCompleted),
		lastActivityAt: doc.lastActivityAt,
		createdAt: doc.createdAt,
		updatedAt: doc.updatedAt,
	};
	if (includeMessages) {
		return { ...base, messages: doc.messages ?? [] };
	}
	return base;
}

export const createSessionForContext = async (userId, contextId, roleIndexes) => {
	const ctx = await getPublishedContextById(contextId);
	const session = await kaiwaPracticeSessionRepository.createSession({
		userId,
		contextId,
		contextTitleVi: ctx.titleVi,
		contextTitleJa: ctx.titleJa ?? '',
		jlpt: ctx.jlpt,
		category: ctx.category,
		userRoleIndex: roleIndexes.userRoleIndex,
		partnerRoleIndex: roleIndexes.partnerRoleIndex,
		messages: [],
		turnCount: 0,
		isCompleted: false,
		lastActivityAt: new Date(),
	});
	return toPublicSession(session);
};

/**
 * Ghi lượt hội thoại vào phiên.
 * @param {object} params
 */
export const appendPracticeTurn = async ({
	userId,
	contextId,
	sessionId,
	userMessage,
	turn,
	userRoleIndex,
	partnerRoleIndex,
}) => {
	const trimmedUser = String(userMessage ?? '').trim();
	const partnerJa = String(turn?.partnerMessageJa ?? '').trim();
	if (!partnerJa) return null;

	let session;
	if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
		session = await kaiwaPracticeSessionRepository.findSessionByIdForUser(
			sessionId,
			userId,
		);
	}
	if (!session) {
		session = await kaiwaPracticeSessionRepository.createSession({
			userId,
			contextId,
			...(await getPublishedContextById(contextId).then((ctx) => ({
				contextTitleVi: ctx.titleVi,
				contextTitleJa: ctx.titleJa ?? '',
				jlpt: ctx.jlpt,
				category: ctx.category,
			}))),
			userRoleIndex,
			partnerRoleIndex,
			messages: [],
			turnCount: 0,
			isCompleted: false,
			lastActivityAt: new Date(),
		});
	}

	const newMessages = [...(session.messages ?? [])];

	if (trimmedUser) {
		newMessages.push({
			role: 'user',
			textJa: trimmedUser,
			textVi: '',
			coach: {
				summaryVi: turn?.analysis?.summaryVi ?? '',
				grammarNoteVi: turn?.analysis?.grammarNoteVi ?? '',
				politenessVi: turn?.analysis?.politenessVi ?? '',
				naturalnessVi: turn?.analysis?.naturalnessVi ?? '',
				suggestion: turn?.suggestion
					? {
							replyJa: turn.suggestion.replyJa ?? '',
							replyReading: turn.suggestion.replyReading ?? '',
							replyVi: turn.suggestion.replyVi ?? '',
						}
					: undefined,
			},
		});
	}

	newMessages.push({
		role: 'partner',
		textJa: partnerJa,
		textVi: String(turn?.partnerMessageVi ?? '').trim(),
	});

	const turnCount = (session.turnCount ?? 0) + (trimmedUser ? 1 : 0);

	const updated = await kaiwaPracticeSessionRepository.updateSessionById(
		session._id,
		userId,
		{
			messages: newMessages,
			turnCount,
			isCompleted: Boolean(turn?.conversationEnded),
			lastActivityAt: new Date(),
			userRoleIndex,
			partnerRoleIndex,
		},
	);

	return toPublicSession(updated, { includeMessages: true });
};

export const listUserSessions = async (userId, query = {}) => {
	const { contextId, page, limit } = query;
	const result = await kaiwaPracticeSessionRepository.findSessionsForUser(
		userId,
		{ contextId, page, limit },
	);
	return {
		items: result.items.map((s) => toPublicSession(s)),
		pagination: result.pagination,
		messageCode: KAIWA.SESSION_LIST_FETCHED,
	};
};

export const getUserSessionById = async (userId, sessionId) => {
	if (!mongoose.Types.ObjectId.isValid(sessionId)) {
		throw new AppError(KAIWA.SESSION_NOT_FOUND, 404);
	}
	const session = await kaiwaPracticeSessionRepository.findSessionByIdForUser(
		sessionId,
		userId,
	);
	if (!session) {
		throw new AppError(KAIWA.SESSION_NOT_FOUND, 404);
	}
	return {
		session: toPublicSession(session, { includeMessages: true }),
		messageCode: KAIWA.SESSION_FETCHED,
	};
};
