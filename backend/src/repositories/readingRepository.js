import ReadingArticle from '../models/ReadingArticle.js';
import {
	READING_ADMIN_DEFAULT_PAGE_SIZE,
	READING_DEFAULT_PAGE_SIZE,
	READING_MAX_PAGE_SIZE,
} from '../constants/reading.js';

const normalizePagination = (
	{ page = 1, limit = READING_DEFAULT_PAGE_SIZE } = {},
	{ max = READING_MAX_PAGE_SIZE, fallback = READING_DEFAULT_PAGE_SIZE } = {},
) => {
	const p = Math.max(1, parseInt(String(page), 10) || 1);
	let l = parseInt(String(limit), 10) || fallback;
	l = Math.min(Math.max(1, l), max);
	return { page: p, limit: l, skip: (p - 1) * l };
};

const buildFilter = ({ jlpt, q, isPublished, featured } = {}) => {
	const filter = {};
	if (typeof isPublished === 'boolean') filter.isPublished = isPublished;
	if (jlpt) filter.jlpt = jlpt;
	if (typeof featured === 'boolean') filter.featured = featured;
	const qt = String(q || '').trim();
	if (qt) {
		const re = new RegExp(qt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
		filter.$or = [{ titleJa: re }, { snippetJa: re }, { slug: re }];
	}
	return filter;
};

export const findArticlesPaginated = async (filters = {}, pagination = {}) => {
	const { page, limit, skip } = normalizePagination(pagination, {
		fallback:
			filters.adminList === true
				? READING_ADMIN_DEFAULT_PAGE_SIZE
				: READING_DEFAULT_PAGE_SIZE,
	});
	const { adminList, ...rest } = filters;
	const query = buildFilter(rest);

	const [items, total] = await Promise.all([
		ReadingArticle.find(query)
			.sort({ displayOrder: 1, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		ReadingArticle.countDocuments(query),
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

export const findDistinctJlptLevels = async (publishedOnly = true) => {
	const filter = publishedOnly ? { isPublished: true } : {};
	return ReadingArticle.distinct('jlpt', filter);
};

export const findArticleBySlug = async (slug, { publishedOnly = false } = {}) => {
	const filter = { slug: String(slug || '').trim().toLowerCase() };
	if (publishedOnly) filter.isPublished = true;
	return ReadingArticle.findOne(filter).lean();
};

export const findArticleById = async (id) => ReadingArticle.findById(id).lean();

export const findArticleBySlugExcludingId = async (slug, excludeId) =>
	ReadingArticle.findOne({
		slug: String(slug || '').trim().toLowerCase(),
		_id: { $ne: excludeId },
	}).lean();

export const createArticle = async (data) => {
	const doc = new ReadingArticle(data);
	await doc.save();
	return doc.toObject();
};

export const updateArticleById = async (id, data) =>
	ReadingArticle.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

export const deleteArticleById = async (id) => ReadingArticle.findByIdAndDelete(id);
