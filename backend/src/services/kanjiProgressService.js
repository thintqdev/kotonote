import KanjiDeck from '../models/KanjiDeck.js';
import KanjiDeckProgress from '../models/KanjiDeckProgress.js';
import AppError from '../utils/AppError.js';
import { KANJI } from '../constants/messages.js';
import { KANJI_LESSON_GROWTH_MAX } from '../constants/kanji.js';

/**
 * @param {import('mongoose').Types.ObjectId | string} deckId
 */
async function getDeckOrThrow(deckId) {
	const deck = await KanjiDeck.findById(deckId).lean();
	if (!deck) {
		throw new AppError(KANJI.DECK_NOT_FOUND, 404);
	}
	if (deck.isActive === false) {
		throw new AppError(KANJI.DECK_NOT_FOUND, 404);
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

	const rows = await KanjiDeckProgress.find(filter)
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
	const row = await KanjiDeckProgress.findOne({ userId, deckId })
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
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {import('mongoose').Types.ObjectId | string} deckId
 */
export async function advanceDeckProgress(userId, deckId) {
	const deck = await getDeckOrThrow(deckId);
	const jlpt = String(deck.jlpt || '').trim().toUpperCase();

	let doc = await KanjiDeckProgress.findOne({ userId, deckId });

	if (!doc) {
		doc = await KanjiDeckProgress.create({
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

	if (doc.growthStage >= KANJI_LESSON_GROWTH_MAX) {
		return {
			deckId: String(deckId),
			jlpt: doc.jlpt,
			growthStage: doc.growthStage,
			advanced: false,
		};
	}

	doc.growthStage += 1;
	if (!doc.jlpt && jlpt) {
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
