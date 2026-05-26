import {
	FEEDBACK_DAILY_LIMIT,
	FEEDBACK_STATUS,
	FEEDBACK_MAX_ATTACHMENTS,
} from '../constants/feedback.js';
import { FEEDBACK } from '../constants/messages.js';
import { parseObjectKey } from './objectStorageService.js';
import * as feedbackRepository from '../repositories/feedbackRepository.js';

function startOfUtcDay() {
	const d = new Date();
	d.setUTCHours(0, 0, 0, 0);
	return d;
}

/**
 * Chỉ chấp nhận URL do chính user upload (prefix folder feedback/{userId}/).
 */
function normalizeAndAssertAttachments(userId, raw = []) {
	if (!raw?.length) return [];
	const uid = String(userId);
	const prefix = `feedback/${uid}/`;
	const seen = new Set();

	const next = [];
	for (const row of raw) {
		const url = String(row.url || '').trim();
		if (!url) continue;
		if (seen.has(url)) continue;
		seen.add(url);

		const key = parseObjectKey(url);
		if (!key || !key.startsWith(prefix)) {
			throw { messageCode: FEEDBACK.INVALID_ATTACHMENT, statusCode: 400 };
		}

		const kind = row.kind === 'video' ? 'video' : 'image';
		next.push({ url, kind });

		if (next.length > FEEDBACK_MAX_ATTACHMENTS) {
			throw { messageCode: FEEDBACK.INVALID_ATTACHMENT, statusCode: 400 };
		}
	}

	return next;
}

export const submitFeedback = async (userId, payload) => {
	const since = startOfUtcDay();
	const count = await feedbackRepository.countUserFeedbackSince(userId, since);
	if (count >= FEEDBACK_DAILY_LIMIT) {
		throw { messageCode: FEEDBACK.RATE_LIMIT, statusCode: 429 };
	}

	const attachments = normalizeAndAssertAttachments(userId, payload.attachments);

	const feedback = await feedbackRepository.createFeedback({
		userId,
		category: payload.category,
		message: payload.message.trim(),
		pageUrl: payload.pageUrl?.trim() || '',
		locale: payload.locale?.trim() || '',
		userAgent: payload.userAgent?.trim() || '',
		appVersion: payload.appVersion?.trim() || '',
		status: FEEDBACK_STATUS.OPEN,
		attachments,
	});

	return feedback;
};

export const getMyFeedbacks = async (userId, query = {}) => {
	return feedbackRepository.listFeedbackByUserId(userId, query);
};

export const listFeedbacksAdmin = async (filters) => {
	return feedbackRepository.listFeedbackAdmin(filters);
};

export const updateFeedbackStatusAdmin = async (id, { status, adminNote }) => {
	const updated = await feedbackRepository.updateFeedbackStatus(id, {
		status,
		adminNote,
	});
	if (!updated) {
		throw { messageCode: FEEDBACK.NOT_FOUND, statusCode: 404 };
	}
	return updated;
};
