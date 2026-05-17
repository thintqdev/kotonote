import NotebookNote from '../models/NotebookNote.js';

export const findNotesByUser = async (userId, { page = 1, limit = 50, q = '' } = {}) => {
	const filter = { userId };
	const trimmed = String(q || '').trim();
	if (trimmed) {
		filter.$or = [
			{ title: { $regex: trimmed, $options: 'i' } },
			{ contentHtml: { $regex: trimmed, $options: 'i' } },
		];
	}

	const skip = (Math.max(1, page) - 1) * limit;
	const [notes, total] = await Promise.all([
		NotebookNote.find(filter)
			.sort({ isPinned: -1, updatedAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		NotebookNote.countDocuments(filter),
	]);

	return { notes, total, page: Math.max(1, page), limit };
};

export const findNoteByIdForUser = async (noteId, userId) =>
	NotebookNote.findOne({ _id: noteId, userId });

export const createNote = async (data) => {
	const note = new NotebookNote(data);
	return note.save();
};

export const deleteNoteByIdForUser = async (noteId, userId) =>
	NotebookNote.findOneAndDelete({ _id: noteId, userId });
