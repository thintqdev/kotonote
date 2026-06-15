import mongoose from 'mongoose';

const kanjiDeckSchema = new mongoose.Schema(
	{
		/** null = bộ hệ thống (admin); có giá trị = bộ riêng của user */
		ownerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
			index: true,
		},
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
kanjiDeckSchema.index({ ownerId: 1, isActive: 1 });

const KanjiDeck = mongoose.model('KanjiDeck', kanjiDeckSchema);

export default KanjiDeck;
