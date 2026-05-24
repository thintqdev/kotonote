import {
	countSectionQuestions,
	normalizeReadingSectionForStorage,
} from './examReadingPassages.js';

/**
 * @param {string} jlpt
 * @param {number} year
 * @param {string} session
 */
export function buildExamPaperSlug(jlpt, year, session) {
	return `${String(jlpt).toLowerCase()}-${year}-${session}`;
}

/**
 * @param {string} jlpt
 * @param {number} year
 * @param {string} session
 */
export function buildExamPaperDefaultTitleVi(jlpt, year, session) {
	const sessionLabel = session === 'july' ? 'Tháng 7' : 'Tháng 12';
	return `JLPT ${jlpt} — Kỳ ${sessionLabel}/${year}`;
}

/**
 * @param {string} jlpt
 * @param {number} year
 * @param {string} session
 */
export function buildExamPaperDefaultTitleJa(jlpt, year, session) {
	const month = session === 'july' ? '7' : '12';
	return `日本語能力試験 ${jlpt}（${year}年${month}月）`;
}

/**
 * @param {Array<{ questions?: unknown[], passages?: unknown[] }>} sections
 */
export function countExamQuestions(sections = []) {
	return sections.reduce((sum, sec) => sum + countSectionQuestions(sec), 0);
}

export { normalizeReadingSectionForStorage };
