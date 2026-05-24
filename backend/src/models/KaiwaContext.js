import mongoose from 'mongoose';
import { KAIWA_CATEGORIES, KAIWA_JLPT_LEVELS } from '../constants/kaiwa.js';

const roleSchema = new mongoose.Schema(
	{
		nameJa: { type: String, default: '', trim: true },
		nameVi: { type: String, default: '', trim: true },
		descriptionJa: { type: String, default: '', trim: true },
		descriptionVi: { type: String, default: '', trim: true },
	},
	{ _id: false },
);

const keyPhraseSchema = new mongoose.Schema(
	{
		phraseJa: { type: String, required: true, trim: true },
		reading: { type: String, default: '', trim: true },
		meaningVi: { type: String, default: '', trim: true },
	},
	{ _id: false },
);

const kaiwaContextSchema = new mongoose.Schema(
	{
		titleVi: {
			type: String,
			required: [true, 'titleVi is required'],
			trim: true,
			maxlength: 200,
		},
		titleJa: { type: String, default: '', trim: true, maxlength: 200 },
		jlpt: {
			type: String,
			enum: KAIWA_JLPT_LEVELS,
			default: 'N5',
		},
		category: {
			type: String,
			enum: KAIWA_CATEGORIES,
			default: 'daily',
		},
		settingVi: { type: String, default: '', trim: true, maxlength: 500 },
		settingJa: { type: String, default: '', trim: true, maxlength: 500 },
		roles: {
			type: [roleSchema],
			default: [],
		},
		situationVi: {
			type: String,
			required: [true, 'situationVi is required'],
			trim: true,
			maxlength: 4000,
		},
		situationJa: { type: String, default: '', trim: true, maxlength: 4000 },
		objectivesVi: { type: String, default: '', trim: true, maxlength: 2000 },
		objectivesJa: { type: String, default: '', trim: true, maxlength: 2000 },
		keyPhrases: {
			type: [keyPhraseSchema],
			default: [],
		},
		culturalNotesVi: { type: String, default: '', trim: true, maxlength: 2000 },
		culturalNotesJa: { type: String, default: '', trim: true, maxlength: 2000 },
		isPublished: { type: Boolean, default: false },
		displayOrder: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

kaiwaContextSchema.index({ jlpt: 1, category: 1, isPublished: 1 });
kaiwaContextSchema.index({ displayOrder: 1, createdAt: -1 });

export default mongoose.model('KaiwaContext', kaiwaContextSchema);
