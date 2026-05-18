import mongoose from 'mongoose';
import { KANJI_LESSON_GROWTH_MAX } from '../constants/kanji.js';

const kanjiDeckProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		deckId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'KanjiDeck',
			required: true,
		},
		jlpt: {
			type: String,
			enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
			required: true,
		},
		growthStage: {
			type: Number,
			min: 0,
			max: KANJI_LESSON_GROWTH_MAX,
			default: 0,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

kanjiDeckProgressSchema.index({ userId: 1, deckId: 1 }, { unique: true });
kanjiDeckProgressSchema.index({ userId: 1, jlpt: 1 });

export default mongoose.model('KanjiDeckProgress', kanjiDeckProgressSchema);
