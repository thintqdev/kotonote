import fs from 'fs';
import path from 'path';
import * as readingRepository from '../repositories/readingRepository.js';
import * as readingProgressRepository from '../repositories/readingProgressRepository.js';
import { READING, COMMON } from '../constants/messages.js';
import {
	READING_JLPT_LEVELS,
	READING_WEEKLY_GOAL,
} from '../constants/reading.js';
import AppError from '../utils/AppError.js';

const UPLOAD_READING_COVER_PREFIX = '/uploads/reading/';

/** @param {string | null | undefined} imageUrl */
export function deleteLocalReadingCover(imageUrl) {
	const v = String(imageUrl || '').trim();
	if (!v.startsWith(UPLOAD_READING_COVER_PREFIX)) return;
	const name = path.basename(v);
	if (!name || name.includes('..')) return;
	const fullPath = path.join(process.cwd(), 'uploads', 'reading', name);
	fs.unlink(fullPath, () => {});
}

const normalizeSlug = (slug) =>
	String(slug || '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');

const normalizeQuestions = (questions = []) =>
	questions.map((q) => {
		const n = q.choicesJa?.length ?? 0;
		const ex = q.explainPerChoice ?? { ja: [], vi: [] };
		const jaOk = ex.ja?.length === n;
		const viOk = ex.vi?.length === n;
		return {
			...q,
			explainPerChoice: {
				ja: jaOk
					? ex.ja
					: q.choicesJa.map(
							(_, i) =>
								ex.ja?.[i] ?? '（この選択肢の解説は準備中です。）',
						),
				vi: viOk
					? ex.vi
					: q.choicesJa.map(
							(_, i) =>
								ex.vi?.[i] ??
								'(Giải thích lựa chọn này đang được bổ sung.)',
						),
			},
		};
	});

const mapArticleToListItem = (article, progressMap) => {
	const progress = progressMap.get(String(article._id));
	return {
		id: article.slug,
		_id: String(article._id),
		slug: article.slug,
		jlpt: article.jlpt,
		titleJa: article.titleJa,
		snippetJa: article.snippetJa,
		wordCount: article.wordCount,
		readingMinutes: article.readingMinutes,
		rating: article.rating,
		imageUrl: article.imageUrl,
		featured: article.featured,
		status: progress?.status ?? 'not_started',
	};
};

const buildProgressMap = (rows) => {
	const map = new Map();
	for (const row of rows) {
		map.set(String(row.articleId), row);
	}
	return map;
};

export const listPublishedArticles = async (userId, query = {}) => {
	const { jlpt, mode, page, limit } = query;
	const jlptFilter =
		jlpt && READING_JLPT_LEVELS.includes(jlpt) ? jlpt : undefined;

	const filters = { isPublished: true, jlpt: jlptFilter };
	if (mode === 'suggested') filters.featured = true;

	const result = await readingRepository.findArticlesPaginated(filters, {
		page,
		limit,
	});

	let items = result.items;
	const articleIds = items.map((a) => a._id);
	const progressRows = await readingProgressRepository.findProgressByUser(
		userId,
		{ articleIds },
	);
	const progressMap = buildProgressMap(progressRows);

	if (mode === 'review') {
		items = items.filter((a) => {
			const st = progressMap.get(String(a._id))?.status;
			return st === 'in_progress' || st === 'done';
		});
	}

	return {
		items: items.map((a) => mapArticleToListItem(a, progressMap)),
		pagination: result.pagination,
		jlptLevels: await getDistinctJlptLevels(true),
		messageCode: READING.LIST_FETCHED,
	};
};

export const getReadingSummary = async (userId) => {
	const completed = await readingProgressRepository.countByUserStatus(
		userId,
		'done',
	);
	const inProgress = await readingProgressRepository.countByUserStatus(
		userId,
		'in_progress',
	);
	const done = await readingProgressRepository.countByUserStatus(
		userId,
		'done',
	);

	return {
		completed,
		goal: READING_WEEKLY_GOAL,
		reviewCount: inProgress + done,
		messageCode: READING.SUMMARY_FETCHED,
	};
};

export const getPublishedArticleBySlug = async (userId, slug) => {
	const article = await readingRepository.findArticleBySlug(slug, {
		publishedOnly: true,
	});
	if (!article) {
		throw new AppError(READING.NOT_FOUND, 404);
	}

	const progress = await readingProgressRepository.findProgressForUserArticle(
		userId,
		article._id,
	);

	return {
		article: {
			...article,
			id: article.slug,
			questions: normalizeQuestions(article.questions),
			status: progress?.status ?? 'not_started',
			questionAnswers: progress?.questionAnswers ?? [],
		},
		messageCode: READING.FETCHED,
	};
};

export const saveArticleProgress = async (userId, slug, body = {}) => {
	const article = await readingRepository.findArticleBySlug(slug, {
		publishedOnly: true,
	});
	if (!article) {
		throw new AppError(READING.NOT_FOUND, 404);
	}

	const patch = {};
	if (body.status) {
		patch.status = body.status;
	}
	if (Array.isArray(body.questionAnswers)) {
		patch.questionAnswers = body.questionAnswers;
	}
	if (body.recordAnswer) {
		const { questionIndex, choiceIndex } = body.recordAnswer;
		const existing =
			(await readingProgressRepository.findProgressForUserArticle(
				userId,
				article._id,
			)) ?? { questionAnswers: [] };
		const answers = [...(existing.questionAnswers ?? [])];
		const idx = answers.findIndex((a) => a.questionIndex === questionIndex);
		const entry = { questionIndex, choiceIndex };
		if (idx >= 0) answers[idx] = entry;
		else answers.push(entry);
		patch.questionAnswers = answers;

		const totalQ = article.questions?.length ?? 0;
		if (totalQ > 0 && answers.length >= totalQ) {
			const allAnswered = Array.from({ length: totalQ }, (_, i) =>
				answers.some((a) => a.questionIndex === i),
			).every(Boolean);
			if (allAnswered) {
				patch.status = 'done';
			} else if (!patch.status) {
				patch.status = 'in_progress';
			}
		} else if (!patch.status) {
			patch.status = 'in_progress';
		}
	}

	if (!patch.status && !patch.questionAnswers) {
		patch.status = 'in_progress';
	}

	const progress = await readingProgressRepository.upsertProgress(
		userId,
		article._id,
		patch,
	);

	return {
		progress: {
			status: progress.status,
			questionAnswers: progress.questionAnswers,
		},
		messageCode: READING.PROGRESS_SAVED,
	};
};

export const listAdminArticles = async (query = {}) => {
	const { jlpt, q, isPublished, page, limit } = query;
	const filters = {
		adminList: true,
		jlpt: jlpt && READING_JLPT_LEVELS.includes(jlpt) ? jlpt : undefined,
		q,
	};
	if (isPublished === 'true') filters.isPublished = true;
	if (isPublished === 'false') filters.isPublished = false;

	const result = await readingRepository.findArticlesPaginated(filters, {
		page,
		limit,
	});

	return {
		...result,
		messageCode: READING.LIST_FETCHED,
	};
};

export const getArticleById = async (id) => {
	const article = await readingRepository.findArticleById(id);
	if (!article) {
		throw new AppError(READING.NOT_FOUND, 404);
	}
	return article;
};

export const getDistinctJlptLevels = async (publishedOnly = true) => {
	const levels = await readingRepository.findDistinctJlptLevels(publishedOnly);
	return READING_JLPT_LEVELS.filter((lv) => levels.includes(lv));
};

export const createArticle = async (payload) => {
	const slug = normalizeSlug(payload.slug);
	if (!slug) {
		throw new AppError(COMMON.BAD_REQUEST, 400);
	}
	const existing = await readingRepository.findArticleBySlug(slug);
	if (existing) {
		throw new AppError(READING.SLUG_EXISTS, 409);
	}
	return readingRepository.createArticle({
		...payload,
		slug,
		questions: normalizeQuestions(payload.questions ?? []),
	});
};

export const updateArticle = async (id, payload) => {
	const current = await readingRepository.findArticleById(id);
	if (!current) {
		throw new AppError(READING.NOT_FOUND, 404);
	}

	const next = { ...payload };
	if (payload.slug) {
		const slug = normalizeSlug(payload.slug);
		if (!slug) {
			throw new AppError(COMMON.BAD_REQUEST, 400);
		}
		const dup = await readingRepository.findArticleBySlugExcludingId(slug, id);
		if (dup) {
			throw new AppError(READING.SLUG_EXISTS, 409);
		}
		next.slug = slug;
	}
	if (payload.questions) {
		next.questions = normalizeQuestions(payload.questions);
	}

	if (
		next.imageUrl !== undefined &&
		String(next.imageUrl).trim() !== String(current.imageUrl || '').trim()
	) {
		deleteLocalReadingCover(current.imageUrl);
	}

	const article = await readingRepository.updateArticleById(id, next);
	if (!article) {
		throw new AppError(READING.NOT_FOUND, 404);
	}
	return article;
};

/**
 * @param {string} publicPath — `/uploads/reading/...`
 */
export async function setArticleCoverFromUpload(articleId, publicPath) {
	const current = await readingRepository.findArticleById(articleId);
	if (!current) {
		throw new AppError(READING.NOT_FOUND, 404);
	}
	deleteLocalReadingCover(current.imageUrl);
	const article = await readingRepository.updateArticleById(articleId, {
		imageUrl: publicPath,
	});
	if (!article) {
		throw new AppError(READING.NOT_FOUND, 404);
	}
	return article;
}

export const deleteArticle = async (id) => {
	const article = await readingRepository.deleteArticleById(id);
	if (!article) {
		throw new AppError(READING.NOT_FOUND, 404);
	}
	deleteLocalReadingCover(article.imageUrl);
};
