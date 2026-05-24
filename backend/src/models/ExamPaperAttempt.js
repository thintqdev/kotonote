import mongoose from 'mongoose';

const paperSnapshotSchema = new mongoose.Schema(
	{
		titleVi: { type: String, default: '', trim: true },
		titleJa: { type: String, default: '', trim: true },
		jlpt: { type: String, default: 'N5', trim: true },
		year: { type: Number, default: 0 },
		session: { type: String, default: 'july', trim: true },
		durationMinutes: { type: Number, default: 0 },
		thumbnailUrl: { type: String, default: '', trim: true },
	},
	{ _id: false },
);

const examPaperAttemptSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		examPaperId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'ExamPaper',
			required: true,
			index: true,
		},
		slug: { type: String, required: true, trim: true, index: true },
		paperSnapshot: { type: paperSnapshotSchema, default: () => ({}) },
		answers: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		correct: { type: Number, default: 0, min: 0 },
		total: { type: Number, default: 0, min: 0 },
		scorePercent: { type: Number, default: 0, min: 0, max: 100 },
		submittedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

examPaperAttemptSchema.index({ userId: 1, submittedAt: -1 });
examPaperAttemptSchema.index({ userId: 1, slug: 1, submittedAt: -1 });

export default mongoose.model('ExamPaperAttempt', examPaperAttemptSchema);
