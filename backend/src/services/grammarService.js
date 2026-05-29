import * as grammarRepository from '../repositories/grammarRepository.js';
import { GRAMMAR, COMMON } from '../constants/messages.js';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';

const normalizeSlug = (slug) =>
	String(slug || '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');

export const listPublishedGrammars = async (query = {}) => {
	const { jlpt, tag, q, page, limit } = query;
	const jlptFilter =
		jlpt && GRAMMAR_JLPT_LEVELS.includes(jlpt) ? jlpt : undefined;

	const scopeFilters = {
		jlpt: jlptFilter,
		q,
		isPublished: true,
	};

	const [result, tagFacet] = await Promise.all([
		grammarRepository.findGrammarsPaginated(
			{
				...scopeFilters,
				tag: tag || undefined,
			},
			{ page, limit },
		),
		grammarRepository.findTagFacetForScope(scopeFilters),
	]);

	return {
		...result,
		availableTagIds: tagFacet.availableTagIds,
		tagCounts: tagFacet.tagCounts,
		messageCode: GRAMMAR.LIST_FETCHED,
	};
};

export const listAdminGrammars = async (query = {}) => {
	const { jlpt, tag, q, isPublished, page, limit } = query;
	const filters = {
		jlpt: jlpt && GRAMMAR_JLPT_LEVELS.includes(jlpt) ? jlpt : undefined,
		tag: tag || undefined,
		q,
	};
	if (isPublished === 'true') filters.isPublished = true;
	if (isPublished === 'false') filters.isPublished = false;

	const result = await grammarRepository.findGrammarsPaginated(filters, {
		page,
		limit,
	});

	return {
		...result,
		messageCode: GRAMMAR.LIST_FETCHED,
	};
};

export const getPublishedGrammarBySlug = async (slug) => {
	const grammar = await grammarRepository.findGrammarBySlug(slug, {
		publishedOnly: true,
	});
	if (!grammar) {
		throw { messageCode: GRAMMAR.NOT_FOUND, statusCode: 404 };
	}
	return grammar;
};

export const getGrammarById = async (id) => {
	const grammar = await grammarRepository.findGrammarById(id);
	if (!grammar) {
		throw { messageCode: GRAMMAR.NOT_FOUND, statusCode: 404 };
	}
	return grammar;
};

export const getDistinctJlptLevels = async (publishedOnly = true) => {
	const levels = await grammarRepository.findDistinctJlptLevels(publishedOnly);
	const order = GRAMMAR_JLPT_LEVELS;
	return order.filter((lv) => levels.includes(lv));
};

export const createGrammar = async (payload) => {
	const slug = normalizeSlug(payload.slug);
	if (!slug) {
		throw { messageCode: COMMON.BAD_REQUEST, statusCode: 400 };
	}
	const existing = await grammarRepository.findGrammarBySlug(slug);
	if (existing) {
		throw { messageCode: GRAMMAR.SLUG_EXISTS, statusCode: 409 };
	}
	const grammar = await grammarRepository.createGrammar({
		...payload,
		slug,
	});
	return grammar;
};

export const updateGrammar = async (id, payload) => {
	const current = await grammarRepository.findGrammarById(id);
	if (!current) {
		throw { messageCode: GRAMMAR.NOT_FOUND, statusCode: 404 };
	}

	const next = { ...payload };
	if (payload.slug !== undefined) {
		const slug = normalizeSlug(payload.slug);
		if (!slug) {
			throw { messageCode: COMMON.BAD_REQUEST, statusCode: 400 };
		}
		const dup = await grammarRepository.findGrammarBySlugExcludingId(
			slug,
			id,
		);
		if (dup) {
			throw { messageCode: GRAMMAR.SLUG_EXISTS, statusCode: 409 };
		}
		next.slug = slug;
	}

	const grammar = await grammarRepository.updateGrammar(id, next);
	if (!grammar) {
		throw { messageCode: GRAMMAR.NOT_FOUND, statusCode: 404 };
	}
	return grammar;
};

export const deleteGrammar = async (id) => {
	const grammar = await grammarRepository.deleteGrammar(id);
	if (!grammar) {
		throw { messageCode: GRAMMAR.NOT_FOUND, statusCode: 404 };
	}
	return grammar;
};
