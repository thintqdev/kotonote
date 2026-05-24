import { EXAM_LISTENING_DEFAULT_QUESTION_JA } from '../constants/examPaperFieldMeta.js';
import {
	countSectionQuestions,
	getReadingPassageBlocks,
	normalizeReadingPassagesFromBlocks,
	parseListeningPartImportRoot,
	parseReadingPartImportRoot,
	prepareListeningDraftForManual,
	resolveBlockImageUrl,
	sectionHasReadingPassages,
} from './examReadingPassages.js';

export { EXAM_LISTENING_DEFAULT_QUESTION_JA };

/**
 * @param {Record<string, unknown>} section
 */
export function applyListeningQuestionDefaults(section) {
	if (section?.sectionType !== 'listening') return section;
	const fill = (q) => ({
		...q,
		questionJa: String(q.questionJa ?? '').trim()
			? q.questionJa
			: EXAM_LISTENING_DEFAULT_QUESTION_JA,
	});
	return {
		...section,
		questions: (section.questions ?? []).map(fill),
		passages: (section.passages ?? []).map((block) => ({
			...block,
			questions: (block.questions ?? []).map(fill),
		})),
	};
}

/** @returns {import('../services/adminExamPaperService.js').ExamQuestion} */
export function emptyExamQuestion(questionNumber = 1, sectionType = '') {
	const questionJa =
		sectionType === 'listening' ? EXAM_LISTENING_DEFAULT_QUESTION_JA : '';
	return {
		questionNumber,
		questionJa,
		questionVi: '',
		questionType: 'multiple_choice',
		choices: ['', '', '', ''],
		choiceImages: [],
		mediaUrl: '',
		answerIndex: 0,
		explainVi: '',
		explainJa: '',
		points: 1,
	};
}

/** @param {Record<string, unknown>} section */
export function cloneExamSection(section) {
	return {
		...section,
		passages: (section.passages ?? []).map((block) => ({
			...block,
			questions: (block.questions ?? []).map((q) => ({
				...q,
				choices: [...(q.choices ?? ['', '', '', ''])],
				choiceImages: [...(q.choiceImages ?? [])],
			})),
		})),
		questions: (section.questions ?? []).map((q) => ({
			...q,
			choices: [...(q.choices ?? ['', '', '', ''])],
			choiceImages: [...(q.choiceImages ?? [])],
		})),
	};
}

/** @param {Record<string, unknown>} section */
export function partNeedsPassage(section) {
	if (section.sectionType === 'reading') return true;
	if (section.sectionType === 'grammar' && section.partType === 'text_grammar') {
		return true;
	}
	if (
		section.sectionType === 'vocabulary' &&
		['context_word', 'same_meaning', 'word_usage', 'synonym'].includes(String(section.partType))
	) {
		return true;
	}
	return false;
}

/** @param {Record<string, unknown>} section */
export function partNeedsAudio(section) {
	return section.sectionType === 'listening';
}

/**
 * @param {Array<Record<string, unknown>>} sections
 * @param {string} sectionType
 * @param {string} partType
 */
export function findSectionIndex(sections, sectionType, partType) {
	return (sections ?? []).findIndex(
		(s) => s.sectionType === sectionType && s.partType === partType,
	);
}

/**
 * @param {Record<string, unknown>} question
 * @param {number} index
 */
export function validateExamQuestion(question, index) {
	const errors = [];
	const label = `Câu ${index + 1}`;
	if (!String(question.questionJa ?? '').trim() && !String(question.questionVi ?? '').trim()) {
		errors.push(`${label}: cần nội dung câu hỏi (JA hoặc VI)`);
	}
	const choices = question.choices ?? [];
	if (choices.length < 2) {
		errors.push(`${label}: cần ít nhất 2 lựa chọn`);
	}
	const filled = choices.filter((c) => String(c ?? '').trim()).length;
	if (filled < 2) {
		errors.push(`${label}: cần ít nhất 2 lựa chọn có nội dung`);
	}
	const answerIndex = Number(question.answerIndex ?? 0);
	if (answerIndex < 0 || answerIndex >= choices.length) {
		errors.push(`${label}: đáp án đúng không hợp lệ`);
	}
	if (choices.length > 0 && !String(choices[answerIndex] ?? '').trim()) {
		errors.push(`${label}: đáp án đúng trỏ vào lựa chọn trống`);
	}
	return errors;
}

/**
 * @param {Record<string, unknown>} section
 */
export function validateExamSectionDraft(section) {
	const errors = [];
	getReadingPassageBlocks(section).forEach((block) => {
		(block.questions ?? []).forEach((q, i) => {
			errors.push(...validateExamQuestion(q, i));
		});
	});
	return errors;
}

function normalizeQuestionForSave(q, idx) {
	return {
		questionNumber: Number(q.questionNumber) > 0 ? Number(q.questionNumber) : idx + 1,
		questionJa: String(q.questionJa ?? '').trim(),
		questionVi: String(q.questionVi ?? '').trim(),
		questionType: q.questionType || 'multiple_choice',
		choices: (q.choices ?? []).map((c) => String(c ?? '').trim()),
		choiceImages: q.choiceImages ?? [],
		mediaUrl: String(q.mediaUrl ?? q.imageUrl ?? '').trim(),
		answerIndex: Math.max(0, Number(q.answerIndex) || 0),
		explainVi: String(q.explainVi ?? '').trim(),
		explainJa: String(q.explainJa ?? '').trim(),
		points: Number(q.points) > 0 ? Number(q.points) : 1,
	};
}

/**
 * Chuẩn hóa trước khi gửi API
 * @param {Record<string, unknown>} section
 */
export function normalizeSectionForSave(section) {
	if (section.sectionType === 'listening') {
		const flat = prepareListeningDraftForManual(section);
		const questions = (flat.questions ?? []).map((q, idx) =>
			normalizeQuestionForSave(q, idx),
		);
		return {
			sectionType: section.sectionType,
			partType: section.partType,
			titleVi: String(section.titleVi ?? '').trim(),
			titleJa: String(section.titleJa ?? '').trim(),
			descriptionVi: String(section.descriptionVi ?? '').trim(),
			order: Number(section.order) || 0,
			timeLimitMinutes: Number(section.timeLimitMinutes) || 0,
			passageJa: '',
			passageVi: '',
			audioUrl: '',
			imageUrl: '',
			passages: [],
			questions,
		};
	}

	if (section.sectionType === 'reading') {
		const blocks = sectionHasReadingPassages(section)
			? section.passages
			: getReadingPassageBlocks(section);
		const { passages, questions } = normalizeReadingPassagesFromBlocks(blocks);
		return {
			sectionType: section.sectionType,
			partType: section.partType,
			titleVi: String(section.titleVi ?? '').trim(),
			titleJa: String(section.titleJa ?? '').trim(),
			descriptionVi: String(section.descriptionVi ?? '').trim(),
			order: Number(section.order) || 0,
			timeLimitMinutes: Number(section.timeLimitMinutes) || 0,
			passageJa: '',
			passageVi: '',
			audioUrl: '',
			imageUrl: '',
			passages: passages.map((block) => ({
				passageJa: String(block.passageJa ?? '').trim(),
				passageVi: String(block.passageVi ?? '').trim(),
				audioUrl: String(block.audioUrl ?? '').trim(),
				mediaUrl: resolveBlockImageUrl(block),
				imageUrl: '',
				questions: (block.questions ?? []).map((q, idx) =>
					normalizeQuestionForSave(q, idx),
				),
			})),
			questions: questions.map((q, idx) => normalizeQuestionForSave(q, idx)),
		};
	}

	const questions = (section.questions ?? []).map((q, idx) =>
		normalizeQuestionForSave(q, idx),
	);
	return {
		sectionType: section.sectionType,
		partType: section.partType,
		titleVi: String(section.titleVi ?? '').trim(),
		titleJa: String(section.titleJa ?? '').trim(),
		descriptionVi: String(section.descriptionVi ?? '').trim(),
		order: Number(section.order) || 0,
		timeLimitMinutes: Number(section.timeLimitMinutes) || 0,
		passageJa: String(section.passageJa ?? '').trim(),
		passageVi: String(section.passageVi ?? '').trim(),
		audioUrl: String(section.audioUrl ?? '').trim(),
		imageUrl: String(section.imageUrl ?? '').trim(),
		passages: [],
		questions,
	};
}

/**
 * JSON export/import cho tab Import phần này
 * @param {Record<string, unknown>} section
 */
function exportQuestionFields(q, idx) {
	return {
		questionNumber: Number(q.questionNumber) > 0 ? Number(q.questionNumber) : idx + 1,
		questionJa: q.questionJa ?? '',
		questionVi: q.questionVi ?? '',
		questionType: q.questionType || 'multiple_choice',
		choices: [...(q.choices ?? ['', '', '', ''])].slice(0, 4),
		choiceImages: [...(q.choiceImages ?? [])],
		mediaUrl: String(q.mediaUrl ?? q.imageUrl ?? '').trim(),
		answerIndex: Math.min(3, Math.max(0, Number(q.answerIndex) || 0)),
		explainVi: q.explainVi ?? '',
		explainJa: q.explainJa ?? '',
		points: Number(q.points) > 0 ? Number(q.points) : 1,
	};
}

export function buildPartExportFromDraft(section) {
	if (section.sectionType === 'reading' && sectionHasReadingPassages(section)) {
		return section.passages.map((block) => ({
			passageJa: block.passageJa ?? '',
			passageVi: block.passageVi ?? '',
			audioUrl: block.audioUrl ?? '',
			mediaUrl: resolveBlockImageUrl(block),
			imageUrl: block.imageUrl ?? '',
			questions: (block.questions ?? []).map(exportQuestionFields),
		}));
	}
	if (section.sectionType === 'listening') {
		const flat = prepareListeningDraftForManual(section);
		return {
			questions: (flat.questions ?? []).map(exportQuestionFields),
		};
	}
	return {
		passageJa: section.passageJa ?? '',
		passageVi: section.passageVi ?? '',
		audioUrl: section.audioUrl ?? '',
		imageUrl: section.imageUrl ?? '',
		questions: (section.questions ?? []).map(exportQuestionFields),
	};
}

/** @param {Record<string, unknown>} section */
export function sectionHasSaveableContent(section) {
	if (sectionHasReadingPassages(section)) {
		return section.passages.some((block) => {
			const hasPassage =
				String(block.passageJa ?? '').trim() || String(block.passageVi ?? '').trim();
			const hasMedia =
				String(block.audioUrl ?? '').trim() || resolveBlockImageUrl(block) !== '';
			const hasQuestions = (block.questions ?? []).some((q) => {
				const hasText =
					String(q.questionJa ?? '').trim() || String(q.questionVi ?? '').trim();
				const hasChoices = (q.choices ?? []).some((c) => String(c ?? '').trim());
				return hasText || hasChoices;
			});
			return hasPassage || hasMedia || hasQuestions;
		});
	}
	const hasPassage =
		String(section.passageJa ?? '').trim() || String(section.passageVi ?? '').trim();
	const hasMedia =
		section.sectionType === 'listening'
			? false
			: String(section.audioUrl ?? '').trim() || String(section.imageUrl ?? '').trim();
	const hasQuestions = (section.questions ?? []).some((q) => {
		const hasText =
			String(q.questionJa ?? '').trim() || String(q.questionVi ?? '').trim();
		const hasChoices = (q.choices ?? []).some((c) => String(c ?? '').trim());
		const hasQuestionMedia = String(q.mediaUrl ?? q.imageUrl ?? '').trim();
		return hasText || hasChoices || hasQuestionMedia;
	});
	return hasPassage || hasMedia || hasQuestions;
}

/**
 * Gộp importText vào draft (pure — dùng trước save / chuyển tab)
 * @param {Record<string, unknown>} draft
 * @param {string} importText
 * @param {string} sectionType
 * @param {string} partType
 * @param {boolean} replaceOnImport
 */
export function mergeImportTextIntoDraft(
	draft,
	importText,
	sectionType,
	partType,
	replaceOnImport = true,
) {
	if (!String(importText ?? '').trim()) {
		return { draft, error: null, applied: false };
	}
	try {
		const imported = parsePartImportJson(importText, sectionType, partType);
		return {
			draft: mergePartImportIntoDraft(draft, imported, {
				replaceQuestions: replaceOnImport,
			}),
			error: null,
			applied: true,
		};
	} catch (err) {
		return { draft, error: err?.message || 'JSON không hợp lệ', applied: false };
	}
}

/**
 * @param {string} text
 * @param {string} sectionType
 * @param {string} partType
 */
export function parsePartImportJson(text, sectionType, partType) {
	const parsed = JSON.parse(text);

	const listeningFlat = parseListeningPartImportRoot(parsed, sectionType);
	if (listeningFlat) {
		return {
			sectionType,
			partType,
			titleVi: '',
			titleJa: '',
			descriptionVi: '',
			passageJa: '',
			passageVi: '',
			audioUrl: listeningFlat.audioUrl ?? '',
			imageUrl: '',
			passages: [],
			questions: listeningFlat.questions,
		};
	}

	const readingBlocks = parseReadingPartImportRoot(parsed, sectionType);
	if (readingBlocks) {
		return {
			sectionType,
			partType,
			titleVi: '',
			titleJa: '',
			descriptionVi: '',
			passageJa: '',
			passageVi: '',
			audioUrl: '',
			imageUrl: '',
			passages: readingBlocks.passages,
			questions: readingBlocks.questions,
		};
	}

	let section = parsed;

	if (Array.isArray(parsed.sections)) {
		section =
			parsed.sections.find(
				(s) => s.sectionType === sectionType && s.partType === partType,
			) ?? parsed.sections[0];
		if (!section) {
			throw new Error('Không tìm thấy section phù hợp trong mảng sections');
		}
	}

	if (section.sectionType && section.sectionType !== sectionType) {
		throw new Error(
			`sectionType phải là "${sectionType}", nhận "${section.sectionType}"`,
		);
	}
	if (section.partType && section.partType !== partType) {
		throw new Error(`partType phải là "${partType}", nhận "${section.partType}"`);
	}

	if (!section.questions && !section.passageJa && !section.audioUrl && !section.imageUrl) {
		throw new Error('JSON cần có questions, passageJa, audioUrl, imageUrl hoặc media');
	}

	return {
		sectionType,
		partType,
		titleVi: section.titleVi ?? '',
		titleJa: section.titleJa ?? '',
		descriptionVi: section.descriptionVi ?? '',
		passageJa: section.passageJa ?? '',
		passageVi: section.passageVi ?? '',
		audioUrl: section.audioUrl ?? '',
		imageUrl: section.imageUrl ?? '',
		passages: [],
		questions: Array.isArray(section.questions) ? section.questions : [],
	};
}

/**
 * Gộp dữ liệu import vào draft hiện tại
 * @param {Record<string, unknown>} draft
 * @param {Record<string, unknown>} imported
 * @param {{ replaceQuestions?: boolean }} [options]
 */
export function mergePartImportIntoDraft(draft, imported, options = {}) {
	const replaceQuestions = options.replaceQuestions !== false;
	const sectionType = String(draft.sectionType ?? '');
	const importedQuestions = (imported.questions ?? []).map((q, idx) => {
		const choices = [...(q.choices ?? ['', '', '', ''])];
		while (choices.length < 4) choices.push('');
		const base = emptyExamQuestion(idx + 1, sectionType);
		return {
			...base,
			...q,
			questionNumber: Number(q.questionNumber) > 0 ? Number(q.questionNumber) : idx + 1,
			questionJa: String(q.questionJa ?? '').trim() || base.questionJa,
			mediaUrl: String(q.mediaUrl ?? q.imageUrl ?? '').trim(),
			answerIndex: Math.min(3, Math.max(0, Number(q.answerIndex) || 0)),
			choices: choices.slice(0, 4),
		};
	});

	const importedPassages = (imported.passages ?? []).map((block) => ({
		passageJa: block.passageJa ?? '',
		passageVi: block.passageVi ?? '',
		audioUrl: block.audioUrl ?? '',
		mediaUrl: resolveBlockImageUrl(block),
		imageUrl: '',
		questions: (block.questions ?? []).map((q, idx) => {
			const choices = [...(q.choices ?? ['', '', '', ''])];
			while (choices.length < 4) choices.push('');
			const base = emptyExamQuestion(Number(q.questionNumber) || idx + 1, sectionType);
			return {
				...base,
				...q,
				questionNumber: Number(q.questionNumber) > 0 ? Number(q.questionNumber) : idx + 1,
				questionJa: String(q.questionJa ?? '').trim() || base.questionJa,
				mediaUrl: String(q.mediaUrl ?? q.imageUrl ?? '').trim(),
				answerIndex: Math.min(3, Math.max(0, Number(q.answerIndex) || 0)),
				choices: choices.slice(0, 4),
			};
		}),
	}));
	const hasPassages = importedPassages.length > 0;

	return {
		...draft,
		titleVi: imported.titleVi?.trim() ? imported.titleVi : draft.titleVi,
		titleJa: imported.titleJa?.trim() ? imported.titleJa : draft.titleJa,
		descriptionVi: imported.descriptionVi?.trim()
			? imported.descriptionVi
			: draft.descriptionVi,
		passageJa: hasPassages
			? ''
			: imported.passageJa?.trim()
				? imported.passageJa
				: draft.passageJa,
		passageVi: hasPassages
			? ''
			: imported.passageVi?.trim()
				? imported.passageVi
				: draft.passageVi,
		audioUrl: hasPassages
			? ''
			: imported.audioUrl?.trim()
				? imported.audioUrl
				: draft.audioUrl,
		imageUrl: hasPassages
			? ''
			: imported.imageUrl?.trim()
				? imported.imageUrl
				: draft.imageUrl,
		passages: hasPassages
			? importedPassages.map((block, bi) => {
					const prev = draft.passages?.[bi];
					if (!prev) return block;
					return {
						...prev,
						...block,
						mediaUrl: resolveBlockImageUrl(block) || resolveBlockImageUrl(prev),
						imageUrl: '',
						audioUrl: block.audioUrl?.trim()
							? block.audioUrl
							: prev.audioUrl ?? '',
					};
				})
			: replaceQuestions
				? []
				: draft.passages ?? [],
		questions: replaceQuestions
			? importedQuestions
			: [...(draft.questions ?? []), ...importedQuestions],
	};
}

export {
	countSectionQuestions,
	getReadingPassageBlocks,
	prepareListeningDraftForManual,
	sectionHasReadingPassages,
};
