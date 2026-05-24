import JournalEntry from '../models/JournalEntry.js';

export const countEntriesByUserOnDateKey = async (userId, dateKey) =>
	JournalEntry.countDocuments({ userId, dateKey });

export const findEntriesByUser = async (userId, { page = 1, limit = 30 } = {}) => {
	const skip = (Math.max(1, page) - 1) * limit;
	const filter = { userId };
	const [entries, total] = await Promise.all([
		JournalEntry.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		JournalEntry.countDocuments(filter),
	]);
	return { entries, total, page: Math.max(1, page), limit };
};

export const findEntryByIdForUser = async (entryId, userId) =>
	JournalEntry.findOne({ _id: entryId, userId });

export const createEntry = async (data) => {
	const entry = new JournalEntry(data);
	return entry.save();
};

export const deleteEntryByIdForUser = async (entryId, userId) =>
	JournalEntry.findOneAndDelete({ _id: entryId, userId });
