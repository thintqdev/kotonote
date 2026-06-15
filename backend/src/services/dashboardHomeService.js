import VocabularyDeckProgress from '../models/VocabularyDeckProgress.js';
import KanjiDeckProgress from '../models/KanjiDeckProgress.js';
import * as streakRepository from '../repositories/streakRepository.js';
import * as readingProgressRepository from '../repositories/readingProgressRepository.js';
import { VOCAB_GROWTH_STAGE_MAX } from '../constants/vocabGrowth.js';
import { KANJI_LESSON_GROWTH_MAX } from '../constants/kanji.js';
import User from '../models/User.js';
import { normalizeUserSettings } from '../constants/userSettings.js';
import {
	DASHBOARD_SUBJECT_ORDER,
	DASHBOARD_SUBJECT_ROUTES,
	DASHBOARD_SUBJECT_STYLE,
} from '../constants/dashboardHome.js';
import { getTodayStudyProgress } from '../utils/todayStudyProgress.js';
import { getContinueStudy } from './continueStudyService.js';
import { getDashboardCatalogCounts } from './dashboardCatalogCountsService.js';

function clampPct(value) {
	const n = Number(value);
	if (!Number.isFinite(n)) return 0;
	return Math.min(100, Math.max(0, Math.round(n)));
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
	const [
		userDoc,
		streak,
		catalogCounts,
		vocabProgressRows,
		kanjiProgressRows,
		readingDone,
	] = await Promise.all([
		User.findById(userId).select('settings').lean(),
		streakRepository.getOrCreateStreak(userId),
		getDashboardCatalogCounts(),
		VocabularyDeckProgress.find({ userId }).select('growthStage').lean(),
		KanjiDeckProgress.find({ userId }).select('growthStage').lean(),
		readingProgressRepository.countByUserStatus(userId, 'done'),
	]);

	const {
		grammarTotal,
		vocabDecksActive,
		vocabWordsTotal,
		kanjiDecksActive,
		kanjiTotal,
		readingTotal,
	} = catalogCounts;

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
	const [{ percent: todayPercent, tasks: todayTasks, goals: dailyGoals }, continueStudy] =
		await Promise.all([
			getTodayStudyProgress(userId, settings.study?.dailySubjectGoals),
			getContinueStudy(userId),
		]);

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
		continue: continueStudy,
	};
}
