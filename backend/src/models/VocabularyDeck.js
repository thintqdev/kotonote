import mongoose from 'mongoose';

const vocabularyDeckSchema = new mongoose.Schema(
	{
		/** null = bộ hệ thống (admin); có giá trị = bộ riêng của user */
		ownerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
			index: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		titleJa: {
			type: String,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		descriptionJa: {
			type: String,
			trim: true,
		},
		level: {
			type: String,
			enum: ['n5', 'n4', 'n3', 'n2', 'n1'],
			required: true,
		},
		category: {
			type: String,
			enum: ['basic', 'grammar', 'kanji', 'conversation', 'business', 'other'],
			default: 'basic',
		},
		thumbnail: {
			type: String,
		},
		totalWords: {
			type: Number,
			default: 0,
			min: 0,
			max: 25,
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

// Indexes
vocabularyDeckSchema.index({ level: 1, displayOrder: 1 });
vocabularyDeckSchema.index({ category: 1 });
vocabularyDeckSchema.index({ isActive: 1 });
vocabularyDeckSchema.index({ ownerId: 1, level: 1, displayOrder: 1 });

export default mongoose.model('VocabularyDeck', vocabularyDeckSchema);
