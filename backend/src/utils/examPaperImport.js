import {
	EXAM_IMPORT_VERSION,
	EXAM_QUESTION_TYPES,
	EXAM_SECTION_TYPES,
} from '../constants/examPaper.js';
import {
	EXAM_PART_META,
	buildDefaultExamSections as buildDefaultExamSectionsFromConstants,
	isValidPartTypeForSection,
} from '../constants/examPaperStructure.js';
import * as examStructureService from '../services/examStructureService.js';
import { mergePaperSectionsWithFrame } from './examStructureHelpers.js';
import {
	normalizeReadingPassagesFromBlocks,
	normalizeReadingSectionForStorage,
	sectionHasReadingPassages,
} from './examReadingPassages.js';

/**
 * @param {unknown} raw
 * @returns {{ ok: true, sections: object[] } | { ok: false, errors: string[] }}
 */
export function parseExamSectionsImport(raw) {
	const errors = [];

	if (!raw || typeof raw !== 'object') {
		return { ok: false, errors: ['JSON phải là object'] };
	}

	const o = /** @type {Record<string, unknown>} */ (raw);
	if (o.version !== EXAM_IMPORT_VERSION) {
		errors.push(`version phải là ${EXAM_IMPORT_VERSION}`);
	}

	const sectionsRaw = o.sections;
	if (!Array.isArray(sectionsRaw)) {
		errors.push('sections phải là mảng');
		return { ok: false, errors };
	}

	if (sectionsRaw.length === 0) {
		errors.push('sections không được rỗng');
	}

	const sections = [];
	const seenKeys = new Set();

	for (let i = 0; i < sectionsRaw.length; i += 1) {
		const item = sectionsRaw[i];
		if (!item || typeof item !== 'object') {
			errors.push(`sections[${i}]: phải là object`);
			continue;
		}
		const s = /** @type {Record<string, unknown>} */ (item);
		const sectionType = String(s.sectionType ?? '').trim();
		const partType = String(s.partType ?? '').trim();

		if (!EXAM_SECTION_TYPES.includes(sectionType)) {
			errors.push(
				`sections[${i}].sectionType: "${sectionType}" không hợp lệ (${EXAM_SECTION_TYPES.join(', ')})`,
			);
		}
		if (!isValidPartTypeForSection(sectionType, partType)) {
			errors.push(
				`sections[${i}].partType: "${partType}" không thuộc khối ${sectionType}`,
			);
		}

		const key = `${sectionType}:${partType}`;
		if (seenKeys.has(key)) {
			errors.push(`sections[${i}]: trùng sectionType+partType (${key})`);
		}
		seenKeys.add(key);

		let passages = [];
		let questions = [];
		let passageJa = String(s.passageJa ?? '').slice(0, 50_000);
		let passageVi = String(s.passageVi ?? '').slice(0, 50_000);
		let audioUrl = String(s.audioUrl ?? '').trim().slice(0, 500);
		let imageUrl = String(s.imageUrl ?? '').trim().slice(0, 500);

		if (
			(sectionType === 'reading' || sectionType === 'listening') &&
			Array.isArray(s.passages) &&
			s.passages.length > 0
		) {
			try {
				const normalized = normalizeReadingPassagesFromBlocks(s.passages);
				for (let pi = 0; pi < normalized.passages.length; pi += 1) {
					const block = normalized.passages[pi];
					const blockQuestions = [];
					for (let qi = 0; qi < (block.questions ?? []).length; qi += 1) {
						const qErr = validateQuestion(block.questions[qi], i, qi, `passages[${pi}]`);
						if (qErr.length) {
							errors.push(...qErr);
						} else {
							blockQuestions.push(
								normalizeQuestion(block.questions[qi], block.questions[qi].questionNumber - 1),
							);
						}
					}
					const blockMediaUrl = String(
						block.mediaUrl ?? block.imageUrl ?? '',
					)
						.trim()
						.slice(0, 500);
					passages.push({
						passageJa: String(block.passageJa ?? '').slice(0, 50_000),
						passageVi: String(block.passageVi ?? '').slice(0, 50_000),
						audioUrl: String(block.audioUrl ?? '').trim().slice(0, 500),
						mediaUrl: blockMediaUrl,
						imageUrl: '',
						questions: blockQuestions,
					});
				}
				questions = passages.flatMap((p) => p.questions);
				passageJa = '';
				passageVi = '';
				audioUrl = '';
				imageUrl = '';
			} catch (err) {
				errors.push(`sections[${i}].passages: ${err?.message || 'không hợp lệ'}`);
			}
		} else {
			const questionsRaw = Array.isArray(s.questions) ? s.questions : [];
			for (let qi = 0; qi < questionsRaw.length; qi += 1) {
				const qErr = validateQuestion(questionsRaw[qi], i, qi);
				if (qErr.length) {
					errors.push(...qErr);
				} else {
					questions.push(normalizeQuestion(questionsRaw[qi], qi));
				}
			}
		}

		const meta = EXAM_PART_META[partType] ?? {};
		sections.push({
			sectionType,
			partType,
			titleVi: String(s.titleVi ?? meta.titleVi ?? '').trim(),
			titleJa: String(s.titleJa ?? meta.titleJa ?? '').trim(),
			descriptionVi: String(s.descriptionVi ?? meta.descVi ?? '').trim(),
			order: Number(s.order ?? i + 1),
			timeLimitMinutes: Math.max(0, parseInt(String(s.timeLimitMinutes ?? 0), 10) || 0),
			passageJa,
			passageVi,
			audioUrl,
			imageUrl,
			passages,
			questions,
		});
	}

	if (errors.length) {
		return { ok: false, errors };
	}

	sections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	return { ok: true, sections };
}

/**
 * @param {unknown} q
 * @param {number} si
 * @param {number} qi
 * @param {string} [prefix]
 */
function validateQuestion(q, si, qi, prefix = 'questions') {
	const errors = [];
	if (!q || typeof q !== 'object') {
		return [`sections[${si}].${prefix}[${qi}]: phải là object`];
	}
	const o = /** @type {Record<string, unknown>} */ (q);
	const questionType = String(o.questionType ?? 'multiple_choice');
	if (!EXAM_QUESTION_TYPES.includes(questionType)) {
		errors.push(
			`sections[${si}].${prefix}[${qi}].questionType không hợp lệ`,
		);
	}
	const choices = Array.isArray(o.choices) ? o.choices : [];
	if (questionType === 'multiple_choice' && choices.length > 0 && choices.length !== 4) {
		errors.push(
			`sections[${si}].${prefix}[${qi}].choices: trắc nghiệm JLPT thường có 4 lựa chọn`,
		);
	}
	if (questionType === 'star_question') {
		if (choices.length > 0 && choices.length !== 4) {
			errors.push(
				`sections[${si}].${prefix}[${qi}].choices: ★問題 thường có 4 lựa chọn`,
			);
		}
		const qJa = String(o.questionJa ?? '');
		if (qJa && (!qJa.includes('★') || !/_{2,}/.test(qJa))) {
			errors.push(
				`sections[${si}].${prefix}[${qi}].questionJa: ★問題 cần có ____ và ký hiệu ★`,
			);
		}
	}
	const answerIndex = Number(o.answerIndex ?? 0);
	if (choices.length > 0 && (answerIndex < 0 || answerIndex >= choices.length)) {
		errors.push(
			`sections[${si}].${prefix}[${qi}].answerIndex ngoài phạm vi choices`,
		);
	}
	return errors;
}

export { normalizeReadingSectionForStorage, sectionHasReadingPassages };

/**
 * @param {unknown} q
 * @param {number} index
 */
function normalizeQuestion(q, index) {
	const o = /** @type {Record<string, unknown>} */ (q);
	return {
		questionNumber: Number(o.questionNumber ?? index + 1),
		questionJa: String(o.questionJa ?? '').trim(),
		questionVi: String(o.questionVi ?? '').trim(),
		questionType: EXAM_QUESTION_TYPES.includes(String(o.questionType))
			? String(o.questionType)
			: 'multiple_choice',
		choices: (Array.isArray(o.choices) ? o.choices : []).map((c) => String(c ?? '')),
		choiceImages: (Array.isArray(o.choiceImages) ? o.choiceImages : []).map((c) =>
			String(c ?? ''),
		),
		mediaUrl: String(o.mediaUrl ?? o.imageUrl ?? '').trim().slice(0, 500),
		answerIndex: Number(o.answerIndex ?? 0),
		explainVi: String(o.explainVi ?? '').trim(),
		explainJa: String(o.explainJa ?? '').trim(),
		points: Math.max(0, Number(o.points ?? 1) || 1),
	};
}

/**
 * @param {object[]} imported
 * @param {string} jlpt
 */
export async function mergeSectionsWithDefaultFrame(imported, jlpt) {
	const frame = await examStructureService.buildDefaultExamSections(jlpt);
	return mergePaperSectionsWithFrame(imported, frame);
}

export { buildDefaultExamSectionsFromConstants as buildDefaultExamSections };
