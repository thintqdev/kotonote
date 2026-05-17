import Grammar from '../models/Grammar.js';
import {
	GRAMMAR_DEFAULT_PAGE_SIZE,
	GRAMMAR_MAX_PAGE_SIZE,
} from '../constants/grammar.js';

const normalizePagination = ({ page = 1, limit = GRAMMAR_DEFAULT_PAGE_SIZE } = {}) => {
	const p = Math.max(1, parseInt(String(page), 10) || 1);
	let l = parseInt(String(limit), 10) || GRAMMAR_DEFAULT_PAGE_SIZE;
	l = Math.min(Math.max(1, l), GRAMMAR_MAX_PAGE_SIZE);
	return { page: p, limit: l, skip: (p - 1) * l };
};

const buildFilter = ({ jlpt, tag, q, isPublished } = {}) => {
	const filter = {};
	if (typeof isPublished === 'boolean') {
		filter.isPublished = isPublished;
	}
	if (jlpt) filter.jlpt = jlpt;
	if (tag) filter.tagIds = tag;
	const qt = String(q || '').trim();
	if (qt) {
		const re = new RegExp(qt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
		filter.$or = [
			{ pattern: re },
			{ 'teaser.ja': re },
			{ 'teaser.vi': re },
			{ slug: re },
		];
	}
	return filter;
};

export const findGrammarsPaginated = async (filters = {}, pagination = {}) => {
	const { page, limit, skip } = normalizePagination(pagination);
	const query = buildFilter(filters);

	const [items, total] = await Promise.all([
		Grammar.find(query)
			.sort({ displayOrder: 1, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		Grammar.countDocuments(query),
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
	return Grammar.distinct('jlpt', filter);
};

export const findGrammarBySlug = async (slug, { publishedOnly = false } = {}) => {
	const filter = { slug: String(slug || '').trim().toLowerCase() };
	if (publishedOnly) filter.isPublished = true;
	return Grammar.findOne(filter).lean();
};

export const findGrammarById = async (id) => Grammar.findById(id).lean();

export const findGrammarBySlugExcludingId = async (slug, excludeId) =>
	Grammar.findOne({
		slug: String(slug || '').trim().toLowerCase(),
		_id: { $ne: excludeId },
	}).lean();

export const createGrammar = async (data) => {
	const doc = new Grammar(data);
	await doc.save();
	return doc.toObject();
};

export const updateGrammar = async (id, data) =>
	Grammar.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: true,
	}).lean();

export const deleteGrammar = async (id) => Grammar.findByIdAndDelete(id).lean();
