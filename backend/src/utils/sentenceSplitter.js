import { createHash } from 'crypto';
import { passageMarkupToPlainText } from './passageMarkup.js';

const TERMINATORS = new Set(['。', '！', '？', '!', '?']);
const OPENERS = new Set(['「', '『', '（', '(', '【', '〈', '《']);
const CLOSERS = new Set(['」', '』', '）', ')', '】', '〉', '》']);
/** Quoted speech followed by these chars continues the same sentence: 「…。」と言った。 */
const QUOTE_CONTINUATIONS = new Set(['と', 'っ']);

export const MAX_ARTICLE_SENTENCES = 120;

const countOf = (text, token) => text.split(token).length - 1;

/** Markup pairs must not be cut across two sentences. */
const hasUnbalancedMarkup = (text) =>
	countOf(text, '**') % 2 !== 0 ||
	countOf(text, '__') % 2 !== 0 ||
	countOf(text, '==') % 2 !== 0 ||
	countOf(text, '~~') % 2 !== 0 ||
	countOf(text, '[[') !== countOf(text, ']]') ||
	countOf(text, '{') !== countOf(text, '}');

/**
 * @param {string} text
 * @returns {string[]}
 */
function splitRaw(text) {
	const chunks = [];
	let current = '';
	let depth = 0;
	const chars = Array.from(text);

	for (let i = 0; i < chars.length; i += 1) {
		const ch = chars[i];
		const next = chars[i + 1] ?? '';

		if (ch === '\n') {
			chunks.push(current);
			current = '';
			depth = 0;
			continue;
		}
		current += ch;

		if (OPENERS.has(ch)) depth += 1;
		if (CLOSERS.has(ch)) {
			depth = Math.max(0, depth - 1);
			const prev = chars[i - 1] ?? '';
			if (depth === 0 && TERMINATORS.has(prev) && !QUOTE_CONTINUATIONS.has(next) && !CLOSERS.has(next)) {
				chunks.push(current);
				current = '';
			}
			continue;
		}
		if (TERMINATORS.has(ch) && depth === 0 && !TERMINATORS.has(next) && !CLOSERS.has(next)) {
			chunks.push(current);
			current = '';
		}
	}
	chunks.push(current);
	return chunks;
}

/**
 * @param {string[]} chunks
 * @returns {string[]}
 */
function mergeUnbalanced(chunks) {
	const merged = [];
	let buffer = '';
	for (const chunk of chunks) {
		buffer += chunk;
		if (!hasUnbalancedMarkup(buffer)) {
			merged.push(buffer);
			buffer = '';
		}
	}
	if (buffer) merged.push(buffer);
	return merged;
}

/**
 * Tách bài đọc thành câu theo quy tắc cố định (không dùng AI) để ô dịch của học viên
 * luôn khớp 1:1 với phân tích đã lưu.
 * @param {{ paragraphsJa?: string[], contentFormat?: string }} article
 * @returns {{ index: number, paragraphIndex: number, textJa: string, plainJa: string }[]}
 */
export function splitArticleSentences(article) {
	const isMarkup = article?.contentFormat === 'markup';
	const sentences = [];

	(article?.paragraphsJa ?? []).forEach((paragraph, paragraphIndex) => {
		const raw = String(paragraph ?? '');
		const chunks = isMarkup ? mergeUnbalanced(splitRaw(raw)) : splitRaw(raw);
		for (const chunk of chunks) {
			const textJa = chunk.trim();
			if (!textJa || sentences.length >= MAX_ARTICLE_SENTENCES) continue;
			const plainJa = (isMarkup ? passageMarkupToPlainText(textJa) : textJa).trim();
			if (!plainJa) continue;
			sentences.push({ index: sentences.length, paragraphIndex, textJa, plainJa });
		}
	});

	return sentences;
}

/**
 * @param {{ plainJa: string }[]} sentences
 * @returns {string}
 */
export function hashSentences(sentences) {
	return createHash('sha256')
		.update(sentences.map((s) => s.plainJa).join('\n'))
		.digest('hex');
}
