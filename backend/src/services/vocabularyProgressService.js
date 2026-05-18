import VocabularyDeck from '../models/VocabularyDeck.js';
import VocabularyDeckProgress from '../models/VocabularyDeckProgress.js';
import AppError from '../utils/AppError.js';
import { VOCABULARY } from '../constants/messages.js';
import {
	VOCAB_GROWTH_STAGE_MAX,
	levelToJlpt,
} from '../constants/vocabGrowth.js';

/**
 * @param {import('mongoose').Types.ObjectId | string} deckId
 */
async function getDeckOrThrow(deckId) {
	const deck = await VocabularyDeck.findById(deckId).lean();
	if (!deck) {
		throw new AppError(VOCABULARY.DECK_NOT_FOUND, 404);
	}
	if (deck.isActive === false) {
		throw new AppError(VOCABULARY.DECK_NOT_FOUND, 404);
	}
	return deck;
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {{ jlpt?: string }} [opts]
 */
export async function listDeckProgress(userId, opts = {}) {
	const filter = { userId };
	const jlpt = String(opts.jlpt || '').trim().toUpperCase();
	if (jlpt) {
		filter.jlpt = jlpt;
	}

	const rows = await VocabularyDeckProgress.find(filter)
		.select('deckId jlpt growthStage updatedAt')
		.lean();

	return rows.map((row) => ({
		deckId: String(row.deckId),
		jlpt: row.jlpt,
		growthStage: row.growthStage ?? 0,
		updatedAt: row.updatedAt,
	}));
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {import('mongoose').Types.ObjectId | string} deckId
 */
export async function getDeckProgress(userId, deckId) {
	await getDeckOrThrow(deckId);
	const row = await VocabularyDeckProgress.findOne({ userId, deckId })
		.select('deckId jlpt growthStage updatedAt')
		.lean();

	if (!row) {
		return { deckId: String(deckId), growthStage: 0, advanced: false };
	}

	return {
		deckId: String(row.deckId),
		jlpt: row.jlpt,
		growthStage: row.growthStage ?? 0,
		updatedAt: row.updatedAt,
	};
}

/**
 * Tăng 1 giai đoạn khi quiz hoàn hảo; trả về giai đoạn mới.
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {import('mongoose').Types.ObjectId | string} deckId
 */
export async function advanceDeckProgress(userId, deckId) {
	const deck = await getDeckOrThrow(deckId);
	const jlpt = levelToJlpt(deck.level);

	let doc = await VocabularyDeckProgress.findOne({ userId, deckId });

	if (!doc) {
		doc = await VocabularyDeckProgress.create({
			userId,
			deckId,
			jlpt,
			growthStage: 1,
		});
		return {
			deckId: String(deckId),
			jlpt,
			growthStage: doc.growthStage,
			advanced: true,
		};
	}

	if (doc.growthStage >= VOCAB_GROWTH_STAGE_MAX) {
		return {
			deckId: String(deckId),
			jlpt: doc.jlpt,
			growthStage: doc.growthStage,
			advanced: false,
		};
	}

	doc.growthStage += 1;
	if (!doc.jlpt) {
		doc.jlpt = jlpt;
	}
	await doc.save();

	return {
		deckId: String(deckId),
		jlpt: doc.jlpt,
		growthStage: doc.growthStage,
		advanced: true,
	};
}
