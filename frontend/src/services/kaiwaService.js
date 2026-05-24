import api from './api.js';
import { KAIWA } from '../constants/apiEndpoints.js';

/**
 * @param {{ jlpt?: string, category?: string, page?: number, limit?: number }} [params]
 */
export async function listPublishedKaiwaContexts(params = {}) {
	const body = await api.get(KAIWA.BASE, { params });
	return {
		items: body.data?.items ?? [],
		pagination: body.data?.pagination ?? null,
		jlptLevels: body.data?.jlptLevels ?? [],
		requestedJlptLocked: body.data?.requestedJlptLocked ?? false,
	};
}

export async function getKaiwaContextById(id) {
	const body = await api.get(KAIWA.context(id));
	return body.data?.item ?? body.data ?? null;
}

/**
 * @param {string} contextId
 * @param {{
 *   userMessage?: string,
 *   messages?: Array<{ role: 'user'|'partner', textJa: string, textVi?: string }>,
 *   userRoleIndex?: number,
 *   partnerRoleIndex?: number,
 * }} payload
 */
/** @param {Array<{ role?: string, textJa?: string, textVi?: string }>} messages */
function toApiMessages(messages) {
	return (messages ?? []).map((m) => ({
		role: m.role === 'partner' ? 'partner' : 'user',
		textJa: String(m.textJa ?? '').trim(),
		...(m.textVi != null && String(m.textVi).trim()
			? { textVi: String(m.textVi).trim() }
			: {}),
	}));
}

export async function postKaiwaPracticeTurn(contextId, payload) {
	const body = await api.post(KAIWA.practiceTurn(contextId), payload);
	return body.data ?? {};
}

export async function postKaiwaPracticeTurnSafe(contextId, payload) {
	const body = {
		userMessage: String(payload.userMessage ?? '').trim(),
		messages: toApiMessages(payload.messages),
		userRoleIndex: Number(payload.userRoleIndex) || 0,
		partnerRoleIndex:
			payload.partnerRoleIndex != null
				? Number(payload.partnerRoleIndex)
				: 1,
	};
	if (payload.sessionId) {
		body.sessionId = String(payload.sessionId);
	}
	return postKaiwaPracticeTurn(contextId, body);
}

/**
 * @param {{ contextId?: string, page?: number, limit?: number }} [params]
 */
export async function listKaiwaPracticeSessions(params = {}) {
	const body = await api.get(KAIWA.SESSIONS, { params });
	return {
		items: body.data?.items ?? [],
		pagination: body.data?.pagination ?? null,
	};
}

/**
 * @param {string} contextId
 * @param {{ page?: number, limit?: number }} [params]
 */
export async function listKaiwaContextPracticeSessions(contextId, params = {}) {
	const body = await api.get(KAIWA.contextSessions(contextId), { params });
	return {
		items: body.data?.items ?? [],
		pagination: body.data?.pagination ?? null,
	};
}

export async function getKaiwaPracticeSession(sessionId) {
	const body = await api.get(KAIWA.session(sessionId));
	return body.data?.session ?? null;
}
