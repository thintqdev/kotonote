import Grammar from '../models/Grammar.js';
import GrammarStudyProgress from '../models/GrammarStudyProgress.js';
import AppError from '../utils/AppError.js';
import { GRAMMAR } from '../constants/messages.js';

/**
 * Ghi nhận đang xem bài ngữ pháp (tiếp tục học).
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {import('mongoose').Types.ObjectId | string} grammarId
 */
export async function touchGrammarProgress(userId, grammarId) {
	const grammar = await Grammar.findById(grammarId)
		.select('slug jlpt isPublished')
		.lean();
	if (!grammar || !grammar.isPublished) {
		throw new AppError(GRAMMAR.NOT_FOUND, 404);
	}

	const now = new Date();
	return GrammarStudyProgress.findOneAndUpdate(
		{ userId, grammarId },
		{
			$set: {
				slug: grammar.slug,
				jlpt: grammar.jlpt,
				status: 'in_progress',
				lastReadAt: now,
			},
			$setOnInsert: { userId, grammarId },
		},
		{ new: true, upsert: true, runValidators: true },
	).lean();
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export async function listInProgressGrammar(userId) {
	return GrammarStudyProgress.find({
		userId,
		status: 'in_progress',
	})
		.sort({ lastReadAt: -1 })
		.limit(5)
		.lean();
}
