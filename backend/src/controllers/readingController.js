import fs from 'fs';
import asyncHandler from 'express-async-handler';
import * as readingService from '../services/readingService.js';
import { apiSuccess, apiPaginated, apiError } from '../utils/response.js';
import { READING, COMMON } from '../constants/messages.js';
import {
	annotateWithJlptLock,
	assertJlptUnlocked,
	buildJlptAccessMeta,
	isJlptUnlocked,
} from '../utils/jlptAccess.js';

export const listPublishedArticles = asyncHandler(async (req, res) => {
	const unlocked = req.jlptUnlocked ?? [];
	const queryJlpt = req.query.jlpt;

	if (queryJlpt && !isJlptUnlocked(unlocked, queryJlpt)) {
		const jlptLevels = await readingService.getDistinctJlptLevels(true);
		return apiPaginated(
			res,
			{
				items: [],
				jlptLevels,
				jlptAccess: buildJlptAccessMeta(unlocked),
				requestedJlptLocked: true,
			},
			{ page: 1, limit: 10, total: 0, pages: 0 },
			READING.LIST_FETCHED,
			200,
		);
	}

	const result = await readingService.listPublishedArticles(req.user._id, req.query);
	const { items, pagination, jlptLevels, messageCode } = result;
	const annotated = annotateWithJlptLock(items, unlocked, (it) => it.jlpt);

	return apiPaginated(
		res,
		{
			items: annotated,
			jlptLevels,
			jlptAccess: buildJlptAccessMeta(unlocked),
		},
		pagination,
		messageCode,
		200,
	);
});

export const getReadingSummary = asyncHandler(async (req, res) => {
	const summary = await readingService.getReadingSummary(req.user._id);
	const { messageCode, ...data } = summary;
	return apiSuccess(res, data, messageCode, 200);
});

export const getPublishedArticleBySlug = asyncHandler(async (req, res) => {
	const { article, messageCode } = await readingService.getPublishedArticleBySlug(
		req.user._id,
		req.params.slug,
	);
	assertJlptUnlocked(req.jlptUnlocked, article.jlpt);
	return apiSuccess(
		res,
		{ article, jlptAccess: buildJlptAccessMeta(req.jlptUnlocked) },
		messageCode,
		200,
	);
});

export const saveArticleProgress = asyncHandler(async (req, res) => {
	const { article } = await readingService.getPublishedArticleBySlug(
		req.user._id,
		req.params.slug,
	);
	assertJlptUnlocked(req.jlptUnlocked, article.jlpt);
	const { progress, messageCode } = await readingService.saveArticleProgress(
		req.user._id,
		req.params.slug,
		req.body,
	);
	return apiSuccess(res, { progress }, messageCode, 200);
});

export const listAdminArticles = asyncHandler(async (req, res) => {
	const result = await readingService.listAdminArticles(req.query);
	const { items, pagination, messageCode } = result;
	return apiPaginated(res, { items }, pagination, messageCode, 200);
});

export const getAdminArticleById = asyncHandler(async (req, res) => {
	const article = await readingService.getArticleById(req.params.id);
	return apiSuccess(res, { article }, READING.FETCHED, 200);
});

export const createArticle = asyncHandler(async (req, res) => {
	const article = await readingService.createArticle(req.body);
	return apiSuccess(res, { article }, READING.CREATED, 201);
});

export const updateArticle = asyncHandler(async (req, res) => {
	const article = await readingService.updateArticle(req.params.id, req.body);
	return apiSuccess(res, { article }, READING.UPDATED, 200);
});

export const deleteArticle = asyncHandler(async (req, res) => {
	await readingService.deleteArticle(req.params.id);
	return apiSuccess(res, null, READING.DELETED, 200);
});

/** Upload ảnh bìa trước khi tạo bài (chưa có id) */
export const uploadReadingCoverDraft = asyncHandler(async (req, res) => {
	if (!req.file) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'cover', message: 'Image file is required' },
		]);
	}
	return apiSuccess(res, { imageUrl: req.file.publicPath }, READING.COVER_UPLOADED, 200);
});

/** Upload và gán ảnh bìa cho bài đã tồn tại */
export const uploadArticleCover = asyncHandler(async (req, res) => {
	if (!req.file) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'cover', message: 'Image file is required' },
		]);
	}
	const publicPath = req.file.publicPath;
	try {
		const article = await readingService.setArticleCoverFromUpload(
			req.params.id,
			publicPath,
		);
		return apiSuccess(res, { article, imageUrl: publicPath }, READING.COVER_UPLOADED, 200);
	} catch (err) {
		await fs.unlink(req.file.path).catch(() => {});
		throw err;
	}
});
