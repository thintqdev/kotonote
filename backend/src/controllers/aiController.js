import asyncHandler from 'express-async-handler';
import * as aiService from '../services/aiService.js';
import * as vocabularyService from '../services/vocabularyService.js';
import * as kanjiService from '../services/kanjiService.js';
import { apiSuccess } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * @desc    Generate vocabulary with AI
 * @route   POST /api/ai/generate/vocabulary
 * @access  Admin
 */
export const generateVocabulary = asyncHandler(async (req, res) => {
	const {
		deckId,
		templateName = 'n3-daily',
		prompt = '',
		count = 10,
		autoCreate = false,
	} = req.body;
	
	if (!prompt || prompt.trim().length === 0) {
		return apiSuccess(res, { vocabulary: [], count: 0 }, MESSAGES.MSG_003, 400);
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
		templateName,
		count: Math.min(count, 25),
		existingItems: existingWords,
		customPrompt: prompt.trim(),
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
		}, MESSAGES.MSG_707, 201);
	}
	
	return apiSuccess(res, {
		vocabulary: result.vocabulary,
		count: result.vocabulary.length,
		source: result.source,
		promptUsed: result.promptUsed,
		templateName: result.templateName,
	}, MESSAGES.MSG_001, 200);
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
	
	if (!prompt || prompt.trim().length === 0) {
		return apiSuccess(res, { kanji: [], count: 0 }, MESSAGES.MSG_003, 400);
	}
	
	// Get existing kanji if deckId provided
	let existingChars = [];
	if (deckId) {
		const deck = await kanjiService.getDeckById(deckId);
		const kanjiList = await kanjiService.getKanjiByDeck(deckId);
		existingChars = kanjiList.map(k => k.char);
	}
	
	// Generate with AI
	const result = await aiService.generateKanjiWithAI({
		templateName,
		count: Math.min(count, 25),
		existingItems: existingChars,
		customPrompt: prompt.trim(),
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
		}, MESSAGES.MSG_901, 201);
	}
	
	return apiSuccess(res, {
		kanji: result.kanji,
		count: result.kanji.length,
		source: result.source,
		promptUsed: result.promptUsed,
		templateName: result.templateName,
	}, MESSAGES.MSG_001, 200);
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
		return apiSuccess(res, { translation: '' }, MESSAGES.MSG_003, 400);
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
	}, MESSAGES.MSG_001, 200);
});

/**
 * @desc    Test AI connection
 * @route   GET /api/ai/test
 * @access  Admin
 */
export const testAIConnection = asyncHandler(async (req, res) => {
	const apiKey = process.env.GEMINI_API_KEY;
	
	const status = {
		configured: !!apiKey,
		provider: 'Gemini AI',
		message: apiKey 
			? 'AI service is configured and ready' 
			: 'AI service not configured. Add GEMINI_API_KEY to .env file',
	};
	
	return apiSuccess(res, status, MESSAGES.MSG_001, 200);
});
