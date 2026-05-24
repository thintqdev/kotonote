import mongoose from 'mongoose';
import { EXAM_JLPT_LEVELS, EXAM_SECTION_TYPES } from '../constants/examPaper.js';

const blueprintSectionSchema = new mongoose.Schema(
	{
		sectionType: {
			type: String,
			enum: EXAM_SECTION_TYPES,
			required: true,
		},
		partType: {
			type: String,
			required: true,
			trim: true,
			maxlength: 64,
		},
		titleVi: { type: String, default: '', trim: true, maxlength: 200 },
		titleJa: { type: String, default: '', trim: true, maxlength: 200 },
		descriptionVi: { type: String, default: '', trim: true, maxlength: 2000 },
		order: { type: Number, default: 0, min: 0 },
		isEnabled: { type: Boolean, default: true },
		needsPassage: { type: Boolean, default: false },
		needsMedia: { type: Boolean, default: false },
	},
	{ _id: false },
);

const examStructureTemplateSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			maxlength: 64,
		},
		jlpt: {
			type: String,
			enum: EXAM_JLPT_LEVELS,
			required: true,
		},
		name: { type: String, required: true, trim: true, maxlength: 120 },
		description: { type: String, default: '', trim: true, maxlength: 500 },
		isDefault: { type: Boolean, default: true },
		isActive: { type: Boolean, default: true },
		version: { type: Number, default: 1, min: 1 },
		sections: { type: [blueprintSectionSchema], default: [] },
	},
	{ timestamps: true },
);

examStructureTemplateSchema.index({ jlpt: 1, isDefault: 1 });
examStructureTemplateSchema.index({ isActive: 1 });

export default mongoose.model('ExamStructureTemplate', examStructureTemplateSchema);
