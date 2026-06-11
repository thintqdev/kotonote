import AppError from '../utils/AppError.js';
import { GRAMMAR } from '../constants/messages.js';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';
import * as grammarPracticeRepository from '../repositories/grammarPracticeRepository.js';
import { normalizeGrammarPracticeImportList } from '../utils/aiGrammarPracticeNormalize.js';
import { generateGrammarPracticeQuestions } from './grammarPracticeService.js';

function mapQuestionForAdmin(row) {
	if (!row) return null;
	return {
		...row,
		_id: String(row._id),
	};
}

function stripClientId(q) {
	const { id: _id, ...rest } = q;
	return rest;
}

function toQuestionDoc(q, jlpt, isPublished, source = 'ai') {
	const base = stripClientId(q);
	return {
		jlpt,
		type: base.type ?? 'grammar_form',
		promptJa: base.promptJa,
		promptVi: base.promptVi ?? '',
		options: base.options,
		answerIndex: base.answerIndex,
		explainVi: base.explainVi ?? '',
		pattern: base.pattern ?? '',
		isPublished: Boolean(isPublished),
		source,
	};
}

/**
 * @param {Record<string, unknown>} query
 */
export async function listGrammarPracticeQuestions(query = {}) {
	const { jlpt, isPublished, q, page, limit } = query;
	const filters = {};
	if (jlpt && GRAMMAR_JLPT_LEVELS.includes(String(jlpt))) filters.jlpt = jlpt;
	if (isPublished === 'true') filters.isPublished = true;
	if (isPublished === 'false') filters.isPublished = false;
	if (q) filters.q = q;

	const result = await grammarPracticeRepository.findQuestionsPaginated(filters, {
		page,
		limit,
	});

	return {
		items: result.items.map((row) => mapQuestionForAdmin(row)),
		pagination: result.pagination,
		messageCode: GRAMMAR.PRACTICE_QUESTION_LIST,
	};
}

export async function getGrammarPracticeQuestionById(id) {
	const row = await grammarPracticeRepository.findQuestionById(id);
	if (!row) {
		throw new AppError(GRAMMAR.PRACTICE_QUESTION_NOT_FOUND, 404);
	}
	return mapQuestionForAdmin(row);
}

/**
 * AI sinh và lưu từng câu hỏi riêng lẻ.
 * @param {{ jlpt: string, count?: number, isPublished?: boolean }} input
 */
export async function generateAndSaveGrammarPracticeQuestions(input) {
	const { jlpt, count, questions } = await generateGrammarPracticeQuestions(input);
	const isPublished = Boolean(input.isPublished);
	const docs = questions.map((q) => toQuestionDoc(q, jlpt, isPublished));
	const inserted = await grammarPracticeRepository.insertQuestions(docs);

	return {
		jlpt,
		inserted: inserted.length,
		messageCode: GRAMMAR.PRACTICE_QUESTIONS_CREATED,
	};
}

/**
 * Import câu hỏi từ JSON (đã parse ở client hoặc validator).
 * @param {{ jlpt: string, isPublished?: boolean, items: unknown[] }} input
 */
export async function importGrammarPracticeQuestions(input) {
	const jlpt = String(input.jlpt ?? '').trim();
	if (!GRAMMAR_JLPT_LEVELS.includes(jlpt)) {
		throw new AppError(GRAMMAR.PRACTICE_INVALID_LEVEL, 400);
	}

	const { questions, errors: normalizeErrors } = normalizeGrammarPracticeImportList(
		input.items,
	);
	if (!questions.length) {
		throw new AppError(GRAMMAR.PRACTICE_IMPORT_INVALID, 400, normalizeErrors);
	}

	const isPublished = Boolean(input.isPublished);
	const docs = questions.map((q) => toQuestionDoc(q, jlpt, isPublished, 'manual'));
	const inserted = await grammarPracticeRepository.insertQuestions(docs);

	return {
		jlpt,
		inserted: inserted.length,
		skipped: input.items.length - questions.length,
		errors: normalizeErrors,
		messageCode: GRAMMAR.PRACTICE_QUESTIONS_IMPORTED,
	};
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} patch
 */
export async function updateGrammarPracticeQuestion(id, patch) {
	const existing = await grammarPracticeRepository.findQuestionById(id);
	if (!existing) {
		throw new AppError(GRAMMAR.PRACTICE_QUESTION_NOT_FOUND, 404);
	}

	const update = {};
	if (patch.isPublished !== undefined) update.isPublished = Boolean(patch.isPublished);
	if (patch.displayOrder !== undefined) update.displayOrder = Number(patch.displayOrder) || 0;
	if (patch.type !== undefined) update.type = patch.type;
	if (patch.promptJa !== undefined) update.promptJa = String(patch.promptJa).trim();
	if (patch.promptVi !== undefined) update.promptVi = String(patch.promptVi).trim();
	if (patch.explainVi !== undefined) update.explainVi = String(patch.explainVi).trim();
	if (patch.pattern !== undefined) update.pattern = String(patch.pattern).trim();
	if (patch.answerIndex !== undefined) update.answerIndex = Number(patch.answerIndex);
	if (Array.isArray(patch.options) && patch.options.length === 4) {
		update.options = patch.options.map((o) => String(o).trim());
	}

	const row = await grammarPracticeRepository.updateQuestionById(id, update);
	return {
		question: mapQuestionForAdmin(row),
		messageCode: GRAMMAR.PRACTICE_QUESTION_UPDATED,
	};
}

export async function deleteGrammarPracticeQuestion(id) {
	const existing = await grammarPracticeRepository.findQuestionById(id);
	if (!existing) {
		throw new AppError(GRAMMAR.PRACTICE_QUESTION_NOT_FOUND, 404);
	}
	await grammarPracticeRepository.deleteQuestionById(id);
	return { messageCode: GRAMMAR.PRACTICE_QUESTION_DELETED };
}
