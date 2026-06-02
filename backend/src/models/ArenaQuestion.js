import mongoose from 'mongoose';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';

const arenaQuestionSchema = new mongoose.Schema(
	{
		jlpt: {
			type: String,
			enum: GRAMMAR_JLPT_LEVELS,
			default: 'N4',
		},
		questionJa: { type: String, required: true, trim: true, maxlength: 2000 },
		questionVi: { type: String, default: '', trim: true, maxlength: 2000 },
		choices: {
			type: [{ type: String, trim: true, maxlength: 500 }],
			validate: {
				validator: (v) => Array.isArray(v) && v.length >= 2 && v.length <= 6,
				message: 'choices must have 2–6 items',
			},
		},
		answerIndex: { type: Number, required: true, min: 0, max: 5 },
		points: { type: Number, default: 10, min: 1, max: 100 },
		isActive: { type: Boolean, default: true },
		displayOrder: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

arenaQuestionSchema.index({ isActive: 1, jlpt: 1, displayOrder: 1 });

export default mongoose.model('ArenaQuestion', arenaQuestionSchema);
