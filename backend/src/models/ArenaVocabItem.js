import mongoose from 'mongoose';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';

const arenaVocabItemSchema = new mongoose.Schema(
	{
		wordJa: { type: String, required: true, trim: true, maxlength: 120 },
		reading: { type: String, default: '', trim: true },
		choices: {
			type: [{ type: String, trim: true, maxlength: 200 }],
			validate: {
				validator: (v) => Array.isArray(v) && v.length >= 2 && v.length <= 6,
			},
		},
		answerIndex: { type: Number, required: true, min: 0, max: 5 },
		jlpt: {
			type: String,
			enum: GRAMMAR_JLPT_LEVELS,
			default: 'N4',
			index: true,
		},
		isActive: { type: Boolean, default: true, index: true },
		displayOrder: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

export default mongoose.model('ArenaVocabItem', arenaVocabItemSchema);
