import { EXAM_PAPER } from '../constants/messages.js';
import * as examPaperRepository from '../repositories/examPaperRepository.js';
import * as examPaperAttemptRepository from '../repositories/examPaperAttemptRepository.js';
import {
	gradeExamAttempt,
	sanitizeExamPaperForAttempt,
	sanitizeExamResultForFree,
	toExamPaperListItem,
} from '../utils/examPaperSanitize.js';
import { annotateWithJlptLock } from '../utils/jlptAccess.js';
import { isPaidMembership } from '../utils/membershipAccess.js';

export const listPublishedExamPapers = async (query = {}, jlptUnlocked = []) => {
	const { jlpt, year, session, q, page, limit } = query;
	const result = await examPaperRepository.findExamPapersPaginated(
		{ jlpt, year, session, q, isPublished: true },
		{ page, limit },
	);
	const items = annotateWithJlptLock(
		result.items.map(toExamPaperListItem),
		jlptUnlocked,
		(it) => it.jlpt,
	);
	const jlptLevels = await examPaperRepository.findDistinctPublishedJlptLevels();

	return {
		items,
		pagination: result.pagination,
		jlptLevels,
		messageCode: EXAM_PAPER.LIST_FETCHED,
	};
};

export const getPublishedExamPaperBySlug = async (slug) => {
	const paper = await examPaperRepository.findPublishedExamPaperBySlug(slug);
	if (!paper) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}
	return {
		paper: sanitizeExamPaperForAttempt(paper),
		messageCode: EXAM_PAPER.FETCHED,
	};
};

function buildPaperSnapshot(paper) {
	return {
		titleVi: paper.titleVi ?? '',
		titleJa: paper.titleJa ?? '',
		jlpt: paper.jlpt ?? 'N5',
		year: paper.year ?? 0,
		session: paper.session ?? 'july',
		durationMinutes: paper.durationMinutes ?? 0,
		thumbnailUrl: paper.thumbnailUrl ?? '',
	};
}

function sanitizeResultForUser(result, user) {
	if (isPaidMembership(user?.membership)) return result;
	return sanitizeExamResultForFree(result);
}

export const submitPublishedExamPaper = async (slug, answers = {}, user) => {
	const paper = await examPaperRepository.findPublishedExamPaperBySlug(slug);
	if (!paper) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}
	const graded = gradeExamAttempt(paper, answers);

	const attempt = await examPaperAttemptRepository.createExamPaperAttempt(
		user._id,
		{
			examPaperId: paper._id,
			slug: paper.slug,
			paperSnapshot: buildPaperSnapshot(paper),
			answers,
			correct: graded.correct,
			total: graded.total,
			scorePercent: graded.scorePercent,
			submittedAt: new Date(),
		},
	);

	return {
		result: graded,
		attemptId: String(attempt._id),
		messageCode: EXAM_PAPER.ATTEMPT_SAVED,
	};
};

export const reviewPublishedExamPaper = async (slug, answers = {}) => {
	const paper = await examPaperRepository.findPublishedExamPaperBySlug(slug);
	if (!paper) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}
	const graded = gradeExamAttempt(paper, answers);
	return {
		result: graded,
		paper: sanitizeExamPaperForAttempt(paper),
		messageCode: EXAM_PAPER.FETCHED,
	};
};

/** @param {ReturnType<typeof gradeExamAttempt>} result @param {object | null | undefined} user */
export function sanitizeSubmitResultForUser(result, user) {
	return sanitizeResultForUser(result, user);
}

export const listUserExamPaperAttempts = async (userId, query = {}) => {
	const result = await examPaperAttemptRepository.findExamPaperAttemptsByUser(
		userId,
		query,
	);
	return {
		items: result.items,
		pagination: result.pagination,
		messageCode: EXAM_PAPER.ATTEMPTS_LISTED,
	};
};

export const getUserExamPaperAttemptById = async (attemptId, user) => {
	const attempt = await examPaperAttemptRepository.findExamPaperAttemptByIdForUser(
		attemptId,
		user._id,
	);
	if (!attempt) {
		throw { messageCode: EXAM_PAPER.ATTEMPT_NOT_FOUND, statusCode: 404 };
	}

	const paper = await examPaperRepository.findPublishedExamPaperBySlug(attempt.slug);
	if (!paper) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}

	const graded = gradeExamAttempt(paper, attempt.answers ?? {});
	const result = sanitizeResultForUser(graded, user);

	return {
		attempt: {
			_id: attempt._id,
			slug: attempt.slug,
			paperSnapshot: attempt.paperSnapshot,
			correct: attempt.correct,
			total: attempt.total,
			scorePercent: attempt.scorePercent,
			submittedAt: attempt.submittedAt,
			answers: attempt.answers ?? {},
		},
		result,
		paper: attempt.paperSnapshot,
		messageCode: EXAM_PAPER.ATTEMPT_FETCHED,
	};
};

export const reviewUserExamPaperAttempt = async (attemptId, user) => {
	const payload = await getUserExamPaperAttemptById(attemptId, user);
	const paperDoc = await examPaperRepository.findPublishedExamPaperBySlug(
		payload.attempt.slug,
	);
	if (!paperDoc) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}

	const graded = gradeExamAttempt(paperDoc, payload.attempt.answers ?? {});

	return {
		attempt: payload.attempt,
		result: graded,
		paper: sanitizeExamPaperForAttempt(paperDoc),
		messageCode: EXAM_PAPER.FETCHED,
	};
};
