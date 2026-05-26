import { GoogleGenerativeAI } from '@google/generative-ai';
import {
	GEMINI_MODEL,
	getGeminiApiKeys,
	shouldTryNextGeminiKey,
} from '../config/gemini.js';
import { getAIPromptAsync } from '../utils/promptLoader.js';
import {
	parseJsonArrayFromAIText,
	parseJsonFromAIText,
	parseJsonObjectLenient,
} from '../utils/aiJsonParse.js';
import { normalizeGrammarFromAI } from '../utils/aiGrammarNormalize.js';
import { normalizeReadingArticleFromAI } from '../utils/aiReadingNormalize.js';
import { normalizeKaiwaContextFromAI } from '../utils/aiKaiwaNormalize.js';
import {
	getDeckBundleJsonSuffix,
	normalizeDeckItemsBundleFromAI,
} from '../utils/aiDeckBundleNormalize.js';

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
/**
 * @param {string} apiKey
 * @param {string} prompt
 * @param {{ temperature?: number, maxTokens?: number, arrayMode?: boolean, jsonMode?: boolean }} options
 */
async function invokeGeminiWithKey(apiKey, prompt, options = {}) {
	const { temperature = 0.7, maxTokens = 8192, arrayMode = true, jsonMode = true } =
		options;

	const genAI = new GoogleGenerativeAI(apiKey);
	const generationConfig = {
		temperature,
		maxOutputTokens: maxTokens,
	};
	if (jsonMode) {
		generationConfig.responseMimeType = 'application/json';
	}

	const model = genAI.getGenerativeModel({
		model: GEMINI_MODEL,
		generationConfig,
	});

	const suffix = jsonMode
		? arrayMode
			? 'Return ONLY a valid JSON array. No markdown, no extra text.'
			: 'Return ONLY a valid JSON object. No markdown, no extra text.'
		: '';
	const fullPrompt = suffix ? `${prompt}\n\n${suffix}` : prompt;
	const result = await model.generateContent(fullPrompt);
	const responseText = result.response.text();

	if (!jsonMode) {
		return responseText?.trim() ?? '';
	}

	return arrayMode
		? parseJsonArrayFromAIText(responseText)
		: parseJsonFromAIText(responseText);
}

/**
 * @param {string} prompt
 * @param {{ temperature?: number, maxTokens?: number, arrayMode?: boolean }} [options]
 */
export const callGeminiAPI = async (prompt, options = {}) => {
	const keys = getGeminiApiKeys();
	if (!keys.length) {
		console.warn('GEMINI_API_KEYS not configured, using placeholder data');
		return null;
	}

	const arrayMode = options.arrayMode !== false;
	let lastError = null;

	for (let i = 0; i < keys.length; i += 1) {
		try {
			return await invokeGeminiWithKey(keys[i], prompt, {
				...options,
				arrayMode,
				jsonMode: true,
			});
		} catch (error) {
			lastError = error;
			console.error(
				`Gemini API error (key ${i + 1}/${keys.length}):`,
				/** @type {Error} */ (error).message,
			);
			if (shouldTryNextGeminiKey(error) && i < keys.length - 1) {
				console.warn(
					`Trying next Gemini API key (${i + 2}/${keys.length})…`,
				);
				continue;
			}
			if (!arrayMode) {
				const responseText = String(
					/** @type {{ responseText?: string }} */ (error)?.responseText ?? '',
				);
				if (responseText) {
					try {
						return parseJsonObjectLenient(responseText);
					} catch (lenientErr) {
						console.error(
							'Gemini lenient JSON parse failed:',
							/** @type {Error} */ (lenientErr).message,
						);
					}
				}
			}
			break;
		}
	}

	if (lastError) {
		console.error(
			'All Gemini API keys failed:',
			/** @type {Error} */ (lastError).message,
		);
	}
	return null;
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
	const basePrompt = await getAIPromptAsync(type, templateName, {
		count,
		[existingKey]: existingItems,
		customVariables: {
			customPrompt,
		},
	});
	const prompt = `${basePrompt}\n\n${getDeckBundleJsonSuffix(type)}`;

	const aiResponse = await callGeminiAPI(prompt, {
		temperature: 0.7,
		maxTokens: 8192,
		arrayMode: false,
	});

	if (aiResponse && (Array.isArray(aiResponse) || typeof aiResponse === 'object')) {
		const bundle = normalizeDeckItemsBundleFromAI(aiResponse, type);
		if (bundle.items.length > 0) {
			return {
				items: bundle.items,
				deck: bundle.deck,
				source: 'gemini',
				promptUsed: prompt,
			};
		}
	}

	const placeholderItems =
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

	const placeholderDeck =
		type === 'kanji'
			? {
					titleVi: `Deck Kanji ${String(customPrompt || templateName).slice(0, 40)}`,
					titleJa: '漢字デッキ',
					descriptionVi: 'Deck mẫu (placeholder).',
					descriptionJa: 'プレースホルダー',
				}
			: {
					title: `Deck từ vựng ${String(customPrompt || templateName).slice(0, 40)}`,
					titleJa: '語彙デッキ',
					description: 'Deck mẫu (placeholder).',
					descriptionJa: 'プレースホルダー',
				};

	return {
		items: placeholderItems,
		deck: placeholderDeck,
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
		deck: result.deck ?? null,
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
		deck: result.deck ?? null,
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
export const generateKaiwaContextWithAI = async (options) => {
	const {
		templateName,
		customPrompt = '',
		jlpt = 'N5',
		category = 'daily',
	} = options;

	const prompt = await getAIPromptAsync('kaiwa', templateName, {
		customVariables: {
			jlpt: String(jlpt).toUpperCase(),
			category: String(category),
			customPrompt: String(customPrompt).trim() || 'không có',
		},
	});

	const aiResponse = await callGeminiAPI(prompt, {
		temperature: 0.75,
		maxTokens: 8192,
		arrayMode: false,
	});

	if (aiResponse && typeof aiResponse === 'object') {
		const context = normalizeKaiwaContextFromAI(aiResponse);
		if (context) {
			return {
				context,
				source: 'gemini',
				promptUsed: prompt,
				templateName,
			};
		}
	}

	return {
		context: generatePlaceholderKaiwaContext({ jlpt, category, customPrompt }),
		source: 'placeholder',
		promptUsed: prompt,
		templateName,
	};
};

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

	const keys = getGeminiApiKeys();
	if (!keys.length) {
		return `[Translation placeholder] ${text}`;
	}

	for (let i = 0; i < keys.length; i += 1) {
		try {
			const translated = await invokeGeminiWithKey(keys[i], prompt, {
				temperature: 0.3,
				maxTokens: 2048,
				jsonMode: false,
			});
			return translated || `[Translation placeholder] ${text}`;
		} catch (error) {
			console.error(
				`Gemini translate error (key ${i + 1}/${keys.length}):`,
				/** @type {Error} */ (error).message,
			);
			if (shouldTryNextGeminiKey(error) && i < keys.length - 1) {
				continue;
			}
		}
	}

	return `[Translation placeholder] ${text}`;
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
			vi: `Placeholder — ${customPrompt || 'GEMINI_API_KEYS chưa cấu hình'}`,
		},
		practice: {
			items: [
				{ ja: '練習文。', vi: 'Câu luyện tập.' },
			],
		},
	};
}

function generatePlaceholderKaiwaContext({ jlpt, category, customPrompt }) {
	const catLabel = String(category || 'daily');
	return {
		titleVi: `Tình huống hội thoại ${jlpt} — ${catLabel}`,
		titleJa: `${jlpt}会話シチュエーション`,
		settingVi: 'Quán cà phê nhỏ ở Tokyo',
		settingJa: '東京の小さなカフェ',
		situationVi: `Bạn (học viên ${jlpt}) gặp nhân viên quán. ${customPrompt ? `Gợi ý: ${customPrompt}. ` : ''}Đây là bối cảnh placeholder — hãy cấu hình GEMINI_API_KEYS trong .env để generate bằng AI.`,
		situationJa: 'カフェで店員と話す場面です。',
		objectivesVi:
			'- Chào hỏi lịch sự\n- Gọi món đơn giản\n- Cảm ơn và thanh toán',
		objectivesJa: '挨拶・注文・お礼',
		roles: [
			{
				nameVi: 'Học viên',
				nameJa: '学習者',
				descriptionVi: 'Khách hàng đang luyện nói',
				descriptionJa: '日本語を練習する客',
			},
			{
				nameVi: 'Nhân viên',
				nameJa: '店員',
				descriptionVi: 'Nhân viên phục vụ thân thiện',
				descriptionJa: '丁寧な店員',
			},
		],
		keyPhrases: [
			{
				phraseJa: 'いらっしゃいませ',
				reading: 'いらっしゃいませ',
				meaningVi: 'Xin chào (nhân viên)',
			},
			{
				phraseJa: '〜をください',
				reading: '〜をください',
				meaningVi: 'Cho tôi …',
			},
		],
		culturalNotesVi: 'Giữ giọng lịch sự (です・ます) với nhân viên.',
		culturalNotesJa: '店員には丁寧語を使います。',
	};
}

function generatePlaceholderReading({ jlpt, customPrompt }) {
	const titleJa = `読解サンプル（${jlpt}）`;
	return {
		titleJa,
		snippetJa: '短い紹介文です。',
		paragraphsJa: [
			'これはプレースホルダーの文章です。',
			'二段落目です。GEMINI_API_KEYSを設定してください。',
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
