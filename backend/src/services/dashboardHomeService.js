import Grammar from '../models/Grammar.js';
import VocabularyDeck from '../models/VocabularyDeck.js';
import Vocabulary from '../models/Vocabulary.js';
import KanjiDeck from '../models/KanjiDeck.js';
import Kanji from '../models/Kanji.js';
import ReadingArticle from '../models/ReadingArticle.js';
import VocabularyDeckProgress from '../models/VocabularyDeckProgress.js';
import KanjiDeckProgress from '../models/KanjiDeckProgress.js';
import * as streakRepository from '../repositories/streakRepository.js';
import * as readingProgressRepository from '../repositories/readingProgressRepository.js';
import { VOCAB_GROWTH_STAGE_MAX } from '../constants/vocabGrowth.js';
import { KANJI_LESSON_GROWTH_MAX } from '../constants/kanji.js';
import User from '../models/User.js';
import { normalizeUserSettings } from '../constants/userSettings.js';
import { normalizeDailySubjectGoals } from '../constants/dailySubjectGoals.js';
import {
	DASHBOARD_SUBJECT_ORDER,
	DASHBOARD_SUBJECT_ROUTES,
	DASHBOARD_SUBJECT_STYLE,
	DASHBOARD_TODAY_DETAIL_KEYS,
	DASHBOARD_TODAY_SUBJECT_IDS,
} from '../constants/dashboardHome.js';

function clampPct(value) {
	const n = Number(value);
	if (!Number.isFinite(n)) return 0;
	return Math.min(100, Math.max(0, Math.round(n)));
}

function startOfToday() {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d;
}

/**
 * @param {{ growthStage?: number }[]} rows
 * @param {number} totalDecks
 * @param {number} maxStage
 */
function progressFromDeckStages(rows, totalDecks, maxStage) {
	if (!totalDecks || !maxStage) return 0;
	const sum = rows.reduce(
		(acc, row) => acc + Math.min(maxStage, row.growthStage ?? 0),
		0,
	);
	return clampPct((sum / (totalDecks * maxStage)) * 100);
}

/**
 * Dữ liệu trang chủ dashboard cho user đã đăng nhập.
 * @param {import('mongoose').Types.ObjectId} userId
 */
export async function getDashboardHome(userId) {
	const todayStart = startOfToday();

	const [
		userDoc,
		streak,
		grammarTotal,
		vocabDecksActive,
		vocabWordsTotal,
		kanjiDecksActive,
		kanjiTotal,
		readingTotal,
		vocabProgressRows,
		kanjiProgressRows,
		readingDone,
		vocabActivityToday,
		kanjiActivityToday,
	] = await Promise.all([
		User.findById(userId).select('settings').lean(),
		streakRepository.getOrCreateStreak(userId),
		Grammar.countDocuments({ isPublished: true }),
		VocabularyDeck.countDocuments({ isActive: true }),
		Vocabulary.countDocuments({ isActive: true }),
		KanjiDeck.countDocuments({ isActive: true }),
		Kanji.countDocuments(),
		ReadingArticle.countDocuments({ isPublished: true }),
		VocabularyDeckProgress.find({ userId }).select('growthStage').lean(),
		KanjiDeckProgress.find({ userId }).select('growthStage').lean(),
		readingProgressRepository.countByUserStatus(userId, 'done'),
		VocabularyDeckProgress.countDocuments({
			userId,
			updatedAt: { $gte: todayStart },
		}),
		KanjiDeckProgress.countDocuments({
			userId,
			updatedAt: { $gte: todayStart },
		}),
	]);

	const totalCounts = {
		grammar: grammarTotal,
		vocab: vocabWordsTotal,
		kanji: kanjiTotal,
		reading: readingTotal,
		listening: 0,
	};

	const progressById = {
		grammar: 0,
		vocab: progressFromDeckStages(
			vocabProgressRows,
			vocabDecksActive,
			VOCAB_GROWTH_STAGE_MAX,
		),
		kanji: progressFromDeckStages(
			kanjiProgressRows,
			kanjiDecksActive,
			KANJI_LESSON_GROWTH_MAX,
		),
		reading: readingTotal
			? clampPct((readingDone / readingTotal) * 100)
			: 0,
		listening: 0,
	};

	const subjects = DASHBOARD_SUBJECT_ORDER.map((id) => {
		const style = DASHBOARD_SUBJECT_STYLE[id] || {
			tint: 'cream',
			variant: 'default',
		};
		return {
			id,
			route: DASHBOARD_SUBJECT_ROUTES[id] || '/',
			progress: progressById[id] ?? 0,
			totalCount: totalCounts[id] ?? 0,
			tint: style.tint,
			variant: style.variant,
		};
	});

	const settings = normalizeUserSettings(userDoc?.settings);
	const dailyGoals = normalizeDailySubjectGoals(
		settings.study?.dailySubjectGoals,
	);

	const todayTasks = DASHBOARD_TODAY_SUBJECT_IDS.map((subjectId) => {
		const target = dailyGoals[subjectId] ?? 1;
		let completed = 0;
		if (subjectId === 'vocab') {
			completed = Math.min(target, vocabActivityToday * 5);
		} else if (subjectId === 'kanji') {
			completed = Math.min(target, kanjiActivityToday * 4);
		}
		return {
			subjectId,
			detailKey: DASHBOARD_TODAY_DETAIL_KEYS[subjectId],
			target,
			completed,
		};
	});

	const taskRatios = todayTasks.map((task) =>
		task.target > 0 ? Math.min(1, task.completed / task.target) : 0,
	);
	const todayPercent = taskRatios.length
		? clampPct(
				(taskRatios.reduce((a, b) => a + b, 0) / taskRatios.length) * 100,
			)
		: 0;

	return {
		streak: {
			days: streak?.currentStreak ?? 0,
		},
		subjects,
		today: {
			percent: todayPercent,
			tasks: todayTasks,
			goals: dailyGoals,
		},
	};
}
