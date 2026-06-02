import mongoose from 'mongoose';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';

const arenaParticleItemSchema = new mongoose.Schema(
	{
		sentenceJa: { type: String, required: true, trim: true, maxlength: 500 },
		sentenceVi: { type: String, default: '', trim: true, maxlength: 500 },
		/** Đáp án chuẩn (trợ từ / hình thái) */
		answer: { type: String, required: true, trim: true, maxlength: 32 },
		acceptAnswers: {
			type: [{ type: String, trim: true, maxlength: 32 }],
			default: [],
		},
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

export default mongoose.model('ArenaParticleItem', arenaParticleItemSchema);
