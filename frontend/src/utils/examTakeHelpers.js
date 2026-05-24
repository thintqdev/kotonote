import { EXAM_SECTION_ORDER } from '../constants/examPaperStructure.js';
import { getReadingPassageBlocks } from './examReadingPassages.js';

export function buildExamAnswerKey(sectionType, partType, questionNumber) {
	return `${sectionType}:${partType}:${questionNumber}`;
}

/**
 * @param {Array<{ sectionType?: string, questions?: unknown[] }>} sections
 */
export function countExamPaperQuestions(sections = []) {
	return sections.reduce((sum, section) => {
		return (
			sum +
			getReadingPassageBlocks(section).reduce(
				(n, block) => n + (block.questions?.length ?? 0),
				0,
			)
		);
	}, 0);
}

/**
 * @param {Array<{ sectionType?: string }>} sections
 * @param {string} sectionType
 */
export function filterPaperSections(sections, sectionType) {
	return (sections ?? [])
		.filter((s) => s.sectionType === sectionType)
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getExamSectionTabs(sections = []) {
	return EXAM_SECTION_ORDER.filter((key) =>
		(sections ?? []).some((s) => s.sectionType === key),
	);
}

export const EXAM_CHOICE_LETTERS = ['A', 'B', 'C', 'D'];

export function examChoiceLetter(index) {
	return EXAM_CHOICE_LETTERS[index] ?? String(index + 1);
}

/** Số thứ tự đáp án 1–4 (dùng khi làm đề) */
export function examChoiceNumber(index) {
	return String(index + 1);
}

/**
 * Danh sách phẳng mọi câu hỏi trong đề — phục vụ phiếu trả lời.
 * @param {Array<{ sectionType?: string, partType?: string, order?: number, questions?: Array<{ questionNumber?: number }> }>} sections
 */
export function buildExamQuestionRegistry(sections = []) {
	/** @type {Array<{ key: string, questionNumber: number, sectionType: string, partType: string, order: number }>} */
	const items = [];
	for (const section of sections ?? []) {
		const sectionType = section.sectionType ?? '';
		const partType = section.partType ?? '';
		const order = section.order ?? 0;
		for (const block of getReadingPassageBlocks(section)) {
			(block.questions ?? []).forEach((q, qi) => {
				const qNum = q.questionNumber ?? qi + 1;
				items.push({
					key: buildExamAnswerKey(sectionType, partType, qNum),
					questionNumber: qNum,
					sectionType,
					partType,
					order,
				});
			});
		}
	}
	return items.sort((a, b) => {
		const sectionIdxA = EXAM_SECTION_ORDER.indexOf(a.sectionType);
		const sectionIdxB = EXAM_SECTION_ORDER.indexOf(b.sectionType);
		if (sectionIdxA !== sectionIdxB) return sectionIdxA - sectionIdxB;
		if (a.order !== b.order) return a.order - b.order;
		return a.questionNumber - b.questionNumber;
	});
}

export function buildResultByKey(results = []) {
	/** @type {Record<string, object>} */
	const map = {};
	for (const row of results) {
		if (row?.key) map[row.key] = row;
	}
	return map;
}

export function examQuestionDomId(answerKey) {
	return `exam-q-${String(answerKey).replace(/:/g, '-')}`;
}

/**
 * Gom kết quả theo khối section (từ vựng, ngữ pháp, …).
 * @param {Array<{ sectionType?: string, isCorrect?: boolean }>} results
 */
export function groupExamResultsBySection(results = []) {
	/** @type {Record<string, { correct: number, total: number }>} */
	const map = {};
	for (const row of results) {
		const st = row.sectionType;
		if (!st) continue;
		if (!map[st]) map[st] = { correct: 0, total: 0 };
		map[st].total += 1;
		if (row.isCorrect) map[st].correct += 1;
	}
	return EXAM_SECTION_ORDER.filter((key) => map[key]?.total > 0).map((sectionType) => {
		const { correct, total } = map[sectionType];
		return {
			sectionType,
			correct,
			total,
			scorePercent: total > 0 ? Math.round((correct / total) * 100) : 0,
		};
	});
}
