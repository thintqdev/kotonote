import mongoose from 'mongoose';

const kanjiDeckSchema = new mongoose.Schema(
	{
		titleVi: {
			type: String,
			required: true,
			trim: true,
		},
		titleJa: {
			type: String,
			required: true,
			trim: true,
		},
		descriptionVi: {
			type: String,
			default: '',
		},
		descriptionJa: {
			type: String,
			default: '',
		},
		jlpt: {
			type: String,
			required: true,
			enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
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

// Index for efficient queries
kanjiDeckSchema.index({ jlpt: 1, displayOrder: 1 });
kanjiDeckSchema.index({ isActive: 1 });

const KanjiDeck = mongoose.model('KanjiDeck', kanjiDeckSchema);

export default KanjiDeck;
