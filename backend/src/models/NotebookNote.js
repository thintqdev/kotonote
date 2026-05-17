import mongoose from 'mongoose';
import { NOTEBOOK_COVER_COLORS, NOTEBOOK_DEFAULT_TITLE } from '../constants/notebook.js';

const notebookNoteSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		title: {
			type: String,
			default: NOTEBOOK_DEFAULT_TITLE,
			trim: true,
			maxlength: 200,
		},
		contentHtml: {
			type: String,
			default: '',
			maxlength: 500_000,
		},
		coverColor: {
			type: String,
			enum: NOTEBOOK_COVER_COLORS,
			default: 'cream',
		},
		isPinned: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

notebookNoteSchema.index({ userId: 1, updatedAt: -1 });
notebookNoteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

export default mongoose.model('NotebookNote', notebookNoteSchema);
