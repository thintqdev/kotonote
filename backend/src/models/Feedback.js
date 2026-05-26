import mongoose from 'mongoose';
import {
	FEEDBACK_CATEGORY_KEYS,
	FEEDBACK_STATUS,
	FEEDBACK_STATUS_KEYS,
} from '../constants/feedback.js';

const feedbackSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		category: {
			type: String,
			enum: FEEDBACK_CATEGORY_KEYS,
			required: true,
		},
		message: {
			type: String,
			required: true,
			trim: true,
			maxlength: 2000,
		},
		pageUrl: {
			type: String,
			trim: true,
			maxlength: 500,
			default: '',
		},
		locale: {
			type: String,
			trim: true,
			maxlength: 10,
			default: '',
		},
		userAgent: {
			type: String,
			trim: true,
			maxlength: 500,
			default: '',
		},
		appVersion: {
			type: String,
			trim: true,
			maxlength: 50,
			default: '',
		},
		status: {
			type: String,
			enum: FEEDBACK_STATUS_KEYS,
			default: FEEDBACK_STATUS.OPEN,
			index: true,
		},
		adminNote: {
			type: String,
			trim: true,
			maxlength: 1000,
			default: '',
		},
		/** Ảnh/video đã upload (URL công khai giống notebook). */
		attachments: {
			type: [
				{
					url: { type: String, required: true, trim: true, maxlength: 2048 },
					kind: { type: String, enum: ['image', 'video'], required: true },
				},
			],
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model('Feedback', feedbackSchema);
