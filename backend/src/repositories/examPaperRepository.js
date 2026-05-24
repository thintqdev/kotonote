import ExamPaper from '../models/ExamPaper.js';
import {
	EXAM_DEFAULT_PAGE_SIZE,
	EXAM_MAX_PAGE_SIZE,
} from '../constants/examPaper.js';

const normalizePagination = ({ page = 1, limit = EXAM_DEFAULT_PAGE_SIZE } = {}) => {
	const p = Math.max(1, parseInt(String(page), 10) || 1);
	let l = parseInt(String(limit), 10) || EXAM_DEFAULT_PAGE_SIZE;
	l = Math.min(Math.max(1, l), EXAM_MAX_PAGE_SIZE);
	return { page: p, limit: l, skip: (p - 1) * l };
};

const buildFilter = ({ jlpt, year, session, q, isPublished } = {}) => {
	const filter = {};
	if (typeof isPublished === 'boolean') {
		filter.isPublished = isPublished;
	}
	if (jlpt) filter.jlpt = jlpt;
	if (year) {
		const y = parseInt(String(year), 10);
		if (Number.isFinite(y)) filter.year = y;
	}
	if (session) filter.session = session;
	const qt = String(q || '').trim();
	if (qt) {
		const re = new RegExp(qt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
		filter.$or = [
			{ titleVi: re },
			{ titleJa: re },
			{ slug: re },
			{ descriptionVi: re },
			{ sourceNote: re },
		];
	}
	return filter;
};

export const findExamPapersPaginated = async (filters = {}, pagination = {}) => {
	const { page, limit, skip } = normalizePagination(pagination);
	const query = buildFilter(filters);

	const [items, total] = await Promise.all([
		ExamPaper.find(query)
			.sort({ year: -1, displayOrder: 1, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		ExamPaper.countDocuments(query),
	]);

	return {
		items,
		pagination: {
			page,
			limit,
			total,
			pages: total === 0 ? 0 : Math.ceil(total / limit),
		},
	};
};

export const findExamPaperById = async (id) => ExamPaper.findById(id).lean();

export const findPublishedExamPaperBySlug = async (slug) =>
	ExamPaper.findOne({ slug: String(slug).trim(), isPublished: true }).lean();

export const findDistinctPublishedJlptLevels = async () => {
	const levels = await ExamPaper.distinct('jlpt', { isPublished: true });
	return levels.sort();
};

export const findExamPaperByUniqueKey = async ({ jlpt, year, session }) =>
	ExamPaper.findOne({ jlpt, year, session }).lean();

export const createExamPaper = async (data) => {
	const doc = new ExamPaper(data);
	await doc.save();
	return doc.toObject();
};

export const updateExamPaper = async (id, data) =>
	ExamPaper.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: true,
	}).lean();

export const deleteExamPaper = async (id) => ExamPaper.findByIdAndDelete(id).lean();

export const findDistinctYears = async () => {
	const years = await ExamPaper.distinct('year');
	return years.sort((a, b) => b - a);
};
