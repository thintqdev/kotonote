import GrammarPracticeQuestion from '../models/GrammarPracticeQuestion.js';

/**
 * @param {Record<string, unknown>} filters
 * @param {{ page?: number, limit?: number }} opts
 */
export async function findQuestionsPaginated(filters = {}, opts = {}) {
	const page = Math.max(1, Number(opts.page) || 1);
	const limit = Math.min(50, Math.max(1, Number(opts.limit) || 20));
	const skip = (page - 1) * limit;

	const query = {};
	if (filters.jlpt) query.jlpt = filters.jlpt;
	if (filters.isPublished === true) query.isPublished = true;
	if (filters.isPublished === false) query.isPublished = false;
	if (filters.q) {
		const re = new RegExp(String(filters.q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
		query.$or = [{ promptJa: re }, { promptVi: re }, { pattern: re }];
	}

	const [items, total] = await Promise.all([
		GrammarPracticeQuestion.find(query)
			.sort({ displayOrder: 1, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		GrammarPracticeQuestion.countDocuments(query),
	]);

	return {
		items,
		pagination: {
			page,
			limit,
			total,
			pages: total === 0 ? 0 : Math.ceil(total / limit),
		},
	};
}

export function findQuestionById(id) {
	return GrammarPracticeQuestion.findById(id).lean();
}

export function insertQuestions(docs) {
	return GrammarPracticeQuestion.insertMany(docs, { ordered: true });
}

export function updateQuestionById(id, patch) {
	return GrammarPracticeQuestion.findByIdAndUpdate(id, patch, {
		new: true,
		runValidators: true,
	}).lean();
}

export function deleteQuestionById(id) {
	return GrammarPracticeQuestion.findByIdAndDelete(id);
}

/**
 * Lấy ngẫu nhiên câu đã publish theo JLPT.
 * @param {string} jlpt
 * @param {number} count
 */
export async function samplePublishedQuestions(jlpt, count) {
	const size = Math.max(1, Number(count) || 1);
	const rows = await GrammarPracticeQuestion.aggregate([
		{ $match: { jlpt, isPublished: true } },
		{ $sample: { size } },
	]);
	return rows;
}

export function countPublishedByJlpt(jlpt) {
	return GrammarPracticeQuestion.countDocuments({ jlpt, isPublished: true });
}
