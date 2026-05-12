import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		level: {
			type: String,
			enum: ['begin', 'n5', 'n4', 'n3', 'n2up'],
			required: true,
		},
		goal: {
			type: String,
			enum: ['jlpt', 'travel', 'work', 'school', 'hobby'],
			required: true,
		},
		dailyTime: {
			type: String,
			enum: ['lt15', '15-30', '30-60', 'gt60'],
			required: true,
		},
		weakAreas: {
			type: [String],
			enum: ['grammar', 'vocab', 'kanji', 'listen', 'read'],
			default: [],
		},
		discovery: {
			type: String,
			enum: ['friend', 'sns', 'search', 'other'],
		},
		discoveryNote: {
			type: String,
			maxlength: 500,
		},
		freeNote: {
			type: String,
			maxlength: 1000,
		},
		completedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
surveySchema.index({ userId: 1 });
surveySchema.index({ level: 1 });
surveySchema.index({ goal: 1 });

export default mongoose.model('Survey', surveySchema);
