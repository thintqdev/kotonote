import KaiwaPracticeSession from '../models/KaiwaPracticeSession.js';
import { KAIWA_DEFAULT_PAGE_SIZE, KAIWA_MAX_PAGE_SIZE } from '../constants/kaiwa.js';

const normalizePagination = ({ page = 1, limit = KAIWA_DEFAULT_PAGE_SIZE } = {}) => {
	const p = Math.max(1, parseInt(String(page), 10) || 1);
	let l = parseInt(String(limit), 10) || KAIWA_DEFAULT_PAGE_SIZE;
	l = Math.min(Math.max(1, l), KAIWA_MAX_PAGE_SIZE);
	return { page: p, limit: l, skip: (p - 1) * l };
};

export const createSession = async (data) => {
	const doc = new KaiwaPracticeSession(data);
	await doc.save();
	return doc.toObject();
};

export const findSessionById = async (id) =>
	KaiwaPracticeSession.findById(id).lean();

export const findSessionByIdForUser = async (id, userId) =>
	KaiwaPracticeSession.findOne({ _id: id, userId }).lean();

export const updateSessionById = async (id, userId, update) =>
	KaiwaPracticeSession.findOneAndUpdate(
		{ _id: id, userId },
		update,
		{ new: true, runValidators: true },
	).lean();

export const findSessionsForUser = async (userId, { contextId, page, limit } = {}) => {
	const { page: p, limit: l, skip } = normalizePagination({ page, limit });
	const filter = { userId };
	if (contextId) filter.contextId = contextId;

	const [items, total] = await Promise.all([
		KaiwaPracticeSession.find(filter)
			.sort({ lastActivityAt: -1 })
			.skip(skip)
			.limit(l)
			.select('-messages')
			.lean(),
		KaiwaPracticeSession.countDocuments(filter),
	]);

	return {
		items,
		pagination: {
			page: p,
			limit: l,
			total,
			pages: total === 0 ? 0 : Math.ceil(total / l),
		},
	};
};
