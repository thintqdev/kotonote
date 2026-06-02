import api from './api.js';

const BASE = '/arena';

export async function getArenaStatus() {
	const body = await api.get(`${BASE}/status`);
	return body.data ?? {};
}

export async function beginArenaChallenge() {
	const body = await api.post(`${BASE}/begin`);
	return body.data ?? {};
}

export async function checkKanjiAnswer(payload) {
	const body = await api.post(`${BASE}/kanji/check`, payload);
	return body.data ?? {};
}

export async function submitArenaChallenge(games) {
	const body = await api.post(`${BASE}/submit`, { games });
	return body.data ?? {};
}

export async function getArenaLeaderboard(dateKey) {
	const body = await api.get(`${BASE}/leaderboard`, {
		params: dateKey ? { dateKey } : undefined,
	});
	return body.data ?? {};
}
