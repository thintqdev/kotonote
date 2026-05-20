import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as promptRepository from '../repositories/promptRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load prompt template from file
 * @param {string} type - 'vocabulary' or 'kanji'
 * @param {string} level - JLPT level (N5, N4, N3, N2, N1)
 * @param {string} category - Optional category (e.g., 'basic', 'daily', 'intermediate')
 * @returns {string} Prompt template
 */
export const loadPromptTemplate = (type, level, category = 'basic') => {
	try {
		const promptsDir = path.join(__dirname, '../../prompts', type);
		const levelLower = level.toLowerCase();
		
		// Try specific category file first
		const categoryFile = path.join(promptsDir, `${levelLower}-${category}.txt`);
		if (fs.existsSync(categoryFile)) {
			return fs.readFileSync(categoryFile, 'utf-8');
		}
		
		// Fallback to basic file
		const basicFile = path.join(promptsDir, `${levelLower}-basic.txt`);
		if (fs.existsSync(basicFile)) {
			return fs.readFileSync(basicFile, 'utf-8');
		}
		
		// Return default template if no file found
		return getDefaultTemplate(type, level);
	} catch (error) {
		console.error(`Error loading prompt template: ${error.message}`);
		return getDefaultTemplate(type, level);
	}
};

/**
 * Replace placeholders in prompt template
 * @param {string} template - Prompt template
 * @param {Object} variables - Variables to replace
 * @returns {string} Processed prompt
 */
export const processPromptTemplate = (template, variables = {}) => {
	let processed = template;
	
	for (const [key, value] of Object.entries(variables)) {
		const placeholder = `{{${key}}}`;
		processed = processed.replace(new RegExp(placeholder, 'g'), value);
	}
	
	return processed;
};

/**
 * Get default template if file not found
 */
const getDefaultTemplate = (type, level) => {
	if (type === 'vocabulary') {
		return `Generate {{count}} Japanese vocabulary words for JLPT ${level} level.

Requirements:
- Level: ${level}
- Each word must include:
  * word: Japanese word in kanji
  * reading: hiragana/katakana reading
  * meaningVi: Vietnamese meaning
  * meaningJa: Japanese explanation
  * exampleSentence: Example sentence
  * exampleMeaning: Vietnamese translation

Format as JSON array.
Avoid duplicates with existing words: {{existingWords}}`;
	}
	
	if (type === 'kanji') {
		return `Generate {{count}} Kanji characters for JLPT ${level} level.

Requirements:
- Level: ${level}
- Each kanji must include:
  * char: Single kanji character
  * onYomi: On-reading in katakana
  * kunYomi: Kun-reading in hiragana
  * hanViet: Sino-Vietnamese reading
  * meaningVi: Vietnamese meaning
  * vocabJa: Common vocabulary using this kanji
  * exampleJa: Example sentence
  * exampleVi: Vietnamese translation

Format as JSON array.
Avoid duplicates with existing kanji: {{existingChars}}`;
	}

	if (type === 'grammar') {
		return `Create one JLPT {{jlpt}} grammar lesson as a single JSON object.
Pattern hint: {{patternHint}}
Admin notes: {{customPrompt}}
Include pattern, teaser, meaning, usage, examples (ja/vi), ng, compare, memo, practice.items.`;
	}

	if (type === 'reading') {
		return `Create one JLPT {{jlpt}} reading article as JSON object.
Admin notes: {{customPrompt}}
Include titleJa, snippetJa, paragraphsJa[], vocabulary[], questions[] with choicesJa and explainPerChoice.`;
	}

	return '';
};

/**
 * Build full prompt with context (main export function)
 * @param {string} type - 'vocabulary' or 'kanji'
 * @param {string} templateName - Template filename without extension (e.g., 'n3-daily', 'n5-basic')
 * @param {Object} options - Prompt options
 * @returns {string} Full prompt
 */
export const getAIPrompt = (type, templateName, options = {}) => {
	const {
		count = 10,
		existingWords = [],
		existingChars = [],
		customVariables = {},
		templateContent,
	} = options;

	const template =
		templateContent ?? loadPromptTemplateByName(type, templateName);
	
	// Prepare variables
	const existingKey = type === 'kanji' ? 'existingChars' : 'existingWords';
	const existingItems = type === 'kanji' ? existingChars : existingWords;
	const existingValue = existingItems.length > 0 
		? existingItems.join(', ') 
		: 'none';
	
	const variables = {
		count: count.toString(),
		[existingKey]: existingValue,
		jlpt: String(customVariables.jlpt ?? 'N5'),
		patternHint: String(customVariables.patternHint ?? 'không có'),
		customPrompt: String(customVariables.customPrompt ?? ''),
		...customVariables,
	};
	
	// Process template
	const prompt = processPromptTemplate(template, variables);
	
	return prompt;
};

/**
 * Build prompt — ưu tiên template trong DB, fallback file .txt
 */
export const getAIPromptAsync = async (type, templateName, options = {}) => {
	const doc = await promptRepository.findActivePromptByTypeAndKey(
		type,
		templateName
	);
	const dbContent = doc?.content ?? null;
	return getAIPrompt(type, templateName, {
		...options,
		templateContent: dbContent ?? undefined,
	});
};

/**
 * Load prompt template by name
 */
const loadPromptTemplateByName = (type, templateName) => {
	try {
		const promptsDir = path.join(__dirname, '../../prompts', type);
		const templateFile = path.join(promptsDir, `${templateName}.txt`);
		
		if (fs.existsSync(templateFile)) {
			return fs.readFileSync(templateFile, 'utf-8');
		}
		
		// Fallback to default
		return getDefaultTemplate(type, 'N5');
	} catch (error) {
		console.error(`Error loading prompt template: ${error.message}`);
		return getDefaultTemplate(type, 'N5');
	}
};
