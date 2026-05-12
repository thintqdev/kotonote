import mongoose from 'mongoose';

const kanaSchema = new mongoose.Schema(
	{
		char: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		romaji: {
			type: String,
			required: true,
			trim: true,
		},
		script: {
			type: String,
			enum: ['hiragana', 'katakana'],
			required: true,
		},
		type: {
			type: String,
			enum: ['gojuon', 'yoon', 'dakuten', 'handakuten'],
			default: 'gojuon',
		},
		rowKey: {
			type: String,
			required: true,
		},
		columnIndex: {
			type: Number,
			required: true,
			min: 0,
		},
		// For yoon (compound characters)
		leadChar: {
			type: String,
			trim: true,
		},
		// Mnemonics for learning
		mnemonicVi: {
			type: String,
			trim: true,
		},
		mnemonicJa: {
			type: String,
			trim: true,
		},
		// Stroke order data (optional, can be loaded from external source)
		strokeCount: {
			type: Number,
			min: 1,
		},
		// Display order
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

// Indexes for faster queries
kanaSchema.index({ script: 1, type: 1, displayOrder: 1 });
kanaSchema.index({ char: 1 });
kanaSchema.index({ script: 1, rowKey: 1 });

export default mongoose.model('Kana', kanaSchema);
