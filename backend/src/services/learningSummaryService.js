import User from '../models/User.js';
import Badge from '../models/Badge.js';
import Grammar from '../models/Grammar.js';
import VocabularyDeck from '../models/VocabularyDeck.js';
import KanjiDeck from '../models/KanjiDeck.js';
import * as streakRepository from '../repositories/streakRepository.js';
import {
	calendarDaysFromIsoDate,
	isoDateLocal,
	weekIsoDatesMondayFirst,
} from '../utils/localDate.js';

/**
 * @param {Date[]} checkInDates
 */
function buildStreakWeekSummary(checkInDates) {
	const weekDates = weekIsoDatesMondayFirst();
	const set = new Set(
		(checkInDates ?? [])
			.map((d) => isoDateLocal(new Date(d)))
			.filter(Boolean),
	);
	const weekCheckIns = weekDates.map((date) => set.has(date));
	return {
		checkedThisWeek: weekCheckIns.filter(Boolean).length,
		weekCheckIns,
	};
}

/**
 * Tóm tắt học tập cho hồ sơ — gộp streak, mục tiêu thi, huy hiệu, thư viện nội dung.
 * @param {import('mongoose').Types.ObjectId} userId
 */
export const getLearningSummary = async (userId) => {
	const [user, streak, vocabDecks, kanjiDecks, grammarLessons] =
		await Promise.all([
			User.findById(userId).select('profile earnedBadges').lean(),
			streakRepository.getOrCreateStreak(userId),
			VocabularyDeck.countDocuments({ isActive: true }),
			KanjiDeck.countDocuments({ isActive: true }),
			Grammar.countDocuments({ isPublished: true }),
		]);

	if (!user) {
		return null;
	}

	const weekSummary = buildStreakWeekSummary(streak?.checkInDates);

	const profile = user.profile || {};
	const examDateIso =
		typeof profile.examDateIso === 'string' ? profile.examDateIso.trim() : '';
	const daysUntilExam = calendarDaysFromIsoDate(examDateIso);

	const earned = Array.isArray(user.earnedBadges) ? user.earnedBadges : [];
	const sortedEarned = [...earned].sort(
		(a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt),
	);
	const latestKey = sortedEarned[0]?.badgeKey
		? String(sortedEarned[0].badgeKey).toLowerCase()
		: null;

	let latestBadge = null;
	if (latestKey) {
		const doc = await Badge.findOne({ key: latestKey, isActive: true })
			.select('key nameVi nameJa emoji iconImage')
			.lean();
		if (doc) {
			latestBadge = {
				key: doc.key,
				nameVi: doc.nameVi,
				nameJa: doc.nameJa,
				emoji: doc.emoji || '🏅',
				iconImage: doc.iconImage || '',
			};
		}
	}

	return {
		streak: {
			current: streak?.currentStreak ?? 0,
			longest: streak?.longestStreak ?? 0,
			checkedThisWeek: weekSummary.checkedThisWeek,
			weekCheckIns: weekSummary.weekCheckIns,
		},
		exam: {
			hasGoal: Boolean(examDateIso),
			examTypeKey: profile.examTypeKey || 'jlpt',
			examLevelKey: profile.examLevelKey || '',
			examDateIso,
			daysUntilExam,
		},
		badges: {
			unlockedCount: earned.length,
			latest: latestBadge,
		},
		library: {
			vocabularyDecksActive: vocabDecks,
			kanjiDecksActive: kanjiDecks,
			grammarLessonsPublished: grammarLessons,
		},
	};
};
