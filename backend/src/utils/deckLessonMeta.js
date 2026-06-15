import { VOCAB_GROWTH_STAGE_MAX } from '../constants/vocabGrowth.js';
import { KANJI_LESSON_GROWTH_MAX } from '../constants/kanji.js';
import { levelToJlpt } from '../constants/vocabGrowth.js';

/**
 * @param {object[]} siblings — deck cùng level/jlpt, đã sort
 * @param {string} deckId
 */
export function lessonNoFromSiblings(siblings, deckId) {
	const idx = siblings.findIndex((d) => String(d._id) === String(deckId));
	return idx >= 0 ? idx + 1 : null;
}

/**
 * @param {number} stage
 * @param {number} maxStage
 */
export function growthProgressPercent(stage, maxStage) {
	const max = Math.max(1, maxStage);
	const s = Math.max(0, Math.min(max, Number(stage) || 0));
	return Math.min(100, Math.round((s / max) * 100));
}

export { VOCAB_GROWTH_STAGE_MAX, KANJI_LESSON_GROWTH_MAX, levelToJlpt };
