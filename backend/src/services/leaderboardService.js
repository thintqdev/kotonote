import * as leaderboardRepository from '../repositories/leaderboardRepository.js';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 10;

/**
 * @param {unknown} raw
 * @returns {number}
 */
function parseLimit(raw) {
	const n = Number.parseInt(String(raw ?? DEFAULT_LIMIT), 10);
	if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT;
	return Math.min(n, MAX_LIMIT);
}

/**
 * @param {{ jlpt?: string, limit?: number|string }} [opts]
 * @param {string | null | undefined} viewerUserId
 */
export async function getLeaderboards(opts = {}, viewerUserId = null) {
	const jlptRaw = String(opts.jlpt || 'N5')
		.trim()
		.toUpperCase();
	const jlpt = leaderboardRepository.JLPT_LEVELS.includes(jlptRaw)
		? jlptRaw
		: 'N5';
	const limit = parseLimit(opts.limit);
	const viewerId = viewerUserId ? String(viewerUserId) : '';

	const [streak, lessonScores, streakMe] = await Promise.all([
		leaderboardRepository.getTopStreakLeaderboard(limit),
		leaderboardRepository.buildLessonScoresByJlpt(jlpt),
		viewerId
			? leaderboardRepository.getStreakRankForUser(viewerId)
			: Promise.resolve(null),
	]);

	const lessons =
		await leaderboardRepository.enrichLessonLeaderboardEntries(
			lessonScores,
			limit,
		);

	const lessonMe = viewerId
		? leaderboardRepository.findLessonRankInScores(viewerId, lessonScores)
		: null;

	return {
		streak,
		lessons: {
			jlpt,
			entries: lessons,
		},
		me: {
			streak: streakMe,
			lessons: lessonMe,
		},
		limit,
	};
}
