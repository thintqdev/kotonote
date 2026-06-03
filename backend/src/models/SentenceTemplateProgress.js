import mongoose from 'mongoose';
import { SENTENCE_PROGRESS_STATUS } from '../constants/sentenceTemplate.js';

const sentenceTemplateProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		templateId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'SentenceTemplate',
			required: true,
		},
		status: {
			type: String,
			enum: SENTENCE_PROGRESS_STATUS,
			default: 'not_started',
		},
		flashSeenCount: {
			type: Number,
			default: 0,
			min: 0,
		},
		quizCorrectCount: {
			type: Number,
			default: 0,
			min: 0,
		},
		quizWrongCount: {
			type: Number,
			default: 0,
			min: 0,
		},
		reviewLevel: {
			type: Number,
			default: 0,
			min: 0,
		},
		lastStudiedAt: { type: Date },
		nextReviewAt: { type: Date },
		masteredAt: { type: Date },
	},
	{ timestamps: true },
);

sentenceTemplateProgressSchema.index({ userId: 1, templateId: 1 }, { unique: true });
sentenceTemplateProgressSchema.index({ userId: 1, status: 1 });
sentenceTemplateProgressSchema.index({ userId: 1, nextReviewAt: 1 });

export default mongoose.model('SentenceTemplateProgress', sentenceTemplateProgressSchema);
