import mongoose from 'mongoose';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';

const QUESTION_TYPES = ['grammar_form', 'particle', 'conjugation', 'usage'];

const grammarPracticeQuestionSchema = new mongoose.Schema(
	{
		jlpt: {
			type: String,
			enum: GRAMMAR_JLPT_LEVELS,
			required: true,
		},
		type: {
			type: String,
			enum: QUESTION_TYPES,
			default: 'grammar_form',
		},
		promptJa: { type: String, required: true, trim: true, maxlength: 2000 },
		promptVi: { type: String, default: '', trim: true, maxlength: 2000 },
		options: {
			type: [{ type: String, trim: true, maxlength: 500 }],
			validate: {
				validator: (v) => Array.isArray(v) && v.length === 4,
				message: 'options must have exactly 4 items',
			},
		},
		answerIndex: { type: Number, required: true, min: 0, max: 3 },
		explainVi: { type: String, default: '', trim: true, maxlength: 2000 },
		pattern: { type: String, default: '', trim: true, maxlength: 200 },
		isPublished: { type: Boolean, default: true },
		source: { type: String, enum: ['ai', 'manual'], default: 'ai' },
		displayOrder: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

grammarPracticeQuestionSchema.index({ isPublished: 1, jlpt: 1, displayOrder: 1, createdAt: -1 });
grammarPracticeQuestionSchema.index({ jlpt: 1, createdAt: -1 });

export default mongoose.model('GrammarPracticeQuestion', grammarPracticeQuestionSchema);
