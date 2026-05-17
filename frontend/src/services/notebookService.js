import { NOTEBOOK } from '../constants/apiEndpoints.js';
import api from './api.js';

/** Cần JWT user */

export async function listNotebookNotes(params = {}) {
	const body = await api.get(NOTEBOOK.NOTES, { params });
	return {
		notes: body.data?.notes ?? [],
		pagination: body.pagination ?? null,
	};
}

export async function getNotebookNote(id) {
	const body = await api.get(NOTEBOOK.note(id));
	return body.data?.note ?? null;
}

export async function createNotebookNote(data) {
	const body = await api.post(NOTEBOOK.NOTES, data);
	return body.data?.note ?? null;
}

export async function updateNotebookNote(id, data) {
	const body = await api.put(NOTEBOOK.note(id), data);
	return body.data?.note ?? null;
}

export async function deleteNotebookNote(id) {
	const body = await api.delete(NOTEBOOK.note(id));
	return body.data ?? null;
}

/**
 * @param {File} file
 * @returns {Promise<string>} public path `/uploads/notebook/...`
 */
export async function uploadNotebookImage(file) {
	const form = new FormData();
	form.append('image', file);
	const body = await api.post(NOTEBOOK.IMAGES, form);
	return body.data?.url ?? '';
}
