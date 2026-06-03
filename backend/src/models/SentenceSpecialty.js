import mongoose from 'mongoose';

const sentenceSpecialtySchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		nameVi: {
			type: String,
			required: true,
			trim: true,
		},
		nameJa: {
			type: String,
			required: true,
			trim: true,
		},
		descriptionVi: {
			type: String,
			trim: true,
			default: '',
		},
		descriptionJa: {
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

sentenceSpecialtySchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model('SentenceSpecialty', sentenceSpecialtySchema);
