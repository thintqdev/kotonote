import Joi from 'joi';
import { NOTEBOOK_COVER_COLORS } from '../constants/notebook.js';

const noteBody = {
	title: Joi.string().trim().max(200).allow(''),
	contentHtml: Joi.string().max(500_000).allow(''),
	coverColor: Joi.string().valid(...NOTEBOOK_COVER_COLORS),
	isPinned: Joi.boolean(),
};

export const createNoteSchema = Joi.object({
	title: noteBody.title,
	contentHtml: noteBody.contentHtml,
	coverColor: noteBody.coverColor,
	isPinned: noteBody.isPinned,
}).unknown(false);

export const updateNoteSchema = Joi.object({
	title: noteBody.title,
	contentHtml: noteBody.contentHtml,
	coverColor: noteBody.coverColor,
	isPinned: noteBody.isPinned,
})
	.min(1)
	.unknown(false);

export const listNotesSchema = Joi.object({
	page: Joi.number().integer().min(1).default(1),
	limit: Joi.number().integer().min(1).max(100).default(50),
	q: Joi.string().trim().max(120).allow(''),
}).unknown(false);
