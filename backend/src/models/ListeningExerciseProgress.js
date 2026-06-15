import mongoose from 'mongoose';
import { STUDY_PROGRESS_STATUS } from '../constants/studyProgress.js';

const listeningExerciseProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		exerciseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'ListeningExercise',
			required: true,
		},
		status: {
			type: String,
			enum: STUDY_PROGRESS_STATUS,
			default: 'in_progress',
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
		lastActivityAt: { type: Date },
		completedAt: { type: Date },
	},
	{ timestamps: true },
);

listeningExerciseProgressSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });
listeningExerciseProgressSchema.index({ userId: 1, status: 1, lastActivityAt: -1 });

export default mongoose.model(
	'ListeningExerciseProgress',
	listeningExerciseProgressSchema,
);
