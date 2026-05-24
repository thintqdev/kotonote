import { AI_JAPANESE_OUTPUT_RULES } from '../constants/aiJapaneseOutputRules.js';
import { JOURNAL } from '../constants/messages.js';
import { callGeminiAPI } from './aiService.js';
import { normalizeJournalAnalysisFromAI } from '../utils/aiJournalNormalize.js';

/**
 * @param {string} contentJa
 * @param {string} jlpt
 * @param {boolean} compact
 */
function buildJournalAnalysisPrompt(contentJa, jlpt, compact = false) {
	const sentenceLimit = compact ? 5 : 10;
	const maxSuggest = compact ? 1 : 2;

	return `You are a Japanese writing coach for Vietnamese learners (JLPT ${jlpt} diary).

${AI_JAPANESE_OUTPUT_RULES}

Analyze the diary below. Rules:
- Analyze at most ${sentenceLimit} sentences (merge extra text into the last analyzed sentence if needed).
- feedbackVi: max 100 Vietnamese characters per sentence.
- At most ${maxSuggest} wordSuggestions per sentence; omit if none.
- Escape double quotes inside JSON strings as \\".
- Keep responses concise to fit JSON output.

DIARY:
${contentJa}

Return ONLY one JSON object (no markdown):
{
  "overallScore": number,
  "levelEstimate": string,
  "summaryVi": string,
  "strengthsVi": string[],
  "improvementsVi": string[],
  "sentences": [
    {
      "index": number,
      "textJa": string,
      "reading": string,
      "translationVi": string,
      "feedbackVi": string,
      "wordSuggestions": [
        { "original": string, "suggestedJa": string, "suggestedReading": string, "reasonVi": string }
      ]
    }
  ]
}`;
}

/**
 * @param {string} contentJa
 * @param {string} jlpt
 */
function placeholderAnalysis(contentJa, jlpt) {
	const chunks = contentJa
		.split(/[。！？\n]+/)
		.map((s) => s.trim())
		.filter(Boolean);
	const sentences = (chunks.length ? chunks : [contentJa.slice(0, 120)]).map(
		(textJa, index) => ({
			index,
			textJa,
			reading: '',
			translationVi: '(Phân tích mẫu — kiểm tra GEMINI_API_KEY hoặc thử lại sau)',
			feedbackVi: 'Hãy kiểm tra trợ động từ và cách kết thúc câu trong nhật ký.',
			wordSuggestions: [],
		}),
	);

	return {
		analysis: {
			overallScore: 70,
			levelEstimate: jlpt,
			summaryVi:
				'Không kết nối được AI lúc này — bài đã lưu với phân tích cơ bản. Thử lại sau.',
			strengthsVi: ['Bạn đã viết được đoạn nhật ký bằng tiếng Nhật.'],
			improvementsVi: ['Thử dùng câu dài hơn và từ nối phù hợp với nhật ký.'],
			sentences,
		},
		source: 'placeholder',
	};
}

/**
 * @param {string} contentJa
 * @param {string} jlpt
 * @param {boolean} compact
 */
async function callJournalGemini(contentJa, jlpt, compact) {
	const prompt = buildJournalAnalysisPrompt(contentJa, jlpt, compact);
	return callGeminiAPI(prompt, {
		temperature: 0.45,
		maxTokens: 8192,
		arrayMode: false,
	});
}

/**
 * @param {{ contentJa: string, jlpt?: string }} params
 */
export const analyzeJournalContent = async ({ contentJa, jlpt = 'N4' }) => {
	const trimmed = String(contentJa ?? '').trim();
	if (!trimmed) {
		throw { messageCode: JOURNAL.CONTENT_REQUIRED, statusCode: 400 };
	}

	const level = ['N5', 'N4', 'N3', 'N2', 'N1'].includes(jlpt) ? jlpt : 'N4';
	const normalizeOpts = { contentJa: trimmed, jlpt: level };

	let aiRaw = await callJournalGemini(trimmed, level, false);
	let normalized = normalizeJournalAnalysisFromAI(aiRaw, normalizeOpts);

	if (!normalized) {
		aiRaw = await callJournalGemini(trimmed, level, true);
		normalized = normalizeJournalAnalysisFromAI(aiRaw, normalizeOpts);
	}

	if (normalized) {
		return { analysis: normalized, source: 'gemini' };
	}

	if (!process.env.GEMINI_API_KEY) {
		return placeholderAnalysis(trimmed, level);
	}

	// API key có nhưng Gemini/parse lỗi — vẫn lưu bài với placeholder thay vì 503
	return placeholderAnalysis(trimmed, level);
};
