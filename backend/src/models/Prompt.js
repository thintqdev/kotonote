import mongoose from 'mongoose';

const PROMPT_TYPES = [
	'vocabulary',
	'kanji',
	'grammar',
	'reading',
	'listening',
	'kaiwa',
	'other',
];
const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

const promptSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			enum: PROMPT_TYPES,
			required: true,
		},
		templateKey: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		content: {
			type: String,
			required: true,
		},
		jlptLevel: {
			type: String,
			enum: JLPT_LEVELS,
		},
		category: {
			type: String,
			trim: true,
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
	{
		timestamps: true,
	}
);

promptSchema.index({ type: 1, templateKey: 1 }, { unique: true });
promptSchema.index({ isActive: 1, type: 1, displayOrder: 1 });

export { PROMPT_TYPES, JLPT_LEVELS };
export default mongoose.model('Prompt', promptSchema);
