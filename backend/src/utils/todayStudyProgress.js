import VocabularyDeckProgress from '../models/VocabularyDeckProgress.js';
import KanjiDeckProgress from '../models/KanjiDeckProgress.js';
import { normalizeDailySubjectGoals } from '../constants/dailySubjectGoals.js';
import {
	DASHBOARD_TODAY_DETAIL_KEYS,
	DASHBOARD_TODAY_SUBJECT_IDS,
} from '../constants/dashboardHome.js';

function startOfToday() {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d;
}

function clampPct(value) {
	const n = Number(value);
	if (!Number.isFinite(n)) return 0;
	return Math.min(100, Math.max(0, Math.round(n)));
}

/**
 * Tiến độ mục tiêu hôm nay (vocab / kanji) — dùng cho dashboard & nhắc thông minh.
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {import('../constants/dailySubjectGoals.js').normalizeDailySubjectGoals extends Function ? ReturnType<import('../constants/dailySubjectGoals.js').normalizeDailySubjectGoals> : Record<string, number>} dailyGoals
 */
export async function getTodayStudyProgress(userId, dailyGoals) {
	const todayStart = startOfToday();
	const goals = normalizeDailySubjectGoals(dailyGoals);

	const [vocabActivityToday, kanjiActivityToday] = await Promise.all([
		VocabularyDeckProgress.countDocuments({
			userId,
			updatedAt: { $gte: todayStart },
		}),
		KanjiDeckProgress.countDocuments({
			userId,
			updatedAt: { $gte: todayStart },
		}),
	]);

	const tasks = DASHBOARD_TODAY_SUBJECT_IDS.map((subjectId) => {
		const target = goals[subjectId] ?? 1;
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

	const taskRatios = tasks.map((task) =>
		task.target > 0 ? Math.min(1, task.completed / task.target) : 0,
	);
	const percent = taskRatios.length
		? clampPct(
				(taskRatios.reduce((a, b) => a + b, 0) / taskRatios.length) * 100,
			)
		: 0;

	return { percent, tasks, goals };
}
