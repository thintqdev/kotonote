import asyncHandler from 'express-async-handler';
import * as aiService from '../services/aiService.js';
import * as vocabularyService from '../services/vocabularyService.js';
import * as kanjiService from '../services/kanjiService.js';
import { apiSuccess } from '../utils/response.js';
import { getGeminiApiKeys } from '../config/gemini.js';
import { MESSAGES, VOCABULARY, KANJI } from '../constants/messages.js';

/**
 * @desc    Generate vocabulary with AI
 * @route   POST /api/ai/generate/vocabulary
 * @access  Admin
 */
export const generateVocabulary = asyncHandler(async (req, res) => {
	const {
		deckId,
		templateName = 'n5-basic',
		prompt = '',
		count = 10,
		autoCreate = false,
	} = req.body;

	if (!templateName || String(templateName).trim().length === 0) {
		return apiSuccess(res, { vocabulary: [], count: 0 }, MESSAGES.VALIDATION_ERROR, 400);
	}
	
	// Get existing vocabulary if deckId provided
	let existingWords = [];
	if (deckId) {
		const deck = await vocabularyService.getDeckById(deckId);
		const vocabList = await vocabularyService.getVocabularyByDeck(deckId);
		existingWords = vocabList.map(v => v.word);
	}
	
	// Generate with AI
	const result = await aiService.generateVocabularyWithAI({
		templateName: String(templateName).trim().toLowerCase(),
		count: Math.min(Math.max(1, Number(count) || 10), 25),
		existingItems: existingWords,
		customPrompt: String(prompt ?? '').trim(),
	});
	
	// Auto-create if requested
	if (autoCreate && deckId && result.vocabulary.length > 0) {
		const vocabWithOrder = result.vocabulary.map((v, index) => ({
			...v,
			displayOrder: existingWords.length + index + 1,
		}));
		
		const created = await vocabularyService.bulkCreateVocabulary(deckId, vocabWithOrder);
		
		return apiSuccess(res, {
			...created,
			source: result.source,
			promptUsed: result.promptUsed,
			templateName: result.templateName,
		}, VOCABULARY.WORD_CREATED, 201);
	}
	
	return apiSuccess(res, {
		vocabulary: result.vocabulary,
		deck: result.deck ?? null,
		count: result.vocabulary.length,
		source: result.source,
		promptUsed: result.promptUsed,
		templateName: result.templateName,
	}, MESSAGES.SUCCESS, 200);
});

/**
 * @desc    Generate kanji with AI
 * @route   POST /api/ai/generate/kanji
 * @access  Admin
 */
export const generateKanji = asyncHandler(async (req, res) => {
	const {
		deckId,
		templateName = 'n3-intermediate',
		prompt = '',
		count = 10,
		autoCreate = false,
	} = req.body;
	
	if (!templateName || String(templateName).trim().length === 0) {
		return apiSuccess(res, { kanji: [], count: 0 }, MESSAGES.VALIDATION_ERROR, 400);
	}

	let existingChars = [];
	if (deckId) {
		await kanjiService.getDeckById(deckId);
		const kanjiList = await kanjiService.getKanjiByDeck(deckId);
		existingChars = kanjiList.map((k) => k.char);
	}

	const result = await aiService.generateKanjiWithAI({
		templateName: String(templateName).trim().toLowerCase(),
		count: Math.min(Math.max(1, Number(count) || 10), 25),
		existingItems: existingChars,
		customPrompt: String(prompt ?? '').trim(),
	});
	
	// Auto-create if requested
	if (autoCreate && deckId && result.kanji.length > 0) {
		const kanjiWithOrder = result.kanji.map((k, index) => ({
			...k,
			displayOrder: existingChars.length + index + 1,
		}));
		
		const created = await kanjiService.bulkCreateKanji(deckId, kanjiWithOrder);
		
		return apiSuccess(res, {
			...created,
			source: result.source,
			promptUsed: result.promptUsed,
			templateName: result.templateName,
		}, KANJI.CREATED, 201);
	}
	
	return apiSuccess(res, {
		kanji: result.kanji,
		deck: result.deck ?? null,
		count: result.kanji.length,
		source: result.source,
		promptUsed: result.promptUsed,
		templateName: result.templateName,
	}, MESSAGES.SUCCESS, 200);
});

/**
 * @desc    Generate grammar lesson with AI
 * @route   POST /api/admin/ai/generate/grammar
 */
export const generateGrammar = asyncHandler(async (req, res) => {
	const {
		templateName = 'n5-basic',
		prompt = '',
		jlpt = 'N5',
		patternHint = '',
	} = req.body;

	if (!templateName || String(templateName).trim().length === 0) {
		return apiSuccess(res, { grammar: null }, MESSAGES.VALIDATION_ERROR, 400);
	}

	const result = await aiService.generateGrammarWithAI({
		templateName: String(templateName).trim().toLowerCase(),
		customPrompt: String(prompt ?? '').trim(),
		jlpt: String(jlpt ?? 'N5').trim(),
		patternHint: String(patternHint ?? '').trim(),
	});

	return apiSuccess(
		res,
		{
			grammar: result.grammar,
			source: result.source,
			fallbackReason: result.fallbackReason ?? null,
			promptUsed: result.promptUsed,
			templateName: result.templateName,
		},
		MESSAGES.SUCCESS,
		200,
	);
});

/**
 * @desc    Generate reading article with AI
 * @route   POST /api/admin/ai/generate/reading
 */
/**
 * @desc    Generate kaiwa conversation context with AI
 * @route   POST /api/admin/ai/generate/kaiwa
 */
export const generateKaiwa = asyncHandler(async (req, res) => {
	const {
		templateName = 'n5-basic',
		prompt = '',
		jlpt = 'N5',
		category = 'daily',
	} = req.body;

	if (!templateName || String(templateName).trim().length === 0) {
		return apiSuccess(res, { context: null }, MESSAGES.VALIDATION_ERROR, 400);
	}

	const result = await aiService.generateKaiwaContextWithAI({
		templateName: String(templateName).trim().toLowerCase(),
		customPrompt: String(prompt ?? '').trim(),
		jlpt: String(jlpt ?? 'N5').trim().toUpperCase(),
		category: String(category ?? 'daily').trim(),
	});

	return apiSuccess(
		res,
		{
			context: result.context,
			source: result.source,
			promptUsed: result.promptUsed,
			templateName: result.templateName,
		},
		MESSAGES.SUCCESS,
		200,
	);
});

export const generateReading = asyncHandler(async (req, res) => {
	const {
		templateName = 'n5-basic',
		prompt = '',
		jlpt = 'N5',
	} = req.body;

	if (!templateName || String(templateName).trim().length === 0) {
		return apiSuccess(res, { article: null }, MESSAGES.VALIDATION_ERROR, 400);
	}

	const result = await aiService.generateReadingWithAI({
		templateName: String(templateName).trim().toLowerCase(),
		customPrompt: String(prompt ?? '').trim(),
		jlpt: String(jlpt ?? 'N5').trim(),
	});

	return apiSuccess(
		res,
		{
			article: result.article,
			source: result.source,
			promptUsed: result.promptUsed,
			templateName: result.templateName,
		},
		MESSAGES.SUCCESS,
		200,
	);
});

/**
 * @desc    Translate text with AI
 * @route   POST /api/ai/translate
 * @access  Admin
 */
export const translate = asyncHandler(async (req, res) => {
	const {
		text,
		sourceLang = 'ja',
		targetLang = 'vi',
	} = req.body;
	
	if (!text || text.trim().length === 0) {
		return apiSuccess(res, { translation: '' }, MESSAGES.VALIDATION_ERROR, 400);
	}
	
	const translation = await aiService.translateWithAI({
		text: text.trim(),
		sourceLang,
		targetLang,
	});
	
	return apiSuccess(res, {
		original: text,
		translation,
		sourceLang,
		targetLang,
	}, MESSAGES.SUCCESS, 200);
});

/**
 * @desc    Test AI connection
 * @route   GET /api/ai/test
 * @access  Admin
 */
export const testAIConnection = asyncHandler(async (req, res) => {
	const keys = getGeminiApiKeys();

	const status = {
		configured: keys.length > 0,
		keyCount: keys.length,
		provider: 'Gemini AI',
		message: keys.length
			? `AI service is configured (${keys.length} API key${keys.length > 1 ? 's' : ''})`
			: 'AI service not configured. Add GEMINI_API_KEYS (comma-separated) or GEMINI_API_KEY to .env',
	};

	return apiSuccess(res, status, MESSAGES.SUCCESS, 200);
});
