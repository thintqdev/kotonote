import Grammar from '../models/Grammar.js';
import AppError from '../utils/AppError.js';
import { GRAMMAR } from '../constants/messages.js';
import { normalizeJlptLevel } from '../utils/jlptAccess.js';
import { getAIPromptAsync } from '../utils/promptLoader.js';
import { callGeminiAPI } from './aiService.js';
import { normalizeGrammarPracticeFromAI } from '../utils/aiGrammarPracticeNormalize.js';
import {
	GRAMMAR_PRACTICE_COUNT_MAX,
	GRAMMAR_PRACTICE_COUNT_MIN,
	GRAMMAR_PRACTICE_LEVEL_RULES,
	GRAMMAR_PRACTICE_PATTERN_SAMPLE,
} from '../constants/grammarPractice.js';
import * as grammarPracticeRepository from '../repositories/grammarPracticeRepository.js';

function clampCount(count) {
	const n = Number(count);
	if (!Number.isFinite(n)) return GRAMMAR_PRACTICE_COUNT_MIN;
	return Math.min(
		GRAMMAR_PRACTICE_COUNT_MAX,
		Math.max(GRAMMAR_PRACTICE_COUNT_MIN, Math.round(n)),
	);
}

function shuffleArray(arr) {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

/**
 * @param {import('mongoose').Types.ObjectId | string} [subId]
 * @param {number} index
 */
function mapQuestionForClient(q, index, subId) {
	return {
		id: subId ? String(subId) : String(q.id ?? `q${index + 1}`),
		type: q.type,
		promptJa: q.promptJa,
		promptVi: q.promptVi ?? '',
		options: q.options,
		answerIndex: q.answerIndex,
		explainVi: q.explainVi ?? '',
		pattern: q.pattern ?? '',
	};
}

/**
 * @param {string} jlpt
 */
async function loadPatternContext(jlpt) {
	const rows = await Grammar.find({ isPublished: true, jlpt })
		.select('pattern teaser.vi slug')
		.sort({ displayOrder: 1, createdAt: -1 })
		.limit(GRAMMAR_PRACTICE_PATTERN_SAMPLE)
		.lean();

	if (!rows.length) {
		return '(Chưa có bài ngữ pháp published — vẫn ra đề đúng chuẩn JLPT từ kiến thức đề thi.)';
	}

	return rows
		.map((r) => {
			const hint = r.teaser?.vi?.trim() || r.slug || '';
			return `- ${r.pattern?.trim() || r.slug}: ${hint}`;
		})
		.join('\n');
}

/**
 * Gọi AI sinh câu hỏi (dùng ở admin khi tạo đề).
 * @param {{ jlpt: string, count?: number }} input
 */
export async function generateGrammarPracticeQuestions(input) {
	const jlpt = normalizeJlptLevel(input.jlpt);
	if (!jlpt) {
		throw new AppError(GRAMMAR.PRACTICE_INVALID_LEVEL, 400);
	}

	const count = clampCount(input.count);
	const patternsBlock = await loadPatternContext(jlpt);
	const promptTemplate = await getAIPromptAsync('grammar', 'practice', {
		count,
		customVariables: {
			jlpt,
			count: String(count),
			levelRules: GRAMMAR_PRACTICE_LEVEL_RULES[jlpt] ?? '',
			patternsBlock,
		},
	});

	const aiRaw = await callGeminiAPI(promptTemplate, {
		temperature: 0.55,
		maxTokens: 8192,
		arrayMode: true,
	});

	const questions = normalizeGrammarPracticeFromAI(aiRaw, count);
	if (!questions.length) {
		throw new AppError(GRAMMAR.PRACTICE_AI_FAILED, 503);
	}

	return { jlpt, count, questions };
}

/**
 * User: lấy đề quiz ngẫu nhiên từ bộ đề đã publish.
 * @param {{ jlpt: string, count?: number }} input
 */
export async function buildGrammarPracticeQuiz(input) {
	const jlpt = normalizeJlptLevel(input.jlpt);
	if (!jlpt) {
		throw new AppError(GRAMMAR.PRACTICE_INVALID_LEVEL, 400);
	}

	const requestedCount = clampCount(input.count);
	const poolSize = await grammarPracticeRepository.countPublishedByJlpt(jlpt);

	if (!poolSize) {
		throw new AppError(GRAMMAR.PRACTICE_NO_QUESTIONS, 404);
	}

	const sampleSize = Math.min(requestedCount, poolSize);
	const rows = shuffleArray(
		await grammarPracticeRepository.samplePublishedQuestions(jlpt, sampleSize),
	);

	const questions = rows.map((q, idx) => mapQuestionForClient(q, idx, q._id));

	return {
		questions,
		meta: {
			jlpt,
			requestedCount,
			actualCount: questions.length,
			poolSize,
		},
		messageCode: GRAMMAR.PRACTICE_QUIZ_READY,
	};
}
