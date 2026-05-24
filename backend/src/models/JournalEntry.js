import mongoose from 'mongoose';
import { JOURNAL_JLPT_LEVELS } from '../constants/journal.js';

const wordSuggestionSchema = new mongoose.Schema(
	{
		original: { type: String, default: '' },
		suggestedJa: { type: String, default: '' },
		suggestedReading: { type: String, default: '' },
		reasonVi: { type: String, default: '' },
	},
	{ _id: false },
);

const sentenceAnalysisSchema = new mongoose.Schema(
	{
		index: { type: Number, default: 0 },
		textJa: { type: String, default: '' },
		reading: { type: String, default: '' },
		translationVi: { type: String, default: '' },
		feedbackVi: { type: String, default: '' },
		wordSuggestions: { type: [wordSuggestionSchema], default: [] },
	},
	{ _id: false },
);

const journalAnalysisSchema = new mongoose.Schema(
	{
		overallScore: { type: Number, min: 0, max: 100, default: 0 },
		levelEstimate: { type: String, default: '' },
		summaryVi: { type: String, default: '' },
		strengthsVi: { type: [String], default: [] },
		improvementsVi: { type: [String], default: [] },
		sentences: { type: [sentenceAnalysisSchema], default: [] },
	},
	{ _id: false },
);

const journalEntrySchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		dateKey: {
			type: String,
			required: true,
			index: true,
		},
		title: {
			type: String,
			trim: true,
			maxlength: 200,
			default: '',
		},
		contentJa: {
			type: String,
			required: true,
			maxlength: 4000,
		},
		jlpt: {
			type: String,
			enum: JOURNAL_JLPT_LEVELS,
			default: 'N4',
		},
		analysis: {
			type: journalAnalysisSchema,
			default: () => ({}),
		},
		source: {
			type: String,
			enum: ['gemini', 'placeholder'],
			default: 'gemini',
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, dateKey: 1 });

export default mongoose.model('JournalEntry', journalEntrySchema);
