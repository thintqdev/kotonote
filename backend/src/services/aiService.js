import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAIPromptAsync } from '../utils/promptLoader.js';
import {
	parseJsonArrayFromAIText,
	parseJsonFromAIText,
} from '../utils/aiJsonParse.js';
import { normalizeVocabularyListFromAI } from '../utils/aiVocabularyNormalize.js';
import { normalizeKanjiListFromAI } from '../utils/aiKanjiNormalize.js';
import { normalizeGrammarFromAI } from '../utils/aiGrammarNormalize.js';
import { normalizeReadingArticleFromAI } from '../utils/aiReadingNormalize.js';

/**
 * AI Service — Gemini + placeholder fallback
 */

/**
 * @param {string} prompt
 * @param {Object} [options]
 * @returns {Promise<unknown[] | null>}
 */
/**
 * @param {string} prompt
 * @param {{ temperature?: number, maxTokens?: number, arrayMode?: boolean }} [options]
 */
export const callGeminiAPI = async (prompt, options = {}) => {
	const { temperature = 0.7, maxTokens = 8192 } = options;

	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		console.warn('GEMINI_API_KEY not configured, using placeholder data');
		return null;
	}

	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
		const model = genAI.getGenerativeModel({
			model: modelName,
			generationConfig: {
				temperature,
				maxOutputTokens: maxTokens,
				responseMimeType: 'application/json',
			},
		});

		const arrayMode = options.arrayMode !== false;
		const suffix = arrayMode
			? 'Return ONLY a valid JSON array. No markdown, no extra text.'
			: 'Return ONLY a valid JSON object. No markdown, no extra text.';
		const fullPrompt = `${prompt}\n\n${suffix}`;
		const result = await model.generateContent(fullPrompt);
		const text = result.response.text();
		return arrayMode
			? parseJsonArrayFromAIText(text)
			: parseJsonFromAIText(text);
	} catch (error) {
		console.error('Gemini API error:', error.message);
		return null;
	}
};

/**
 * @param {Object} params
 */
export const generateWithAI = async (params) => {
	const {
		type,
		templateName,
		count = 10,
		existingItems = [],
		customPrompt = '',
	} = params;

	const existingKey = type === 'kanji' ? 'existingChars' : 'existingWords';
	const prompt = await getAIPromptAsync(type, templateName, {
		count,
		[existingKey]: existingItems,
		customVariables: {
			customPrompt,
		},
	});

	const aiResponse = await callGeminiAPI(prompt, {
		temperature: 0.7,
		maxTokens: 8192,
	});

	if (aiResponse && Array.isArray(aiResponse)) {
		const items =
			type === 'vocabulary'
				? normalizeVocabularyListFromAI(aiResponse)
				: type === 'kanji'
					? normalizeKanjiListFromAI(aiResponse)
					: aiResponse;

		return {
			items,
			source: 'gemini',
			promptUsed: prompt,
		};
	}

	const items =
		type === 'kanji'
			? generatePlaceholderKanji({
					count,
					existingItems,
					templateName,
					customPrompt,
				})
			: generatePlaceholderVocabulary({
					count,
					existingItems,
					templateName,
					customPrompt,
				});

	return {
		items,
		source: 'placeholder',
		promptUsed: prompt,
	};
};

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
 * Generate một bài ngữ pháp (object JSON).
 */
export const generateGrammarWithAI = async (options) => {
	const {
		templateName,
		customPrompt = '',
		jlpt = 'N5',
		patternHint = '',
	} = options;

	const prompt = await getAIPromptAsync('grammar', templateName, {
		customVariables: {
			jlpt: String(jlpt).toUpperCase(),
			patternHint: String(patternHint).trim() || 'không có',
			customPrompt: String(customPrompt).trim() || 'không có',
		},
	});

	const aiResponse = await callGeminiAPI(prompt, {
		temperature: 0.7,
		maxTokens: 8192,
		arrayMode: false,
	});

	if (aiResponse && typeof aiResponse === 'object') {
		const grammar = normalizeGrammarFromAI(aiResponse);
		if (grammar) {
			return {
				grammar,
				source: 'gemini',
				promptUsed: prompt,
				templateName,
			};
		}
	}

	return {
		grammar: generatePlaceholderGrammar({ jlpt, patternHint, customPrompt }),
		source: 'placeholder',
		promptUsed: prompt,
		templateName,
	};
};

/**
 * Generate một bài đọc hiểu (object JSON).
 */
export const generateReadingWithAI = async (options) => {
	const {
		templateName,
		customPrompt = '',
		jlpt = 'N5',
	} = options;

	const prompt = await getAIPromptAsync('reading', templateName, {
		customVariables: {
			jlpt: String(jlpt).toUpperCase(),
			customPrompt: String(customPrompt).trim() || 'không có',
		},
	});

	const aiResponse = await callGeminiAPI(prompt, {
		temperature: 0.7,
		maxTokens: 8192,
		arrayMode: false,
	});

	if (aiResponse && typeof aiResponse === 'object') {
		const article = normalizeReadingArticleFromAI(aiResponse);
		if (article) {
			return {
				article,
				source: 'gemini',
				promptUsed: prompt,
				templateName,
			};
		}
	}

	return {
		article: generatePlaceholderReading({ jlpt, customPrompt }),
		source: 'placeholder',
		promptUsed: prompt,
		templateName,
	};
};

export const translateWithAI = async (options) => {
	const { text, sourceLang = 'ja', targetLang = 'vi' } = options;

	const prompt = `Translate the following ${sourceLang} text to ${targetLang}:\n\n${text}\n\nProvide only the translation, no explanations.`;

	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		return `[Translation placeholder] ${text}`;
	}

	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({
			model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
		});
		const result = await model.generateContent(prompt);
		const translated = result.response.text()?.trim();
		return translated || `[Translation placeholder] ${text}`;
	} catch (error) {
		console.error('Gemini translate error:', error.message);
		return `[Translation placeholder] ${text}`;
	}
};

function generatePlaceholderVocabulary({ count, existingItems, templateName, customPrompt }) {
	const vocabulary = [];
	const existingSet = new Set(existingItems);
	let attemptCount = 0;
	const maxAttempts = count * 3;

	while (vocabulary.length < count && attemptCount < maxAttempts) {
		attemptCount += 1;
		const word = `単語${attemptCount}`;

		if (existingSet.has(word)) {
			continue;
		}

		vocabulary.push({
			word,
			reading: `たんご${attemptCount}`,
			meaning: `Từ vựng ${attemptCount} — ${templateName}${customPrompt ? ` (${customPrompt})` : ''}`,
			meaningJa: `単語${attemptCount}の意味`,
			example: `これは単語${attemptCount}の例文です。`,
			exampleMeaning: `Đây là câu ví dụ cho từ ${attemptCount}.`,
			partOfSpeech: 'noun',
		});

		existingSet.add(word);
	}

	return vocabulary;
}

function generatePlaceholderKanji({ count, existingItems, templateName, customPrompt }) {
	const kanji = [];
	const existingSet = new Set(existingItems);
	let attemptCount = 0;
	const maxAttempts = count * 3;

	while (kanji.length < count && attemptCount < maxAttempts) {
		attemptCount += 1;
		const char = `字${attemptCount}`;

		if (existingSet.has(char)) {
			continue;
		}

		kanji.push({
			char,
			onYomi: `オン${attemptCount}`,
			kunYomi: `くん${attemptCount}`,
			hanViet: `Hán ${attemptCount}`,
			meaningVi: `Nghĩa ${attemptCount} — ${templateName}${customPrompt ? ` (${customPrompt})` : ''}`,
			vocabJa: `単語${attemptCount}（たんご${attemptCount}）`,
			exampleJa: `これは例文${attemptCount}です。`,
			exampleVi: `Đây là câu ví dụ ${attemptCount}.`,
		});

		existingSet.add(char);
	}

	return kanji;
}

function generatePlaceholderGrammar({ jlpt, patternHint, customPrompt }) {
	const pattern =
		String(patternHint).trim() ||
		`〜プレースホルダー（${jlpt}）`;
	return {
		pattern,
		teaser: {
			ja: `${pattern}の使い方`,
			vi: `Cách dùng ${pattern}`,
		},
		topicRibbon: { ja: '文法', vi: 'Ngữ pháp' },
		connection: {
			ja: '前の文法と関連します。',
			vi: 'Liên quan đến ngữ pháp trước.',
		},
		meaning: {
			ja: '意味の説明（プレースホルダー）',
			vi: 'Giải thích nghĩa (placeholder)',
		},
		usage: {
			ja: '使い方の説明',
			vi: 'Hướng dẫn sử dụng',
		},
		usageNote: { ja: '', vi: 'Lưu ý khi dùng' },
		pointBubble: {
			ja: 'ポイント',
			vi: 'Điểm cần nhớ',
		},
		examples: [
			{
				ja: 'これは例文です。',
				vi: 'Đây là câu ví dụ.',
			},
			{
				ja: 'もう一つの例文です。',
				vi: 'Đây là câu ví dụ thứ hai.',
			},
		],
		ng: {
			ja: ['間違った例文。'],
			vi: ['Câu sai.'],
		},
		ngNote: { ja: '', vi: 'Tránh dùng sai ngữ cảnh' },
		compare: {
			caption: { ja: '比較', vi: 'So sánh' },
			colLabels: [],
			rows: [],
		},
		memo: {
			ja: 'メモ',
			vi: `Placeholder — ${customPrompt || 'GEMINI_API_KEY chưa cấu hình'}`,
		},
		practice: {
			items: [
				{ ja: '練習文。', vi: 'Câu luyện tập.' },
			],
		},
	};
}

function generatePlaceholderReading({ jlpt, customPrompt }) {
	const titleJa = `読解サンプル（${jlpt}）`;
	return {
		titleJa,
		snippetJa: '短い紹介文です。',
		paragraphsJa: [
			'これはプレースホルダーの文章です。',
			'二段落目です。GEMINI_API_KEYを設定してください。',
		],
		vocabulary: [
			{
				termJa: '単語',
				gloss: { vi: 'từ vựng', ja: 'ことば' },
			},
		],
		questions: [
			{
				questionJa: 'この文章の主題は何ですか。',
				choicesJa: ['選択肢A', '選択肢B', '選択肢C'],
				answerIndex: 0,
				explainPerChoice: {
					ja: ['正解', '不正解', '不正解'],
					vi: ['Đúng', 'Sai', 'Sai'],
				},
			},
		],
	};
}
