import mongoose from 'mongoose';
import { READING_STATUS } from '../constants/reading.js';

const readingArticleProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		articleId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'ReadingArticle',
			required: true,
		},
		status: {
			type: String,
			enum: READING_STATUS,
			default: 'not_started',
		},
		questionAnswers: {
			type: [
				{
					questionIndex: { type: Number, min: 0 },
					choiceIndex: { type: Number, min: 0 },
				},
			],
			default: [],
		},
		lastReadAt: { type: Date },
		completedAt: { type: Date },
	},
	{ timestamps: true },
);

readingArticleProgressSchema.index({ userId: 1, articleId: 1 }, { unique: true });
readingArticleProgressSchema.index({ userId: 1, status: 1 });

export default mongoose.model('ReadingArticleProgress', readingArticleProgressSchema);
