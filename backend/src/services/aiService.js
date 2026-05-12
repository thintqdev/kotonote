import { getAIPrompt } from '../utils/promptLoader.js';

/**
 * AI Service - Centralized AI operations using Gemini API
 */

// TODO: Add to .env file
// GEMINI_API_KEY=your_gemini_api_key_here

/**
 * Call Gemini API with prompt
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Parsed JSON response
 */
export const callGeminiAPI = async (prompt, options = {}) => {
	const {
		temperature = 0.7,
		maxTokens = 2000,
	} = options;
	
	const apiKey = process.env.GEMINI_API_KEY;
	
	if (!apiKey) {
		console.warn('GEMINI_API_KEY not configured, using placeholder data');
		return null;
	}
	
	try {
		// TODO: Install @google/generative-ai package
		// npm install @google/generative-ai
		
		// const { GoogleGenerativeAI } = require('@google/generative-ai');
		// const genAI = new GoogleGenerativeAI(apiKey);
		// const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
		
		// const result = await model.generateContent({
		//   contents: [{ role: 'user', parts: [{ text: prompt }] }],
		//   generationConfig: {
		//     temperature,
		//     maxOutputTokens: maxTokens,
		//   },
		// });
		
		// const response = result.response;
		// const text = response.text();
		// return JSON.parse(text);
		
		// For now, return null to use placeholder
		return null;
	} catch (error) {
		console.error('Gemini API error:', error.message);
		return null;
	}
};

/**
 * Generate content with AI
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} Generated content
 */
export const generateWithAI = async (params) => {
	const {
		type, // 'vocabulary' or 'kanji'
		templateName,
		count = 10,
		existingItems = [],
		customPrompt = '',
		autoFormat = true,
	} = params;
	
	// Build prompt from template
	const existingKey = type === 'kanji' ? 'existingChars' : 'existingWords';
	const prompt = getAIPrompt(type, templateName, {
		count,
		[existingKey]: existingItems,
		customVariables: {
			customPrompt,
		},
	});
	
	// Call Gemini API
	const aiResponse = await callGeminiAPI(prompt, {
		temperature: 0.7,
		maxTokens: 2000,
	});
	
	// If AI response available, use it
	if (aiResponse && Array.isArray(aiResponse)) {
		return {
			items: aiResponse,
			source: 'gemini',
			promptUsed: prompt,
		};
	}
	
	// Otherwise, generate placeholder data
	const items = type === 'kanji' 
		? generatePlaceholderKanji({ count, existingItems, templateName, customPrompt })
		: generatePlaceholderVocabulary({ count, existingItems, templateName, customPrompt });
	
	return {
		items,
		source: 'placeholder',
		promptUsed: prompt,
	};
};

/**
 * Generate vocabulary using AI
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated vocabulary
 */
export const generateVocabularyWithAI = async (options) => {
	const result = await generateWithAI({
		type: 'vocabulary',
		...options,
	});
	
	return {
		vocabulary: result.items,
		source: result.source,
		promptUsed: result.promptUsed,
		templateName: options.templateName,
	};
};

/**
 * Generate kanji using AI
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated kanji
 */
export const generateKanjiWithAI = async (options) => {
	const result = await generateWithAI({
		type: 'kanji',
		...options,
	});
	
	return {
		kanji: result.items,
		source: result.source,
		promptUsed: result.promptUsed,
		templateName: options.templateName,
	};
};

/**
 * Translate text using AI
 * @param {Object} options - Translation options
 * @returns {Promise<string>} Translated text
 */
export const translateWithAI = async (options) => {
	const {
		text,
		sourceLang = 'ja',
		targetLang = 'vi',
	} = options;
	
	const prompt = `Translate the following ${sourceLang} text to ${targetLang}:\n\n${text}\n\nProvide only the translation, no explanations.`;
	
	const response = await callGeminiAPI(prompt, {
		temperature: 0.3,
		maxTokens: 500,
	});
	
	if (response && typeof response === 'string') {
		return response;
	}
	
	return `[Translation placeholder] ${text}`;
};

// ============ PLACEHOLDER GENERATORS ============

/**
 * Generate placeholder vocabulary data
 * @private
 */
function generatePlaceholderVocabulary({ count, existingItems, templateName, customPrompt }) {
	const vocabulary = [];
	const existingSet = new Set(existingItems);
	let attemptCount = 0;
	const maxAttempts = count * 3;
	
	while (vocabulary.length < count && attemptCount < maxAttempts) {
		attemptCount++;
		const word = `単語${attemptCount}`;
		
		if (existingSet.has(word)) {
			continue;
		}
		
		vocabulary.push({
			word,
			reading: `たんご${attemptCount}`,
			meaning: `Từ vựng ${attemptCount} - Template: ${templateName}${customPrompt ? ` - ${customPrompt}` : ''}`,
			meaningJa: `単語${attemptCount}の意味`,
			example: `これは単語${attemptCount}の例文です。`,
			exampleMeaning: `Đây là câu ví dụ cho từ ${attemptCount}.`,
			partOfSpeech: 'noun',
		});
		
		existingSet.add(word);
	}
	
	return vocabulary;
}

/**
 * Generate placeholder kanji data
 * @private
 */
function generatePlaceholderKanji({ count, existingItems, templateName, customPrompt }) {
	const kanji = [];
	const existingSet = new Set(existingItems);
	let attemptCount = 0;
	const maxAttempts = count * 3;
	
	while (kanji.length < count && attemptCount < maxAttempts) {
		attemptCount++;
		const char = `字${attemptCount}`;
		
		if (existingSet.has(char)) {
			continue;
		}
		
		kanji.push({
			char,
			onYomi: `オン${attemptCount}`,
			kunYomi: `くん${attemptCount}`,
			hanViet: `Hán ${attemptCount}`,
			meaningVi: `Nghĩa ${attemptCount} - Template: ${templateName}${customPrompt ? ` - ${customPrompt}` : ''}`,
			vocabJa: `単語${attemptCount}（たんご${attemptCount}）`,
			exampleJa: `これは例文${attemptCount}です。`,
			exampleVi: `Đây là câu ví dụ ${attemptCount}.`,
		});
		
		existingSet.add(char);
	}
	
	return kanji;
}
