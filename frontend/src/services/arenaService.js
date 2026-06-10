import { dedupePromise } from '../utils/dedupePromise.js';
import api from './api.js';

const BASE = '/arena';
const ARENA_STATUS_TTL_MS = 30_000;

/** @type {{ data: object | null, at: number }} */
let statusCache = { data: null, at: 0 };

export function invalidateArenaStatusCache() {
	statusCache = { data: null, at: 0 };
}

/**
 * @param {{ force?: boolean }} [opts]
 */
export async function getArenaStatus(opts = {}) {
	const { force = false } = opts;
	const now = Date.now();
	if (
		!force &&
		statusCache.data &&
		now - statusCache.at < ARENA_STATUS_TTL_MS
	) {
		return statusCache.data;
	}
	return dedupePromise('arena-status', async () => {
		const body = await api.get(`${BASE}/status`);
		const data = body.data ?? {};
		statusCache = { data, at: Date.now() };
		return data;
	});
}

export async function beginArenaChallenge() {
	invalidateArenaStatusCache();
	const body = await api.post(`${BASE}/begin`);
	return body.data ?? {};
}

export async function checkKanjiAnswer(payload) {
	const body = await api.post(`${BASE}/kanji/check`, payload);
	return body.data ?? {};
}

export async function submitArenaChallenge(games) {
	invalidateArenaStatusCache();
	const body = await api.post(`${BASE}/submit`, { games });
	return body.data ?? {};
}

export async function getArenaLeaderboard(dateKey) {
	const body = await api.get(`${BASE}/leaderboard`, {
		params: dateKey ? { dateKey } : undefined,
	});
	return body.data ?? {};
}
