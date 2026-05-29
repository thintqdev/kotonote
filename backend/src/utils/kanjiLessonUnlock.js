import KanjiDeckProgress from '../models/KanjiDeckProgress.js';
import * as kanjiRepository from '../repositories/kanjiRepository.js';
import { isVocabLessonUnlockedByGrowth } from './vocabLessonUnlock.js';

/**
 * @param {object[]} siblings
 * @param {string} deckId
 */
function resolveLessonNoFromDeckId(siblings, deckId) {
	const idx = siblings.findIndex((d) => String(d._id) === String(deckId));
	return idx >= 0 ? idx + 1 : 1;
}

/**
 * Gắn lessonNo + lessonUnlocked cho danh sách deck Kanji (phân trang).
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {object[]} decks
 */
export async function annotateKanjiDeckLessonUnlock(userId, decks) {
	if (!userId || !Array.isArray(decks) || decks.length === 0) {
		return decks;
	}

	/** @type {Map<string, object[]>} */
	const siblingsByJlpt = new Map();

	const loadSiblings = async (jlpt) => {
		const key = String(jlpt).trim().toUpperCase();
		if (!siblingsByJlpt.has(key)) {
			const rows = await kanjiRepository.findAllDecks({
				jlpt: key,
				isActive: true,
			});
			siblingsByJlpt.set(
				key,
				rows.map((d) => (typeof d.toObject === 'function' ? d.toObject() : d)),
			);
		}
		return siblingsByJlpt.get(key);
	};

	const jlpts = [
		...new Set(
			decks.map((d) => String(d.jlpt || '').trim().toUpperCase()).filter(Boolean),
		),
	];
	await Promise.all(jlpts.map((jlpt) => loadSiblings(jlpt)));

	/** @type {Set<string>} */
	const allDeckIds = new Set();
	for (const jlpt of jlpts) {
		for (const s of siblingsByJlpt.get(jlpt) ?? []) {
			allDeckIds.add(String(s._id));
		}
	}

	const progressRows = await KanjiDeckProgress.find({
		userId,
		deckId: { $in: [...allDeckIds] },
	})
		.select('deckId growthStage')
		.lean();

	const progressMap = new Map();
	for (const row of progressRows) {
		progressMap.set(String(row.deckId), row.growthStage ?? 0);
	}

	return decks.map((deck) => {
		const jlpt = String(deck.jlpt || '').trim().toUpperCase();
		const siblings = siblingsByJlpt.get(jlpt) ?? [];
		const lessonNo = resolveLessonNoFromDeckId(siblings, deck._id);
		const lessonUnlocked =
			lessonNo <= 1 || isVocabLessonUnlockedByGrowth(siblings, lessonNo, progressMap);
		return {
			...deck,
			lessonNo,
			lessonUnlocked,
		};
	});
}
