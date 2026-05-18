import ReadingArticleProgress from '../models/ReadingArticleProgress.js';

export const findProgressByUser = async (userId, { articleIds } = {}) => {
	const filter = { userId };
	if (articleIds?.length) {
		filter.articleId = { $in: articleIds };
	}
	return ReadingArticleProgress.find(filter).lean();
};

export const findProgressForUserArticle = async (userId, articleId) =>
	ReadingArticleProgress.findOne({ userId, articleId }).lean();

export const upsertProgress = async (userId, articleId, patch) => {
	const update = { ...patch, lastReadAt: new Date() };
	if (patch.status === 'done' && !patch.completedAt) {
		update.completedAt = new Date();
	}
	return ReadingArticleProgress.findOneAndUpdate(
		{ userId, articleId },
		{ $set: update, $setOnInsert: { userId, articleId } },
		{ new: true, upsert: true, runValidators: true },
	).lean();
};

export const countByUserStatus = async (userId, status) =>
	ReadingArticleProgress.countDocuments({ userId, status });
