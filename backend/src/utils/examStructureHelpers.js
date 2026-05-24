import {
	EXAM_PART_META,
	EXAM_SECTION_META,
	buildDefaultExamSections as buildDefaultExamSectionsFromConstants,
} from '../constants/examPaperStructure.js';

/** @param {Record<string, unknown>} section */
export function inferSectionFlags(section) {
	const sectionType = String(section.sectionType ?? '');
	const partType = String(section.partType ?? '');
	let needsPassage = Boolean(section.needsPassage);
	let needsMedia = Boolean(section.needsMedia ?? section.needsAudio);

	if (!needsPassage) {
		if (sectionType === 'reading') needsPassage = true;
		if (sectionType === 'grammar' && partType === 'text_grammar') needsPassage = true;
		if (
			sectionType === 'vocabulary' &&
			['context_word', 'same_meaning', 'word_usage', 'synonym'].includes(partType)
		) {
			needsPassage = true;
		}
	}
	if (!needsMedia && sectionType === 'listening') {
		needsMedia = true;
	}
	if (partType === 'info_search') {
		if (section.needsMedia == null && section.needsAudio == null) {
			needsMedia = true;
		}
		if (section.needsPassage == null) {
			needsPassage = false;
		}
	}

	return { needsPassage, needsMedia };
}

/**
 * Gộp nội dung đề đã soạn vào khung blueprint (giữ thứ tự & part từ khung).
 * @param {Array<Record<string, unknown>>} existingSections
 * @param {Array<Record<string, unknown>>} frame
 */
export function mergePaperSectionsWithFrame(existingSections = [], frame = []) {
	const byKey = new Map(
		(Array.isArray(existingSections) ? existingSections : []).map((s) => [
			`${s.sectionType}:${s.partType}`,
			s,
		]),
	);
	return frame.map((part) => {
		const key = `${part.sectionType}:${part.partType}`;
		const hit = byKey.get(key);
		if (!hit) return { ...part };
		const hitPassages = Array.isArray(hit.passages) ? hit.passages : [];
		const hitQuestions = Array.isArray(hit.questions) ? hit.questions : [];

		return {
			...part,
			...hit,
			sectionType: part.sectionType,
			partType: part.partType,
			titleVi: String(hit.titleVi ?? '').trim() ? hit.titleVi : part.titleVi,
			titleJa: String(hit.titleJa ?? '').trim() ? hit.titleJa : part.titleJa,
			descriptionVi: String(hit.descriptionVi ?? '').trim()
				? hit.descriptionVi
				: part.descriptionVi,
			order: part.order,
			timeLimitMinutes: hit.timeLimitMinutes ?? part.timeLimitMinutes ?? 0,
			passageJa: hit.passageJa ?? part.passageJa ?? '',
			passageVi: hit.passageVi ?? part.passageVi ?? '',
			audioUrl: hit.audioUrl ?? part.audioUrl ?? '',
			imageUrl: hit.imageUrl ?? part.imageUrl ?? '',
			passages: hitPassages.length > 0 ? hitPassages : [],
			questions: hitQuestions,
		};
	});
}

/**
 * Chuyển blueprint DB → sections rỗng cho ExamPaper
 * @param {Array<Record<string, unknown>>} blueprintSections
 */
export function blueprintToExamSections(blueprintSections = []) {
	return blueprintSections
		.filter((s) => s.isEnabled !== false)
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		.map((s, idx) => {
			const meta = EXAM_PART_META[s.partType] ?? {};
			const flags = inferSectionFlags(s);
			return {
				sectionType: s.sectionType,
				partType: s.partType,
				titleVi: s.titleVi || meta.titleVi || s.partType,
				titleJa: s.titleJa || meta.titleJa || '',
				descriptionVi: s.descriptionVi || meta.descVi || '',
				order: s.order ?? idx + 1,
				timeLimitMinutes: 0,
				passageJa: '',
				passageVi: '',
				audioUrl: '',
				imageUrl: '',
				passages: [],
				questions: [],
				needsPassage: flags.needsPassage,
				needsMedia: flags.needsMedia,
			};
		});
}

/**
 * @param {import('../models/ExamStructureTemplate.js').default | Record<string, unknown>} template
 */
export function templateToClientMeta(template) {
	const sections = Array.isArray(template?.sections) ? template.sections : [];
	const partMeta = {};
	const enabledSections = sections.filter((s) => s.isEnabled !== false);

	for (const s of sections) {
		partMeta[s.partType] = {
			titleVi: s.titleVi,
			titleJa: s.titleJa,
			descVi: s.descriptionVi,
			needsPassage: inferSectionFlags(s).needsPassage,
			needsMedia: inferSectionFlags(s).needsMedia,
			sectionType: s.sectionType,
			isEnabled: s.isEnabled !== false,
		};
	}

	return {
		jlpt: template.jlpt,
		code: template.code,
		name: template.name,
		version: template.version ?? 1,
		sectionMeta: EXAM_SECTION_META,
		partMeta,
		sectionOrder: ['vocabulary', 'grammar', 'reading', 'listening'],
		enabledPartTypes: enabledSections.map((s) => ({
			sectionType: s.sectionType,
			partType: s.partType,
			order: s.order ?? 0,
		})),
	};
}

/** Seed data từ constants — dùng khi DB trống */
export function buildSeedTemplatesFromConstants() {
	const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
	return levels.map((jlpt) => {
		const examSections = buildDefaultExamSectionsFromConstants(jlpt);
		const sections = examSections.map((s, idx) => {
			const flags = inferSectionFlags(s);
			const meta = EXAM_PART_META[s.partType] ?? {};
			return {
				sectionType: s.sectionType,
				partType: s.partType,
				titleVi: s.titleVi || meta.titleVi || s.partType,
				titleJa: s.titleJa || meta.titleJa || '',
				descriptionVi: s.descriptionVi || meta.descVi || '',
				order: s.order ?? idx + 1,
				isEnabled: true,
				needsPassage: flags.needsPassage,
				needsMedia: flags.needsMedia,
			};
		});
		return {
			code: `jlpt-${jlpt.toLowerCase()}-default`,
			jlpt,
			name: `JLPT ${jlpt} — khung chuẩn`,
			description: `Cấu trúc đề mặc định cho cấp ${jlpt}`,
			isDefault: true,
			isActive: true,
			version: 1,
			sections,
		};
	});
}
