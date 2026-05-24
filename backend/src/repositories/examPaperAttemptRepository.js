import ExamPaperAttempt from '../models/ExamPaperAttempt.js';

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {Record<string, unknown>} data
 */
export async function createExamPaperAttempt(userId, data) {
	return ExamPaperAttempt.create({ ...data, userId });
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {{ page?: number, limit?: number, slug?: string }} [options]
 */
export async function findExamPaperAttemptsByUser(userId, options = {}) {
	const page = Math.max(1, Number(options.page) || 1);
	const limit = Math.min(50, Math.max(1, Number(options.limit) || 20));
	const skip = (page - 1) * limit;

	const filter = { userId };
	if (options.slug) filter.slug = String(options.slug).trim();

	const [items, total] = await Promise.all([
		ExamPaperAttempt.find(filter)
			.sort({ submittedAt: -1 })
			.skip(skip)
			.limit(limit)
			.select(
				'slug paperSnapshot correct total scorePercent submittedAt createdAt',
			)
			.lean(),
		ExamPaperAttempt.countDocuments(filter),
	]);

	return {
		items,
		pagination: {
			page,
			limit,
			total,
			pages: Math.ceil(total / limit) || 1,
		},
	};
}

/**
 * @param {string} attemptId
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export async function findExamPaperAttemptByIdForUser(attemptId, userId) {
	return ExamPaperAttempt.findOne({ _id: attemptId, userId }).lean();
}
