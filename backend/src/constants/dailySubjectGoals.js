/** Mục tiêu tiến độ hằng ngày theo môn (khối “Hôm nay” trên dashboard) */
export const DAILY_SUBJECT_GOAL_IDS = ['grammar', 'vocab', 'kanji'];

export const DEFAULT_DAILY_SUBJECT_GOALS = {
	grammar: 2,
	vocab: 15,
	kanji: 8,
};

export const DAILY_SUBJECT_GOAL_LIMITS = {
	grammar: { min: 1, max: 10 },
	vocab: { min: 5, max: 50 },
	kanji: { min: 1, max: 20 },
};

/**
 * @param {Record<string, unknown> | null | undefined} raw
 */
export function normalizeDailySubjectGoals(raw) {
	const src = raw && typeof raw === 'object' ? raw : {};
	const out = { ...DEFAULT_DAILY_SUBJECT_GOALS };

	for (const id of DAILY_SUBJECT_GOAL_IDS) {
		const n = Number(src[id]);
		const { min, max } = DAILY_SUBJECT_GOAL_LIMITS[id];
		if (Number.isFinite(n)) {
			out[id] = Math.min(max, Math.max(min, Math.round(n)));
		}
	}

	return out;
}
