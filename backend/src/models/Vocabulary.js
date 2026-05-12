import mongoose from 'mongoose';

const vocabularySchema = new mongoose.Schema(
	{
		deckId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'VocabularyDeck',
			required: true,
		},
		word: {
			type: String,
			required: true,
			trim: true,
		},
		reading: {
			type: String,
			required: true,
			trim: true,
		},
		meaning: {
			type: String,
			required: true,
			trim: true,
		},
		meaningJa: {
			type: String,
			trim: true,
		},
		partOfSpeech: {
			type: String,
			enum: ['noun', 'verb', 'adjective', 'adverb', 'particle', 'other'],
			default: 'noun',
		},
		example: {
			type: String,
			trim: true,
		},
		exampleReading: {
			type: String,
			trim: true,
		},
		exampleMeaning: {
			type: String,
			trim: true,
		},
		audioUrl: {
			type: String,
		},
		imageUrl: {
			type: String,
		},
		displayOrder: {
			type: Number,
			default: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
vocabularySchema.index({ deckId: 1, displayOrder: 1 });
vocabularySchema.index({ word: 1 });
vocabularySchema.index({ isActive: 1 });

export default mongoose.model('Vocabulary', vocabularySchema);
