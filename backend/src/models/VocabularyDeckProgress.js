import mongoose from 'mongoose';
import { VOCAB_GROWTH_STAGE_MAX } from '../constants/vocabGrowth.js';

const vocabularyDeckProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		deckId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'VocabularyDeck',
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
			max: VOCAB_GROWTH_STAGE_MAX,
			default: 0,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

vocabularyDeckProgressSchema.index({ userId: 1, deckId: 1 }, { unique: true });
vocabularyDeckProgressSchema.index({ userId: 1, jlpt: 1 });
vocabularyDeckProgressSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model('VocabularyDeckProgress', vocabularyDeckProgressSchema);
