import * as specialtyRepository from '../repositories/sentenceSpecialtyRepository.js';
import * as templateRepository from '../repositories/sentenceTemplateRepository.js';
import * as progressRepository from '../repositories/sentenceTemplateProgressRepository.js';
import { SENTENCE, SENTENCE_TEMPLATE } from '../constants/messages.js';
import {
	SENTENCE_REVIEW_INTERVALS_DAYS,
} from '../constants/sentenceTemplate.js';

function validateClozePart(sentenceJa, clozePart) {
	if (!sentenceJa.includes(clozePart)) {
		throw {
			messageCode: SENTENCE_TEMPLATE.INVALID_CLOZE,
			statusCode: 400,
		};
	}
}

function buildClozeSentence(sentenceJa, clozePart) {
	const idx = sentenceJa.indexOf(clozePart);
	if (idx === -1) return { clozeJa: sentenceJa, clozePrefix: '', clozeSuffix: '' };
	return {
		clozeJa: sentenceJa.replace(clozePart, '＿＿＿＿'),
		clozePrefix: sentenceJa.slice(0, idx),
		clozeSuffix: sentenceJa.slice(idx + clozePart.length),
	};
}

function attachProgressToTemplates(templates, progressList) {
	const progressMap = new Map(
		progressList.map((p) => [String(p.templateId), p]),
	);
	return templates.map((tpl) => {
		const progress = progressMap.get(String(tpl._id)) ?? null;
		return {
			...tpl,
			progress: progress
				? {
						status: progress.status,
						flashSeenCount: progress.flashSeenCount,
						quizCorrectCount: progress.quizCorrectCount,
						quizWrongCount: progress.quizWrongCount,
						lastStudiedAt: progress.lastStudiedAt,
						nextReviewAt: progress.nextReviewAt,
						masteredAt: progress.masteredAt,
					}
				: { status: 'not_started' },
		};
	});
}

function computeNextReviewAt(reviewLevel) {
	const days =
		SENTENCE_REVIEW_INTERVALS_DAYS[
			Math.min(reviewLevel, SENTENCE_REVIEW_INTERVALS_DAYS.length - 1)
		] ?? 7;
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d;
}

// ─── Public (user) ───────────────────────────────────────────────

export const listActiveSpecialties = async () => {
	const specialties = await specialtyRepository.findActiveSpecialties();
	const enriched = await Promise.all(
		specialties.map(async (sp) => {
			const count = await templateRepository.countTemplatesBySpecialty(sp._id);
			return { ...sp, templateCount: count };
		}),
	);
	return enriched;
};

export const getSpecialtyStudyPack = async (specialtyCode, userId) => {
	const specialty = await specialtyRepository.findSpecialtyByCode(specialtyCode);
	if (!specialty || !specialty.isActive) {
		throw { messageCode: SENTENCE.SPECIALTY_NOT_FOUND, statusCode: 404 };
	}

	const templates = await templateRepository.findTemplatesBySpecialtyId(
		specialty._id,
		{ activeOnly: true },
	);

	const templateIds = templates.map((t) => t._id);
	const progressList = userId
		? await progressRepository.findProgressByUserAndTemplates(userId, templateIds)
		: [];

	const items = attachProgressToTemplates(templates, progressList).map((tpl) => ({
		...tpl,
		...buildClozeSentence(tpl.sentenceJa, tpl.clozePart),
	}));

	const mastered = items.filter((i) => i.progress?.status === 'mastered').length;
	const reviewDue = items.filter(
		(i) =>
			i.progress?.status === 'review' &&
			i.progress?.nextReviewAt &&
			new Date(i.progress.nextReviewAt) <= new Date(),
	).length;

	return {
		specialty,
		templates: items,
		stats: {
			total: items.length,
			mastered,
			reviewDue,
		},
	};
};

export const getTemplateForStudy = async (templateId, userId) => {
	const template = await templateRepository.findTemplateById(templateId);
	if (!template || !template.isActive) {
		throw { messageCode: SENTENCE.TEMPLATE_NOT_FOUND, statusCode: 404 };
	}

	const progress = userId
		? await progressRepository.findProgressByUserAndTemplate(userId, templateId)
		: null;

	return {
		...template,
		...buildClozeSentence(template.sentenceJa, template.clozePart),
		progress: progress ?? { status: 'not_started' },
	};
};

export const recordProgress = async (userId, templateId, action) => {
	const template = await templateRepository.findTemplateById(templateId);
	if (!template || !template.isActive) {
		throw { messageCode: SENTENCE.TEMPLATE_NOT_FOUND, statusCode: 404 };
	}

	const existing = await progressRepository.findProgressByUserAndTemplate(
		userId,
		templateId,
	);

	const now = new Date();
	const update = {
		lastStudiedAt: now,
	};

	if (action === 'flash_seen') {
		update.flashSeenCount = (existing?.flashSeenCount ?? 0) + 1;
		if (!existing || existing.status === 'not_started') {
			update.status = 'learning';
		}
	} else if (action === 'quiz_correct') {
		update.quizCorrectCount = (existing?.quizCorrectCount ?? 0) + 1;
		update.status = 'learning';
		const correct = update.quizCorrectCount;
		if (correct >= 2 && (existing?.flashSeenCount ?? 0) >= 1) {
			update.status = 'mastered';
			update.masteredAt = now;
			update.reviewLevel = 0;
			update.nextReviewAt = computeNextReviewAt(0);
		}
	} else if (action === 'quiz_wrong') {
		update.quizWrongCount = (existing?.quizWrongCount ?? 0) + 1;
		update.status = 'learning';
	} else if (action === 'mark_mastered') {
		update.status = 'mastered';
		update.masteredAt = now;
		update.reviewLevel = 0;
		update.nextReviewAt = computeNextReviewAt(0);
	} else if (action === 'mark_review') {
		const nextLevel = Math.min(
			(existing?.reviewLevel ?? 0) + 1,
			SENTENCE_REVIEW_INTERVALS_DAYS.length - 1,
		);
		update.status = 'review';
		update.reviewLevel = nextLevel;
		update.nextReviewAt = computeNextReviewAt(nextLevel);
	}

	return progressRepository.upsertProgress(userId, templateId, update);
};

export const buildQuizForSpecialty = async (specialtyCode, userId, { count = 5 } = {}) => {
	const pack = await getSpecialtyStudyPack(specialtyCode, userId);
	const pool = pack.templates;
	if (!pool.length) {
		throw { messageCode: SENTENCE.NO_TEMPLATES, statusCode: 404 };
	}

	const shuffled = [...pool].sort(() => Math.random() - 0.5);
	const selected = shuffled.slice(0, Math.min(count, pool.length));

	const questions = selected.map((tpl) => {
		const distractors = pool
			.filter((other) => String(other._id) !== String(tpl._id))
			.sort(() => Math.random() - 0.5)
			.slice(0, 3)
			.map((d) => d.clozePart);

		while (distractors.length < 3) {
			distractors.push('よろしくお願いします');
		}

		const choices = [tpl.clozePart, ...distractors].sort(
			() => Math.random() - 0.5,
		);

		return {
			templateId: tpl._id,
			situationVi: tpl.situationVi,
			situationJa: tpl.situationJa,
			clozeJa: tpl.clozeJa,
			choices,
			correctIndex: choices.indexOf(tpl.clozePart),
		};
	});

	return { specialty: pack.specialty, questions };
};

// ─── Admin ───────────────────────────────────────────────────────

export const adminListSpecialties = async (filters = {}) =>
	specialtyRepository.findAllSpecialties(filters);

export const adminGetSpecialty = async (id) => {
	const specialty = await specialtyRepository.findSpecialtyById(id);
	if (!specialty) {
		throw { messageCode: SENTENCE.SPECIALTY_NOT_FOUND, statusCode: 404 };
	}
	return specialty;
};

export const adminCreateSpecialty = async (data) => {
	const code = String(data.code).trim().toLowerCase();
	const existing = await specialtyRepository.findSpecialtyByCode(code);
	if (existing) {
		throw { messageCode: SENTENCE.SPECIALTY_EXISTS, statusCode: 409 };
	}
	return specialtyRepository.createSpecialty({ ...data, code });
};

export const adminUpdateSpecialty = async (id, data) => {
	if (data.code) {
		data.code = String(data.code).trim().toLowerCase();
	}
	const specialty = await specialtyRepository.updateSpecialty(id, data);
	if (!specialty) {
		throw { messageCode: SENTENCE.SPECIALTY_NOT_FOUND, statusCode: 404 };
	}
	return specialty;
};

export const adminDeleteSpecialty = async (id) => {
	const specialty = await specialtyRepository.findSpecialtyById(id);
	if (!specialty) {
		throw { messageCode: SENTENCE.SPECIALTY_NOT_FOUND, statusCode: 404 };
	}
	const templates = await templateRepository.findAllTemplates({ specialtyId: id });
	const templateIds = templates.map((t) => t._id);
	await progressRepository.deleteProgressBySpecialtyTemplates(templateIds);
	for (const tpl of templates) {
		await templateRepository.deleteTemplate(tpl._id);
	}
	await specialtyRepository.deleteSpecialty(id);
};

export const adminListTemplates = async (filters = {}) =>
	templateRepository.findAllTemplates(filters);

export const adminGetTemplate = async (id) => {
	const template = await templateRepository.findTemplateById(id);
	if (!template) {
		throw { messageCode: SENTENCE.TEMPLATE_NOT_FOUND, statusCode: 404 };
	}
	return template;
};

export const adminCreateTemplate = async (data) => {
	validateClozePart(data.sentenceJa, data.clozePart);
	const code = String(data.code).trim().toLowerCase();
	return templateRepository.createTemplate({ ...data, code });
};

export const adminUpdateTemplate = async (id, data) => {
	if (data.code) data.code = String(data.code).trim().toLowerCase();
	const existing = await templateRepository.findTemplateById(id);
	if (!existing) {
		throw { messageCode: SENTENCE.TEMPLATE_NOT_FOUND, statusCode: 404 };
	}
	const sentenceJa = data.sentenceJa ?? existing.sentenceJa;
	const clozePart = data.clozePart ?? existing.clozePart;
	validateClozePart(sentenceJa, clozePart);
	return templateRepository.updateTemplate(id, data);
};

export const adminDeleteTemplate = async (id) => {
	const template = await templateRepository.deleteTemplate(id);
	if (!template) {
		throw { messageCode: SENTENCE.TEMPLATE_NOT_FOUND, statusCode: 404 };
	}
	await progressRepository.deleteProgressByTemplate(id);
};

export { buildClozeSentence, validateClozePart };
