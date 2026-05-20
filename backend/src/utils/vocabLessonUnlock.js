import VocabularyDeckProgress from '../models/VocabularyDeckProgress.js';
import * as vocabularyRepository from '../repositories/vocabularyRepository.js';
import AppError from './AppError.js';
import { VOCABULARY } from '../constants/messages.js';

export const VOCAB_UNLOCK_SPROUT_STAGE = 1;

/**
 * @param {string|import('mongoose').Types.ObjectId} deckId
 * @param {Map<string, number>} progressMap
 */
function deckGrowthStage(deckId, progressMap) {
	const s = progressMap.get(String(deckId));
	return Number.isFinite(s) ? Math.max(0, Math.floor(Number(s))) : 0;
}

/**
 * @param {object[]} sortedDecks
 * @param {number} lessonNo
 * @param {Map<string, number>} progressMap
 */
export function isVocabLessonUnlockedByGrowth(sortedDecks, lessonNo, progressMap) {
	const n = Math.max(1, Math.floor(Number(lessonNo) || 1));
	if (n <= 1) return true;

	/** @type {number[]} */
	const prev = [];
	for (let i = 0; i < n - 1; i++) {
		const deck = sortedDecks[i];
		if (deck) prev.push(deckGrowthStage(deck._id, progressMap));
	}
	if (!prev.length) return true;

	const need = VOCAB_UNLOCK_SPROUT_STAGE;
	if (n === 2) return prev[0] >= need;
	if (n === 3) return prev.filter((s) => s >= need).length >= 1;
	return prev[prev.length - 1] >= need;
}

/**
 * Số bài theo thứ tự deck trên server (không tin query lessonNo — tránh lệch URL).
 * @param {object[]} siblings
 * @param {string} deckId
 */
function resolveLessonNoFromDeckId(siblings, deckId) {
	return siblings.findIndex((d) => String(d._id) === String(deckId)) + 1;
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {import('mongoose').Types.ObjectId | string} deckId
 * @param {{ lessonNo?: number | string }} [opts]
 */
export async function assertVocabDeckLessonUnlocked(userId, deckId, opts = {}) {
	const deck = await vocabularyRepository.findDeckById(deckId);
	if (!deck || deck.isActive === false) {
		throw new AppError(VOCABULARY.DECK_NOT_FOUND, 404);
	}

	const siblings = await vocabularyRepository.findAllDecks({
		level: deck.level,
		isActive: true,
	});

	const siblingsPlain = siblings.map((d) =>
		typeof d.toObject === 'function' ? d.toObject() : d,
	);

	const lessonNo = resolveLessonNoFromDeckId(siblingsPlain, deckId);
	if (lessonNo < 1) {
		throw new AppError(VOCABULARY.DECK_NOT_FOUND, 404);
	}

	if (lessonNo <= 1) {
		return;
	}

	const deckIds = siblingsPlain.map((d) => d._id);
	const progressRows = await VocabularyDeckProgress.find({
		userId,
		deckId: { $in: deckIds },
	})
		.select('deckId growthStage')
		.lean();

	const progressMap = new Map();
	for (const row of progressRows) {
		progressMap.set(String(row.deckId), row.growthStage ?? 0);
	}

	if (!isVocabLessonUnlockedByGrowth(siblingsPlain, lessonNo, progressMap)) {
		throw new AppError(VOCABULARY.LESSON_LOCKED, 403, [
			{ field: 'lessonNo', message: String(lessonNo) },
		]);
	}
}
