import mongoose from 'mongoose';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';

const arenaKanjiPoolSchema = new mongoose.Schema(
	{
		char: { type: String, required: true, trim: true, maxlength: 8 },
		hanViet: { type: String, required: true, trim: true, maxlength: 64 },
		onYomi: { type: String, default: '', trim: true },
		kunYomi: { type: String, default: '', trim: true },
		jlpt: {
			type: String,
			enum: GRAMMAR_JLPT_LEVELS,
			default: 'N4',
			index: true,
		},
		isActive: { type: Boolean, default: true, index: true },
	},
	{ timestamps: true },
);

arenaKanjiPoolSchema.index({ jlpt: 1, isActive: 1, char: 1 });

export default mongoose.model('ArenaKanjiPool', arenaKanjiPoolSchema);
