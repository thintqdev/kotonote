import AppError from '../utils/AppError.js';
import { KAIWA } from '../constants/messages.js';
import {
	KAIWA_CATEGORIES,
	KAIWA_JLPT_LEVELS,
} from '../constants/kaiwa.js';
import * as kaiwaContextRepository from '../repositories/kaiwaContextRepository.js';

export const listAdminContexts = async (query = {}) => {
	const { jlpt, category, q, isPublished, page, limit } = query;
	const filters = {
		jlpt:
			jlpt && KAIWA_JLPT_LEVELS.includes(String(jlpt).toUpperCase())
				? String(jlpt).toUpperCase()
				: undefined,
		category:
			category && KAIWA_CATEGORIES.includes(category) ? category : undefined,
		q,
	};
	if (isPublished === 'true') filters.isPublished = true;
	if (isPublished === 'false') filters.isPublished = false;

	const result = await kaiwaContextRepository.findContextsPaginated(filters, {
		page,
		limit,
	});

	return {
		...result,
		messageCode: KAIWA.LIST_FETCHED,
	};
};

export const getContextById = async (id) => {
	const ctx = await kaiwaContextRepository.findContextById(id);
	if (!ctx) {
		throw new AppError(KAIWA.NOT_FOUND, 404);
	}
	return ctx;
};

export const createContext = async (payload) => {
	return kaiwaContextRepository.createContext(payload);
};

export const updateContext = async (id, payload) => {
	const updated = await kaiwaContextRepository.updateContext(id, payload);
	if (!updated) {
		throw new AppError(KAIWA.NOT_FOUND, 404);
	}
	return updated;
};

export const deleteContext = async (id) => {
	const deleted = await kaiwaContextRepository.deleteContext(id);
	if (!deleted) {
		throw new AppError(KAIWA.NOT_FOUND, 404);
	}
	return deleted;
};

export const getDistinctJlptLevels = async (publishedOnly = true) =>
	kaiwaContextRepository.findDistinctJlptLevels(publishedOnly);

/** Danh sách bối cảnh đã xuất bản (user). */
export const listPublishedContexts = async (query = {}) => {
	const { jlpt, category, q, page, limit } = query;
	const filters = {
		isPublished: true,
		jlpt:
			jlpt && KAIWA_JLPT_LEVELS.includes(String(jlpt).toUpperCase())
				? String(jlpt).toUpperCase()
				: undefined,
		category:
			category && KAIWA_CATEGORIES.includes(category) ? category : undefined,
		q,
	};

	const result = await kaiwaContextRepository.findContextsPaginated(filters, {
		page,
		limit,
	});

	return {
		...result,
		jlptLevels: await kaiwaContextRepository.findDistinctJlptLevels(true),
		messageCode: KAIWA.LIST_FETCHED,
	};
};

/** Chi tiết bối cảnh đã xuất bản (user). */
export const getPublishedContextById = async (id) => {
	const ctx = await kaiwaContextRepository.findContextById(id);
	if (!ctx || !ctx.isPublished) {
		throw new AppError(KAIWA.NOT_FOUND, 404);
	}
	return ctx;
};
