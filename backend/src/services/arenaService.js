import * as arenaRepository from '../repositories/arenaRepository.js';
import { ARENA } from '../constants/messages.js';
import {
	ARENA_ATTEMPT_STATUS,
	ARENA_GAME_KEYS,
	ARENA_LEADERBOARD_LIMIT,
} from '../constants/arena.js';
import {
	getArenaWindowState,
	getNextArenaSession,
	isArenaReminderWindow,
	minutesUntilArenaOpen,
} from '../utils/arenaTime.js';
import { buildArenaSessionPayload } from './arenaSessionBuilder.js';
import { gradeArenaSession } from './arenaGrading.js';
import { normalizeAnswer, resolveActiveArenaGames } from '../utils/arenaPick.js';
import { resolveUserArenaJlpt } from '../utils/userJlpt.js';

function sessionPayloadNeedsRebuild(sessionPayload) {
	const kanji = sessionPayload?.games?.find(
		(g) => g.gameKey === ARENA_GAME_KEYS.KANJI_RAIN,
	);
	if (!kanji?.payload?.items?.length) return false;
	return kanji.payload.items.some((item) => !String(item.char || '').trim());
}

function stripPayloadForClient(sessionPayload) {
	if (!sessionPayload?.games) return { games: [] };
	return {
		games: sessionPayload.games.map((g) => ({
			gameKey: g.gameKey,
			order: g.order,
			titleVi: g.titleVi,
			titleJa: g.titleJa,
			descriptionVi: g.descriptionVi,
			descriptionJa: g.descriptionJa,
			payload: g.payload
				? {
						gameKey: g.payload.gameKey,
						config: g.payload.config,
						items: g.payload.items,
					}
				: null,
		})),
	};
}

export async function getArenaStatus(userId) {
	const settings = await arenaRepository.getOrCreateSettings();
	const userJlpt = await resolveUserArenaJlpt(userId);
	const window = getArenaWindowState(settings);
	const nextSession = getNextArenaSession(settings);
	const minutesUntilOpen = minutesUntilArenaOpen(settings, window);
	const isReminderSoon = isArenaReminderWindow(settings, window);
	const games = await arenaRepository.listGames();

	const attempt =
		window.dateKey && window.isScheduledDay
			? await arenaRepository.findAttemptByUserDate(userId, window.dateKey)
			: null;

	const leaderboard =
		window.dateKey && window.isScheduledDay
			? await arenaRepository.getLeaderboardForDate(
					window.dateKey,
					userJlpt,
					ARENA_LEADERBOARD_LIMIT,
				)
			: [];

	let myRank = null;
	if (attempt?.status === ARENA_ATTEMPT_STATUS.SUBMITTED) {
		const uid = String(userId);
		const idx = leaderboard.findIndex((e) => e.userId === uid);
		if (idx >= 0) myRank = leaderboard[idx];
	}

	return {
		settings: {
			enabled: settings.enabled,
			startTime: settings.startTime,
			endTime: settings.endTime,
			timezone: settings.timezone,
			weekdays: settings.weekdays,
			reminderMinutesBefore: settings.reminderMinutesBefore,
			jlpt: settings.jlpt,
			titleVi: settings.titleVi,
			titleJa: settings.titleJa,
		},
		games: games.map((g) => ({
			gameKey: g.gameKey,
			order: g.order,
			isActive: g.isActive,
			titleVi: g.titleVi,
			titleJa: g.titleJa,
		})),
		window,
		nextSession,
		minutesUntilOpen,
		isReminderSoon,
		myAttempt: attempt
			? {
					status: attempt.status,
					score: attempt.score,
					correctCount: attempt.correctCount,
					totalCount: attempt.totalCount,
					durationMs: attempt.durationMs,
					submittedAt: attempt.submittedAt,
					gameResults: attempt.gameResults || [],
				}
			: null,
		myRank,
		leaderboard: leaderboard.slice(0, 10),
		messageCode: ARENA.STATUS_FETCHED,
	};
}

export async function beginArenaChallenge(userId) {
	const settings = await arenaRepository.getOrCreateSettings();
	const userJlpt = await resolveUserArenaJlpt(userId);
	const window = getArenaWindowState(settings);

	if (!window.enabled || !window.isScheduledDay || !window.isOpen) {
		throw { messageCode: ARENA.CLOSED, statusCode: 403 };
	}

	const games = await arenaRepository.listGames();
	const activeGames = resolveActiveArenaGames(games);
	if (!activeGames.length) {
		throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 503 };
	}

	const existing = await arenaRepository.findAttemptByUserDate(
		userId,
		window.dateKey,
	);
	if (existing?.status === ARENA_ATTEMPT_STATUS.SUBMITTED) {
		throw { messageCode: ARENA.ALREADY_SUBMITTED, statusCode: 409 };
	}
	if (existing?.status === ARENA_ATTEMPT_STATUS.IN_PROGRESS) {
		let sessionPayload = existing.sessionPayload;
		const jlptForSession = existing.jlpt || userJlpt;
		if (sessionPayloadNeedsRebuild(sessionPayload)) {
			sessionPayload = await buildArenaSessionPayload(
				jlptForSession,
				window.dateKey,
				activeGames,
			);
			await arenaRepository.updateAttempt(existing._id, { sessionPayload });
		}
		return {
			dateKey: window.dateKey,
			attemptId: String(existing._id),
			startedAt: existing.startedAt,
			jlpt: jlptForSession,
			session: stripPayloadForClient(sessionPayload),
			messageCode: ARENA.CHALLENGE_STARTED,
		};
	}

	const sessionPayload = await buildArenaSessionPayload(
		userJlpt,
		window.dateKey,
		activeGames,
	);
	if (!sessionPayload.games.some((g) => g.payload?.items?.length)) {
		throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 503 };
	}

	const attempt = await arenaRepository.createAttempt({
		userId,
		dateKey: window.dateKey,
		jlpt: userJlpt,
		status: ARENA_ATTEMPT_STATUS.IN_PROGRESS,
		sessionPayload,
		startedAt: new Date(),
	});

	return {
		dateKey: window.dateKey,
		attemptId: String(attempt._id),
		startedAt: attempt.startedAt,
		jlpt: userJlpt,
		session: stripPayloadForClient(sessionPayload),
		messageCode: ARENA.CHALLENGE_STARTED,
	};
}

function getKanjiPayloadFromSession(sessionPayload) {
	const game = sessionPayload?.games?.find(
		(g) => g.gameKey === ARENA_GAME_KEYS.KANJI_RAIN,
	);
	return game?.payload ?? null;
}

/**
 * Chấm một câu Kanji trong phiên (đúng/sai/bỏ qua + phạt thời gian).
 */
export async function checkKanjiAnswer(userId, body) {
	const settings = await arenaRepository.getOrCreateSettings();
	const window = getArenaWindowState(settings);

	if (!window.enabled || !window.isScheduledDay || !window.isOpen) {
		throw { messageCode: ARENA.CLOSED, statusCode: 403 };
	}

	const attempt = await arenaRepository.findAttemptByUserDate(
		userId,
		window.dateKey,
	);
	if (!attempt || attempt.status !== ARENA_ATTEMPT_STATUS.IN_PROGRESS) {
		throw { messageCode: ARENA.NOT_IN_PROGRESS, statusCode: 400 };
	}

	const payload = getKanjiPayloadFromSession(attempt.sessionPayload);
	if (!payload) {
		throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 400 };
	}

	const penaltySeconds = payload.config?.penaltySeconds ?? 5;
	const pointsPerCorrect = payload.config?.pointsPerCorrect ?? 10;
	const id = String(body.id || '');
	const keyRow = (payload.answerKey || []).find((k) => k.id === id);
	if (!keyRow) {
		throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 404 };
	}

	if (body.skipped) {
		return {
			correct: false,
			skipped: true,
			scoreDelta: 0,
			penaltySeconds,
			pointsPerCorrect,
			messageCode: ARENA.STATUS_FETCHED,
		};
	}

	const typed = normalizeAnswer(body.typed);
	const expected = normalizeAnswer(keyRow.hanViet);
	const correct = typed.length > 0 && typed === expected;

	return {
		correct,
		skipped: false,
		scoreDelta: correct ? pointsPerCorrect : 0,
		penaltySeconds: correct ? 0 : penaltySeconds,
		pointsPerCorrect,
		messageCode: ARENA.STATUS_FETCHED,
	};
}

/**
 * @param {string} userId
 * @param {{ games: Array<{ gameKey: string, answers: unknown[], durationMs?: number }> }} body
 */
export async function submitArenaChallenge(userId, body) {
	const settings = await arenaRepository.getOrCreateSettings();
	const window = getArenaWindowState(settings);

	if (!window.enabled || !window.isScheduledDay || !window.isOpen) {
		throw { messageCode: ARENA.CLOSED, statusCode: 403 };
	}

	const attempt = await arenaRepository.findAttemptByUserDate(
		userId,
		window.dateKey,
	);
	if (!attempt || attempt.status !== ARENA_ATTEMPT_STATUS.IN_PROGRESS) {
		throw { messageCode: ARENA.NOT_IN_PROGRESS, statusCode: 400 };
	}

	const graded = gradeArenaSession(attempt.sessionPayload, body.games);

	const startedAt = attempt.startedAt ? new Date(attempt.startedAt) : new Date();
	const wallMs = Math.max(0, Date.now() - startedAt.getTime());

	const updated = await arenaRepository.updateAttempt(attempt._id, {
		status: ARENA_ATTEMPT_STATUS.SUBMITTED,
		gameResults: graded.gameResults,
		score: graded.score,
		correctCount: graded.correctCount,
		totalCount: graded.totalCount,
		durationMs: graded.durationMs || wallMs,
		submittedAt: new Date(),
		sessionPayload: null,
	});

	const attemptJlpt = attempt.jlpt || (await resolveUserArenaJlpt(userId));
	const leaderboard = await arenaRepository.getLeaderboardForDate(
		window.dateKey,
		attemptJlpt,
		ARENA_LEADERBOARD_LIMIT,
	);
	const uid = String(userId);
	const myRank = leaderboard.find((e) => e.userId === uid) ?? null;

	return {
		result: {
			score: updated.score,
			correctCount: updated.correctCount,
			totalCount: updated.totalCount,
			durationMs: updated.durationMs,
			gameResults: updated.gameResults,
			submittedAt: updated.submittedAt,
		},
		myRank,
		leaderboard: leaderboard.slice(0, 10),
		messageCode: ARENA.SUBMITTED,
	};
}

export async function getArenaLeaderboard(userId, dateKey, limit = ARENA_LEADERBOARD_LIMIT) {
	const settings = await arenaRepository.getOrCreateSettings();
	const userJlpt = await resolveUserArenaJlpt(userId);
	const key =
		dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)
			? dateKey
			: getArenaWindowState(settings).dateKey;

	const entries = await arenaRepository.getLeaderboardForDate(key, userJlpt, limit);
	return {
		dateKey: key,
		jlpt: userJlpt,
		entries,
		messageCode: ARENA.LEADERBOARD_FETCHED,
	};
}
