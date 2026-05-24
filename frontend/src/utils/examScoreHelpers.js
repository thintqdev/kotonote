import { EXAM_SECTION_META } from '../constants/examPaperStructure.js';

export const EXAM_MAX_TOTAL_SCORE = 180;

/** @param {number} totalQuestions */
export function computeExamPointsPerQuestion(totalQuestions) {
	const total = Math.max(0, Number(totalQuestions) || 0);
	if (total <= 0) return 0;
	return Math.round(EXAM_MAX_TOTAL_SCORE / total);
}

/**
 * @param {number} correct
 * @param {number} totalQuestions
 */
export function computeExamScaledScore(correct, totalQuestions) {
	const perQ = computeExamPointsPerQuestion(totalQuestions);
	const raw = Math.max(0, Number(correct) || 0) * perQ;
	return Math.min(raw, EXAM_MAX_TOTAL_SCORE);
}

/**
 * @param {Array<{ sectionType: string, correct: number, total: number, scorePercent: number }>} sectionScores
 * @param {number} pointsPerQuestion
 */
export function enrichSectionScoresWithPoints(sectionScores, pointsPerQuestion) {
	const perQ = Math.max(0, Number(pointsPerQuestion) || 0);
	return sectionScores.map((row) => ({
		...row,
		pointsPerQuestion: perQ,
		scaledScore: row.correct * perQ,
		scaledMax: row.total * perQ,
	}));
}

/**
 * Phân loại section theo % đúng để nhận xét.
 * @param {Array<{ sectionType: string, scorePercent: number }>} sectionScores
 */
export function buildExamResultFeedback(sectionScores = []) {
	if (!sectionScores.length) {
		return { improve: [], good: [], leverage: [] };
	}

	const avgPct =
		sectionScores.reduce((sum, row) => sum + row.scorePercent, 0) /
		sectionScores.length;

	const improve = [];
	const good = [];
	const leverage = [];

	for (const row of sectionScores) {
		const pct = row.scorePercent;
		if (pct < avgPct - 8 || pct < 55) {
			improve.push(row);
		} else if (pct >= avgPct + 8 && pct >= 72) {
			leverage.push(row);
		} else if (pct >= 55) {
			good.push(row);
		} else {
			improve.push(row);
		}
	}

	const sortByPct = (a, b) => a.scorePercent - b.scorePercent;
	return {
		improve: [...improve].sort(sortByPct),
		good: [...good].sort((a, b) => b.scorePercent - a.scorePercent),
		leverage: [...leverage].sort((a, b) => b.scorePercent - a.scorePercent),
	};
}

/** @param {number} scaledScore @param {number} [maxScore] */
export function getExamOverallFeedbackKey(scaledScore, maxScore = EXAM_MAX_TOTAL_SCORE) {
	const pct = maxScore > 0 ? (scaledScore / maxScore) * 100 : 0;
	if (pct >= 85) return 'examPage.resultOverallExcellent';
	if (pct >= 70) return 'examPage.resultOverallGood';
	if (pct >= 55) return 'examPage.resultOverallFair';
	if (pct >= 40) return 'examPage.resultOverallWeak';
	return 'examPage.resultOverallLow';
}

/** @param {string} sectionType */
export function getExamSectionFeedbackTipKey(sectionType) {
	const tips = {
		vocabulary: 'examPage.resultTipVocabulary',
		grammar: 'examPage.resultTipGrammar',
		reading: 'examPage.resultTipReading',
		listening: 'examPage.resultTipListening',
	};
	return tips[sectionType] ?? 'examPage.resultTipGeneral';
}

/** @param {string} sectionType */
export function examSectionTitleVi(sectionType) {
	return EXAM_SECTION_META[sectionType]?.titleVi ?? sectionType;
}
