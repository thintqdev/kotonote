import * as notebookRepository from '../repositories/notebookRepository.js';
import {
	NOTEBOOK_COVER_COLORS,
	NOTEBOOK_DEFAULT_TITLE,
} from '../constants/notebook.js';
import { NOTEBOOK } from '../constants/messages.js';
import { noteExcerptFromHtml, sanitizeNoteHtml } from '../utils/sanitizeNoteHtml.js';

function mapNote(note) {
	if (!note) return null;
	const plain = note.toObject ? note.toObject() : { ...note };
	return {
		...plain,
		excerpt: noteExcerptFromHtml(plain.contentHtml),
	};
}

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {{ page?: number, limit?: number, q?: string }} query
 */
export const listNotes = async (userId, query = {}) => {
	const { notes, total, page, limit } = await notebookRepository.findNotesByUser(
		userId,
		query,
	);
	return {
		notes: notes.map((n) => ({
			...n,
			excerpt: noteExcerptFromHtml(n.contentHtml),
		})),
		pagination: {
			page,
			limit,
			total,
			pages: Math.ceil(total / limit) || 1,
		},
	};
};

export const getNote = async (userId, noteId) => {
	const note = await notebookRepository.findNoteByIdForUser(noteId, userId);
	if (!note) {
		throw { messageCode: NOTEBOOK.NOT_FOUND, statusCode: 404 };
	}
	return mapNote(note);
};

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {{ title?: string, contentHtml?: string, coverColor?: string, isPinned?: boolean }} body
 */
export const createNote = async (userId, body = {}) => {
	const coverColor = NOTEBOOK_COVER_COLORS.includes(body.coverColor)
		? body.coverColor
		: 'cream';

	const note = await notebookRepository.createNote({
		userId,
		title: String(body.title || NOTEBOOK_DEFAULT_TITLE).trim().slice(0, 200) || NOTEBOOK_DEFAULT_TITLE,
		contentHtml: sanitizeNoteHtml(body.contentHtml),
		coverColor,
		isPinned: Boolean(body.isPinned),
	});

	return mapNote(note);
};

export const updateNote = async (userId, noteId, body = {}) => {
	const note = await notebookRepository.findNoteByIdForUser(noteId, userId);
	if (!note) {
		throw { messageCode: NOTEBOOK.NOT_FOUND, statusCode: 404 };
	}

	if (body.title !== undefined) {
		const t = String(body.title).trim().slice(0, 200);
		note.title = t || NOTEBOOK_DEFAULT_TITLE;
	}
	if (body.contentHtml !== undefined) {
		note.contentHtml = sanitizeNoteHtml(body.contentHtml);
	}
	if (body.coverColor !== undefined) {
		note.coverColor = NOTEBOOK_COVER_COLORS.includes(body.coverColor)
			? body.coverColor
			: note.coverColor;
	}
	if (body.isPinned !== undefined) {
		note.isPinned = Boolean(body.isPinned);
	}

	await note.save();
	return mapNote(note);
};

export const deleteNote = async (userId, noteId) => {
	const note = await notebookRepository.deleteNoteByIdForUser(noteId, userId);
	if (!note) {
		throw { messageCode: NOTEBOOK.NOT_FOUND, statusCode: 404 };
	}
	return { deleted: true };
};
