import { EXAM_PAPER } from '../constants/messages.js';
import {
	EXAM_JLPT_LEVELS,
	EXAM_SESSIONS,
	EXAM_SOURCE_TYPES,
} from '../constants/examPaper.js';
import * as examPaperRepository from '../repositories/examPaperRepository.js';
import * as examStructureService from './examStructureService.js';
import { deleteByUrl } from './objectStorageService.js';
import { mergePaperSectionsWithFrame } from '../utils/examStructureHelpers.js';
import {
	mergeSectionsWithDefaultFrame,
	parseExamSectionsImport,
} from '../utils/examPaperImport.js';
import {
	buildExamPaperDefaultTitleJa,
	buildExamPaperDefaultTitleVi,
	buildExamPaperSlug,
	countExamQuestions,
} from '../utils/examPaperHelpers.js';
import {
	normalizeReadingSectionForStorage,
	prepareListeningSectionForStorage,
} from '../utils/examReadingPassages.js';
import { migrateListeningAudioToPaper } from '../utils/examListeningHelpers.js';

/** @param {string | null | undefined} thumbnailUrl */
async function deleteStoredExamPaperThumbnail(thumbnailUrl) {
	await deleteByUrl(thumbnailUrl);
}

/**
 * @param {Record<string, unknown>} payload
 */
function normalizePayload(payload = {}) {
	const jlpt = EXAM_JLPT_LEVELS.includes(String(payload.jlpt).toUpperCase())
		? String(payload.jlpt).toUpperCase()
		: 'N3';
	const year = parseInt(String(payload.year), 10);
	const session = EXAM_SESSIONS.includes(payload.session)
		? payload.session
		: 'july';

	const sections = Array.isArray(payload.sections) ? payload.sections : [];
	const questionCount = countExamQuestions(sections);

	return {
		titleVi:
			String(payload.titleVi ?? '').trim() ||
			buildExamPaperDefaultTitleVi(jlpt, year, session),
		titleJa:
			String(payload.titleJa ?? '').trim() ||
			buildExamPaperDefaultTitleJa(jlpt, year, session),
		year,
		session,
		jlpt,
		slug: String(payload.slug ?? '').trim() || buildExamPaperSlug(jlpt, year, session),
		descriptionVi: String(payload.descriptionVi ?? '').trim(),
		descriptionJa: String(payload.descriptionJa ?? '').trim(),
		durationMinutes: Math.max(0, parseInt(String(payload.durationMinutes ?? 0), 10) || 0),
		sections,
		questionCount,
		sourceType: EXAM_SOURCE_TYPES.includes(payload.sourceType)
			? payload.sourceType
			: 'past_exam',
		sourceNote: String(payload.sourceNote ?? '').trim(),
		thumbnailUrl: String(payload.thumbnailUrl ?? '').trim(),
		listeningAudioUrl: String(payload.listeningAudioUrl ?? '').trim(),
		isPublished: Boolean(payload.isPublished),
		displayOrder: Math.max(0, parseInt(String(payload.displayOrder ?? 0), 10) || 0),
	};
}

export const listAdminExamPapers = async (query = {}) => {
	const { jlpt, year, session, q, isPublished, page, limit } = query;
	const filters = {
		jlpt:
			jlpt && EXAM_JLPT_LEVELS.includes(String(jlpt).toUpperCase())
				? String(jlpt).toUpperCase()
				: undefined,
		year,
		session: session && EXAM_SESSIONS.includes(session) ? session : undefined,
		q,
	};
	if (isPublished === 'true') filters.isPublished = true;
	if (isPublished === 'false') filters.isPublished = false;

	const result = await examPaperRepository.findExamPapersPaginated(filters, {
		page,
		limit,
	});

	return {
		...result,
		years: await examPaperRepository.findDistinctYears(),
		messageCode: EXAM_PAPER.LIST_FETCHED,
	};
};

export const getExamPaperById = async (id) => {
	const paper = await examPaperRepository.findExamPaperById(id);
	if (!paper) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}
	return paper;
};

/** Áp khung blueprint DB lên sections của đề (editor admin) */
async function applyBlueprintToPaper(paper) {
	if (!paper) return paper;
	const frame = await examStructureService.buildDefaultExamSections(paper.jlpt);
	return {
		...(paper.toObject?.() ?? paper),
		sections: mergePaperSectionsWithFrame(paper.sections, frame),
	};
};

export const getExamPaperForEditor = async (id) => {
	let paper = await getExamPaperById(id);
	if (!Array.isArray(paper.sections) || paper.sections.length === 0) {
		paper = await initExamPaperSections(id);
	}
	const structureMeta = await examStructureService.getExamStructureMeta(paper.jlpt);
	const merged = await applyBlueprintToPaper(paper);
	return { paper: merged, structureMeta };
};

export const createExamPaper = async (payload) => {
	const data = normalizePayload(payload);
	if (!data.sections.length) {
		data.sections = await examStructureService.buildDefaultExamSections(data.jlpt);
		data.questionCount = 0;
	}
	const existing = await examPaperRepository.findExamPaperByUniqueKey({
		jlpt: data.jlpt,
		year: data.year,
		session: data.session,
	});
	if (existing) {
		throw { messageCode: EXAM_PAPER.DUPLICATE, statusCode: 409 };
	}
	return examPaperRepository.createExamPaper(data);
};

export const updateExamPaper = async (id, payload) => {
	const current = await examPaperRepository.findExamPaperById(id);
	if (!current) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}

	const merged = {
		titleVi: payload.titleVi ?? current.titleVi,
		titleJa: payload.titleJa ?? current.titleJa,
		year: payload.year ?? current.year,
		session: payload.session ?? current.session,
		jlpt: payload.jlpt ?? current.jlpt,
		slug: payload.slug ?? current.slug,
		descriptionVi: payload.descriptionVi ?? current.descriptionVi,
		descriptionJa: payload.descriptionJa ?? current.descriptionJa,
		durationMinutes: payload.durationMinutes ?? current.durationMinutes,
		sections: payload.sections ?? current.sections,
		sourceType: payload.sourceType ?? current.sourceType,
		sourceNote: payload.sourceNote ?? current.sourceNote,
		thumbnailUrl: payload.thumbnailUrl ?? current.thumbnailUrl,
		listeningAudioUrl: payload.listeningAudioUrl ?? current.listeningAudioUrl,
		isPublished: payload.isPublished ?? current.isPublished,
		displayOrder: payload.displayOrder ?? current.displayOrder,
	};
	const data = normalizePayload(merged);

	if (
		payload.thumbnailUrl !== undefined &&
		String(data.thumbnailUrl).trim() !== String(current.thumbnailUrl || '').trim()
	) {
		await deleteStoredExamPaperThumbnail(current.thumbnailUrl);
	}

	if (
		data.jlpt !== current.jlpt ||
		data.year !== current.year ||
		data.session !== current.session
	) {
		const conflict = await examPaperRepository.findExamPaperByUniqueKey({
			jlpt: data.jlpt,
			year: data.year,
			session: data.session,
		});
		if (conflict && String(conflict._id) !== String(id)) {
			throw { messageCode: EXAM_PAPER.DUPLICATE, statusCode: 409 };
		}
	}

	const updated = await examPaperRepository.updateExamPaper(id, data);
	if (!updated) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}
	return updated;
};

export const deleteExamPaper = async (id) => {
	const current = await examPaperRepository.findExamPaperById(id);
	if (!current) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}
	await deleteStoredExamPaperThumbnail(current.thumbnailUrl);
	const deleted = await examPaperRepository.deleteExamPaper(id);
	if (!deleted) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}
	return deleted;
};

export const getExamSectionsTemplate = async (jlpt = 'N3') =>
	examStructureService.getExamSectionsTemplatePayload(jlpt);

export const initExamPaperSections = async (id) => {
	const paper = await examPaperRepository.findExamPaperById(id);
	if (!paper) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}
	const sections = await examStructureService.buildDefaultExamSections(paper.jlpt);
	const updated = await examPaperRepository.updateExamPaper(id, {
		sections,
		questionCount: 0,
	});
	return applyBlueprintToPaper(updated);
};

export const updateExamPaperSections = async (id, sections) => {
	const paper = await examPaperRepository.findExamPaperById(id);
	if (!paper) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}
	const frame = await examStructureService.buildDefaultExamSections(paper.jlpt);
	const normalizedInput = (sections ?? []).map((s) =>
		s.sectionType === 'reading'
			? normalizeReadingSectionForStorage(s)
			: s.sectionType === 'listening'
				? prepareListeningSectionForStorage(s)
				: s,
	);
	const merged = mergePaperSectionsWithFrame(normalizedInput, frame);
	const questionCount = countExamQuestions(merged);
	const listeningAudioUrl = migrateListeningAudioToPaper(paper, merged);
	const updated = await examPaperRepository.updateExamPaper(id, {
		sections: merged,
		questionCount,
		...(listeningAudioUrl && !String(paper.listeningAudioUrl ?? '').trim()
			? { listeningAudioUrl }
			: {}),
	});
	if (!updated) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}
	return applyBlueprintToPaper(updated);
};

/**
 * @param {string} id
 * @param {{ version?: number, sections?: unknown[], merge?: boolean }} payload
 */
export const importExamPaperSections = async (id, payload) => {
	const paper = await examPaperRepository.findExamPaperById(id);
	if (!paper) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}

	const parsed = parseExamSectionsImport(payload);
	if (!parsed.ok) {
		throw {
			messageCode: EXAM_PAPER.IMPORT_INVALID,
			statusCode: 400,
			errors: parsed.errors,
		};
	}

	const merge = Boolean(payload.merge);
	const sections = merge
		? await mergeSectionsWithDefaultFrame(parsed.sections, paper.jlpt)
		: parsed.sections;

	const questionCount = countExamQuestions(sections);
	const updated = await examPaperRepository.updateExamPaper(id, {
		sections,
		questionCount,
	});
	if (!updated) {
		throw { messageCode: EXAM_PAPER.NOT_FOUND, statusCode: 404 };
	}
	return applyBlueprintToPaper(updated);
};

export const ensureExamPaperSections = async (id) => {
	const paper = await getExamPaperById(id);
	if (Array.isArray(paper.sections) && paper.sections.length > 0) {
		return paper;
	}
	return initExamPaperSections(id);
};
