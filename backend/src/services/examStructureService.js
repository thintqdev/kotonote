import { EXAM_STRUCTURE } from '../constants/messages.js';
import { EXAM_JLPT_LEVELS } from '../constants/examPaper.js';
import * as examStructureRepository from '../repositories/examStructureTemplateRepository.js';
import {
	blueprintToExamSections,
	buildSeedTemplatesFromConstants,
	inferSectionFlags,
	templateToClientMeta,
} from '../utils/examStructureHelpers.js';
import {
	EXAM_PART_META,
	EXAM_PART_TYPES_BY_SECTION,
	EXAM_SECTION_META,
	isValidPartTypeForSection,
} from '../constants/examPaperStructure.js';

/**
 * @param {Array<Record<string, unknown>>} sections
 */
function normalizeBlueprintSections(sections = []) {
	return sections.map((s, idx) => {
		const flags = inferSectionFlags(s);
		return {
			sectionType: s.sectionType,
			partType: String(s.partType ?? '').trim(),
			titleVi: String(s.titleVi ?? '').trim(),
			titleJa: String(s.titleJa ?? '').trim(),
			descriptionVi: String(s.descriptionVi ?? '').trim(),
			order: Number(s.order) >= 0 ? Number(s.order) : idx + 1,
			isEnabled: s.isEnabled !== false,
			needsPassage: s.needsPassage ?? flags.needsPassage,
			needsMedia: s.needsMedia ?? s.needsAudio ?? flags.needsMedia,
		};
	});
}

/**
 * @param {Array<Record<string, unknown>>} sections
 */
function validateBlueprintSections(sections) {
	const errors = [];
	const seen = new Set();
	for (let i = 0; i < sections.length; i += 1) {
		const s = sections[i];
		if (!s.partType) {
			errors.push(`sections[${i}]: thiếu partType`);
		}
		if (!isValidPartTypeForSection(s.sectionType, s.partType)) {
			errors.push(
				`sections[${i}]: partType "${s.partType}" không thuộc ${s.sectionType}`,
			);
		}
		const key = `${s.sectionType}:${s.partType}`;
		if (seen.has(key)) {
			errors.push(`sections[${i}]: trùng ${key}`);
		}
		seen.add(key);
	}
	return errors;
}

export const ensureDefaultTemplatesSeeded = async () => {
	const existing = await examStructureRepository.findAllTemplates();
	if (existing.length >= EXAM_JLPT_LEVELS.length) {
		return existing;
	}
	const seeds = buildSeedTemplatesFromConstants();
	const results = [];
	for (const seed of seeds) {
		const doc = await examStructureRepository.upsertTemplateByCode(seed.code, seed);
		results.push(doc);
	}
	return results;
};

export const listExamStructureTemplates = async (query = {}) => {
	await ensureDefaultTemplatesSeeded();
	const items = await examStructureRepository.findAllTemplates(query);
	return { items, messageCode: EXAM_STRUCTURE.LIST_FETCHED };
};

export const getExamStructureTemplateById = async (id) => {
	const template = await examStructureRepository.findTemplateById(id);
	if (!template) {
		throw { messageCode: EXAM_STRUCTURE.NOT_FOUND, statusCode: 404 };
	}
	return template;
};

export const getDefaultTemplateByJlpt = async (jlpt = 'N3') => {
	const level = EXAM_JLPT_LEVELS.includes(String(jlpt).toUpperCase())
		? String(jlpt).toUpperCase()
		: 'N3';
	await ensureDefaultTemplatesSeeded();
	let template = await examStructureRepository.findDefaultTemplateByJlpt(level);
	if (!template) {
		const seed = buildSeedTemplatesFromConstants().find((t) => t.jlpt === level);
		if (seed) {
			template = await examStructureRepository.upsertTemplateByCode(seed.code, seed);
		}
	}
	if (!template) {
		throw { messageCode: EXAM_STRUCTURE.NOT_FOUND, statusCode: 404 };
	}
	return template;
};

export const getExamStructureMeta = async (jlpt = 'N3') => {
	const template = await getDefaultTemplateByJlpt(jlpt);
	return templateToClientMeta(template);
};

export const buildDefaultExamSections = async (jlpt = 'N3') => {
	const template = await getDefaultTemplateByJlpt(jlpt);
	return blueprintToExamSections(template.sections ?? []);
};

export const getExamSectionsTemplatePayload = async (jlpt = 'N3') => {
	const template = await getDefaultTemplateByJlpt(jlpt);
	return {
		version: 1,
		jlpt: template.jlpt,
		templateId: String(template._id),
		sections: blueprintToExamSections(template.sections ?? []),
		meta: templateToClientMeta(template),
	};
};

export const updateExamStructureTemplate = async (id, payload) => {
	const current = await examStructureRepository.findTemplateById(id);
	if (!current) {
		throw { messageCode: EXAM_STRUCTURE.NOT_FOUND, statusCode: 404 };
	}

	const sections = normalizeBlueprintSections(
		payload.sections ?? current.sections ?? [],
	);
	const errors = validateBlueprintSections(sections);
	if (errors.length) {
		throw {
			messageCode: EXAM_STRUCTURE.INVALID,
			statusCode: 400,
			errors: errors.map((message) => ({ message })),
		};
	}

	if (sections.length === 0) {
		throw {
			messageCode: EXAM_STRUCTURE.INVALID,
			statusCode: 400,
			errors: [{ message: 'Khung cần ít nhất 1 part' }],
		};
	}

	const updated = await examStructureRepository.updateTemplateById(id, {
		name: payload.name ?? current.name,
		description: payload.description ?? current.description,
		isActive: payload.isActive ?? current.isActive,
		version: (current.version ?? 1) + 1,
		sections,
	});
	return updated;
};

export const resetExamStructureTemplate = async (id) => {
	const current = await examStructureRepository.findTemplateById(id);
	if (!current) {
		throw { messageCode: EXAM_STRUCTURE.NOT_FOUND, statusCode: 404 };
	}
	const seed = buildSeedTemplatesFromConstants().find((t) => t.jlpt === current.jlpt);
	if (!seed) {
		throw { messageCode: EXAM_STRUCTURE.NOT_FOUND, statusCode: 404 };
	}
	const updated = await examStructureRepository.updateTemplateById(id, {
		...seed,
		code: current.code,
		isDefault: current.isDefault,
		version: (current.version ?? 1) + 1,
	});
	return updated;
};

/**
 * Kiểm tra partType có trong blueprint JLPT không
 * @param {string} jlpt
 * @param {string} sectionType
 * @param {string} partType
 */
export const isPartEnabledInTemplate = async (jlpt, sectionType, partType) => {
	const template = await getDefaultTemplateByJlpt(jlpt);
	return (template.sections ?? []).some(
		(s) =>
			s.sectionType === sectionType &&
			s.partType === partType &&
			s.isEnabled !== false,
	);
};

/** Catalog part hợp lệ — dùng khi thêm part vào blueprint */
export const getPartCatalog = () => ({
	sectionOrder: ['vocabulary', 'grammar', 'reading', 'listening'],
	sectionMeta: EXAM_SECTION_META,
	partsBySection: EXAM_PART_TYPES_BY_SECTION,
	partMeta: EXAM_PART_META,
});
