import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema(
	{
		quoteVi: {
			type: String,
			required: true,
			trim: true,
		},
		quoteJa: {
			type: String,
			required: true,
			trim: true,
		},
		author: {
			type: String,
			trim: true,
		},
		category: {
			type: String,
			enum: ['motivation', 'learning', 'wisdom', 'perseverance', 'success'],
			default: 'motivation',
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

// Index for faster queries
quoteSchema.index({ isActive: 1, displayOrder: 1 });
quoteSchema.index({ category: 1 });

export default mongoose.model('Quote', quoteSchema);
