import mongoose from 'mongoose';
import { STUDY_PROGRESS_STATUS } from '../constants/studyProgress.js';

const grammarStudyProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		grammarId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Grammar',
			required: true,
		},
		slug: { type: String, trim: true, default: '' },
		jlpt: { type: String, trim: true, default: '' },
		status: {
			type: String,
			enum: STUDY_PROGRESS_STATUS,
			default: 'in_progress',
		},
		lastReadAt: { type: Date },
		completedAt: { type: Date },
	},
	{ timestamps: true },
);

grammarStudyProgressSchema.index({ userId: 1, grammarId: 1 }, { unique: true });
grammarStudyProgressSchema.index({ userId: 1, status: 1, lastReadAt: -1 });

export default mongoose.model('GrammarStudyProgress', grammarStudyProgressSchema);
