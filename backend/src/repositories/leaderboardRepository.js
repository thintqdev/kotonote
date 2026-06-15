import mongoose from 'mongoose';
import Streak from '../models/Streak.js';
import VocabularyDeckProgress from '../models/VocabularyDeckProgress.js';
import KanjiDeckProgress from '../models/KanjiDeckProgress.js';
import User from '../models/User.js';
import { VOCAB_GROWTH_STAGE_MAX } from '../constants/vocabGrowth.js';
import { KANJI_LESSON_GROWTH_MAX } from '../constants/kanji.js';
import { formatLeaderboardUser } from '../utils/leaderboardUser.js';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

/**
 * @param {number} limit
 */
export async function getTopStreakLeaderboard(limit = 10) {
	const rows = await Streak.find({ currentStreak: { $gt: 0 } })
		.sort({ currentStreak: -1, longestStreak: -1 })
		.limit(limit)
		.populate('userId', 'name email avatar')
		.lean();

	return rows.map((row, index) => {
		const user = row.userId;
		const userId = user?._id ? String(user._id) : String(row.userId);
		return {
			rank: index + 1,
			userId,
			...formatLeaderboardUser(user),
			currentStreak: row.currentStreak ?? 0,
			longestStreak: row.longestStreak ?? 0,
		};
	});
}

/**
 * @param {string} jlpt
 * @returns {Promise<Array<{ userId: string, vocabCompleted: number, kanjiCompleted: number, completedLessons: number }>>}
 */
export async function buildLessonScoresByJlpt(jlpt) {
	const level = String(jlpt || '')
		.trim()
		.toUpperCase();
	if (!JLPT_LEVELS.includes(level)) {
		return [];
	}

	const [vocabRows, kanjiRows] = await Promise.all([
		VocabularyDeckProgress.aggregate([
			{
				$match: {
					jlpt: level,
					growthStage: VOCAB_GROWTH_STAGE_MAX,
				},
			},
			{ $group: { _id: '$userId', count: { $sum: 1 } } },
		]),
		KanjiDeckProgress.aggregate([
			{
				$match: {
					jlpt: level,
					growthStage: KANJI_LESSON_GROWTH_MAX,
				},
			},
			{ $group: { _id: '$userId', count: { $sum: 1 } } },
		]),
	]);

	/** @type {Map<string, { vocab: number, kanji: number }>} */
	const byUser = new Map();
	for (const row of vocabRows) {
		byUser.set(String(row._id), { vocab: row.count, kanji: 0 });
	}
	for (const row of kanjiRows) {
		const key = String(row._id);
		const cur = byUser.get(key) ?? { vocab: 0, kanji: 0 };
		cur.kanji = row.count;
		byUser.set(key, cur);
	}

	return [...byUser.entries()]
		.map(([userId, counts]) => ({
			userId: String(userId),
			vocabCompleted: counts.vocab,
			kanjiCompleted: counts.kanji,
			completedLessons: counts.vocab + counts.kanji,
		}))
		.filter((row) => row.completedLessons > 0)
		.sort((a, b) => {
			if (b.completedLessons !== a.completedLessons) {
				return b.completedLessons - a.completedLessons;
			}
			return b.vocabCompleted - a.vocabCompleted;
		});
}

/**
 * @param {Awaited<ReturnType<typeof buildLessonScoresByJlpt>>} scores
 * @param {number} limit
 */
export async function enrichLessonLeaderboardEntries(scores, limit) {
	const top = scores.slice(0, limit);
	if (!top.length) {
		return [];
	}

	const userIds = top.map((r) =>
		r.userId instanceof mongoose.Types.ObjectId
			? r.userId
			: new mongoose.Types.ObjectId(String(r.userId)),
	);
	const users = await User.find({ _id: { $in: userIds } })
		.select('name email avatar')
		.lean();
	const userMap = new Map(users.map((u) => [String(u._id), u]));

	return top.map((row, index) => ({
		rank: index + 1,
		userId: String(row.userId),
		...formatLeaderboardUser(userMap.get(String(row.userId))),
		completedLessons: row.completedLessons,
		vocabCompleted: row.vocabCompleted,
		kanjiCompleted: row.kanjiCompleted,
	}));
}

/**
 * Bài hoàn thành = growthStage đạt tối đa (nở hoa).
 * @param {string} jlpt — N5…N1
 * @param {number} limit
 */
export async function getTopLessonLeaderboardByJlpt(jlpt, limit = 10) {
	const scores = await buildLessonScoresByJlpt(jlpt);
	return enrichLessonLeaderboardEntries(scores, limit);
}

/**
 * @param {string} userId
 * @param {Awaited<ReturnType<typeof buildLessonScoresByJlpt>>} scores
 */
export function findLessonRankInScores(userId, scores) {
	const uid = String(userId);
	const index = scores.findIndex((row) => row.userId === uid);
	if (index < 0) {
		return null;
	}
	const row = scores[index];
	return {
		rank: index + 1,
		userId: uid,
		completedLessons: row.completedLessons,
		vocabCompleted: row.vocabCompleted,
		kanjiCompleted: row.kanjiCompleted,
	};
}

/**
 * Hạng chuỗi ngày học (chỉ khi currentStreak > 0).
 * @param {string} userId
 */
export async function getStreakRankForUser(userId) {
	const uid =
		userId instanceof mongoose.Types.ObjectId
			? userId
			: new mongoose.Types.ObjectId(String(userId));

	const row = await Streak.findOne({ userId: uid }).lean();
	const current = row?.currentStreak ?? 0;
	if (current <= 0) {
		return null;
	}

	const longest = row?.longestStreak ?? 0;
	const ahead = await Streak.countDocuments({
		$or: [
			{ currentStreak: { $gt: current } },
			{ currentStreak: current, longestStreak: { $gt: longest } },
		],
	});

	return {
		rank: ahead + 1,
		userId: String(uid),
		currentStreak: current,
		longestStreak: longest,
	};
}

export { JLPT_LEVELS };
