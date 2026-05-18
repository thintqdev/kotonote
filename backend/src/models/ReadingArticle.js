import mongoose from 'mongoose';
import { READING_JLPT_LEVELS } from '../constants/reading.js';

const glossSchema = new mongoose.Schema(
	{
		vi: { type: String, default: '' },
		ja: { type: String, default: '' },
	},
	{ _id: false },
);

const vocabularySchema = new mongoose.Schema(
	{
		termJa: { type: String, required: true, trim: true },
		gloss: { type: glossSchema, default: () => ({}) },
	},
	{ _id: false },
);

const questionSchema = new mongoose.Schema(
	{
		questionJa: { type: String, required: true, trim: true },
		choicesJa: {
			type: [String],
			validate: {
				validator: (v) => Array.isArray(v) && v.length >= 2 && v.length <= 5,
				message: 'choicesJa must have 2–5 items',
			},
		},
		answerIndex: { type: Number, required: true, min: 0 },
		explainPerChoice: {
			ja: { type: [String], default: [] },
			vi: { type: [String], default: [] },
		},
	},
	{ _id: false },
);

const readingArticleSchema = new mongoose.Schema(
	{
		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		jlpt: {
			type: String,
			required: true,
			enum: READING_JLPT_LEVELS,
		},
		titleJa: { type: String, required: true, trim: true },
		snippetJa: { type: String, default: '', trim: true },
		wordCount: { type: Number, default: 0, min: 0 },
		readingMinutes: { type: Number, default: 5, min: 1 },
		rating: { type: Number, default: 4.5, min: 0, max: 5 },
		imageUrl: { type: String, default: '' },
		featured: { type: Boolean, default: false },
		isPublished: { type: Boolean, default: true },
		displayOrder: { type: Number, default: 0 },
		paragraphsJa: { type: [String], default: [] },
		vocabulary: { type: [vocabularySchema], default: [] },
		questions: { type: [questionSchema], default: [] },
	},
	{ timestamps: true },
);

readingArticleSchema.index({ isPublished: 1, displayOrder: 1, createdAt: -1 });
readingArticleSchema.index({ jlpt: 1 });
readingArticleSchema.index({ featured: 1 });
readingArticleSchema.index({ titleJa: 'text', snippetJa: 'text' });

export default mongoose.model('ReadingArticle', readingArticleSchema);
