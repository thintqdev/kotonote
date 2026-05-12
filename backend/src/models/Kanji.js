import mongoose from 'mongoose';

const kanjiSchema = new mongoose.Schema(
	{
		deckId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'KanjiDeck',
			required: true,
		},
		char: {
			type: String,
			required: true,
			trim: true,
		},
		onYomi: {
			type: String,
			required: true,
			trim: true,
		},
		kunYomi: {
			type: String,
			default: '—',
			trim: true,
		},
		hanViet: {
			type: String,
			required: true,
			trim: true,
		},
		meaningVi: {
			type: String,
			required: true,
		},
		vocabJa: {
			type: String,
			required: true,
		},
		exampleJa: {
			type: String,
			required: true,
		},
		exampleVi: {
			type: String,
			required: true,
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

// Index for efficient queries
kanjiSchema.index({ deckId: 1, displayOrder: 1 });
kanjiSchema.index({ char: 1 });

// Compound unique index: same char can exist in different decks
kanjiSchema.index({ deckId: 1, char: 1 }, { unique: true });

const Kanji = mongoose.model('Kanji', kanjiSchema);

export default Kanji;
