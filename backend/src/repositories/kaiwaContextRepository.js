import KaiwaContext from '../models/KaiwaContext.js';
import {
	KAIWA_DEFAULT_PAGE_SIZE,
	KAIWA_MAX_PAGE_SIZE,
} from '../constants/kaiwa.js';

const normalizePagination = ({ page = 1, limit = KAIWA_DEFAULT_PAGE_SIZE } = {}) => {
	const p = Math.max(1, parseInt(String(page), 10) || 1);
	let l = parseInt(String(limit), 10) || KAIWA_DEFAULT_PAGE_SIZE;
	l = Math.min(Math.max(1, l), KAIWA_MAX_PAGE_SIZE);
	return { page: p, limit: l, skip: (p - 1) * l };
};

const buildFilter = ({ jlpt, category, q, isPublished } = {}) => {
	const filter = {};
	if (typeof isPublished === 'boolean') {
		filter.isPublished = isPublished;
	}
	if (jlpt) filter.jlpt = jlpt;
	if (category) filter.category = category;
	const qt = String(q || '').trim();
	if (qt) {
		const re = new RegExp(qt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
		filter.$or = [
			{ titleVi: re },
			{ titleJa: re },
			{ situationVi: re },
			{ situationJa: re },
			{ settingVi: re },
		];
	}
	return filter;
};

export const findContextsPaginated = async (filters = {}, pagination = {}) => {
	const { page, limit, skip } = normalizePagination(pagination);
	const query = buildFilter(filters);

	const [items, total] = await Promise.all([
		KaiwaContext.find(query)
			.sort({ displayOrder: 1, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		KaiwaContext.countDocuments(query),
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

export const findContextById = async (id) => KaiwaContext.findById(id).lean();

export const createContext = async (data) => {
	const doc = new KaiwaContext(data);
	await doc.save();
	return doc.toObject();
};

export const updateContext = async (id, data) =>
	KaiwaContext.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: true,
	}).lean();

export const deleteContext = async (id) =>
	KaiwaContext.findByIdAndDelete(id).lean();

const JLPT_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'];

/** @param {boolean} [publishedOnly] */
export const findDistinctJlptLevels = async (publishedOnly = true) => {
	const filter = publishedOnly ? { isPublished: true } : {};
	const levels = await KaiwaContext.distinct('jlpt', filter);
	return JLPT_ORDER.filter((lv) => levels.includes(lv));
};
