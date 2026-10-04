import ReadingSentenceAnalysis from '../models/ReadingSentenceAnalysis.js';

export const findByArticleId = async (articleId) =>
	ReadingSentenceAnalysis.findOne({ articleId }).lean();

/** Tạo mới hoặc reset phân tích khi nội dung bài đổi. */
export const resetForHash = async (articleId, contentHash) =>
	ReadingSentenceAnalysis.findOneAndUpdate(
		{ articleId },
		{ $set: { contentHash, sentences: [] }, $setOnInsert: { articleId } },
		{ new: true, upsert: true },
	).lean();

/** Chỉ ghi khi hash còn khớp — tránh ghi phân tích cũ vào bài đã sửa. */
export const pushSentences = async (articleId, contentHash, sentences) =>
	ReadingSentenceAnalysis.updateOne(
		{ articleId, contentHash },
		{ $push: { sentences: { $each: sentences } } },
	);

export const deleteByArticleId = async (articleId) =>
	ReadingSentenceAnalysis.deleteOne({ articleId });
