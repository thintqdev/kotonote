import { EXAM_PAPERS } from '../constants/apiEndpoints.js';
import api from './api.js';

/**
 * @param {{ jlpt?: string, year?: number, session?: string, page?: number, limit?: number }} [params]
 */
export async function listExamPapers(params = {}) {
	const body = await api.get(EXAM_PAPERS.BASE, { params });
	return {
		items: body.data?.items ?? [],
		jlptLevels: body.data?.jlptLevels ?? [],
		requestedJlptLocked: Boolean(body.data?.requestedJlptLocked),
		pagination: body.pagination ?? null,
	};
}

export async function getExamPaper(slug) {
	const body = await api.get(EXAM_PAPERS.bySlug(slug));
	return body.data?.paper ?? null;
}

/**
 * @param {string} slug
 * @param {Record<string, number>} answers
 */
export async function submitExamPaper(slug, answers) {
	const body = await api.post(EXAM_PAPERS.submit(slug), { answers });
	return {
		result: body.data?.result ?? null,
		attemptId: body.data?.attemptId ?? null,
	};
}

export async function listExamPaperAttempts(params = {}) {
	const body = await api.get(EXAM_PAPERS.history, { params });
	return {
		items: body.data?.items ?? [],
		pagination: body.pagination ?? null,
	};
}

export async function getExamPaperAttempt(attemptId) {
	const body = await api.get(EXAM_PAPERS.historyById(attemptId));
	return {
		attempt: body.data?.attempt ?? null,
		result: body.data?.result ?? null,
		paper: body.data?.paper ?? null,
	};
}

export async function reviewExamPaperAttempt(attemptId) {
	const body = await api.post(EXAM_PAPERS.historyReview(attemptId), {});
	return {
		attempt: body.data?.attempt ?? null,
		result: body.data?.result ?? null,
		paper: body.data?.paper ?? null,
	};
}

/**
 * @param {string} slug
 * @param {Record<string, number>} answers
 */
export async function reviewExamPaper(slug, answers) {
	const body = await api.post(EXAM_PAPERS.review(slug), { answers });
	return {
		result: body.data?.result ?? null,
		paper: body.data?.paper ?? null,
	};
}
