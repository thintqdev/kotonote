import mongoose from 'mongoose';
import { SENTENCE_POLITENESS_LEVELS } from '../constants/sentenceTemplate.js';

const sentenceTemplateSchema = new mongoose.Schema(
	{
		specialtyId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'SentenceSpecialty',
			required: true,
			index: true,
		},
		code: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		situationVi: {
			type: String,
			required: true,
			trim: true,
		},
		situationJa: {
			type: String,
			trim: true,
			default: '',
		},
		sentenceJa: {
			type: String,
			required: true,
			trim: true,
		},
		sentenceVi: {
			type: String,
			required: true,
			trim: true,
		},
		reading: {
			type: String,
			trim: true,
			default: '',
		},
		clozePart: {
			type: String,
			required: true,
			trim: true,
		},
		politenessLevel: {
			type: String,
			enum: SENTENCE_POLITENESS_LEVELS,
			default: 'polite',
		},
		noteVi: {
			type: String,
			trim: true,
			default: '',
		},
		noteJa: {
			type: String,
			trim: true,
			default: '',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		displayOrder: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
);

sentenceTemplateSchema.index({ specialtyId: 1, code: 1 }, { unique: true });
sentenceTemplateSchema.index({ specialtyId: 1, isActive: 1, displayOrder: 1 });

export default mongoose.model('SentenceTemplate', sentenceTemplateSchema);
