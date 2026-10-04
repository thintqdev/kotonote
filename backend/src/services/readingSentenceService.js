import { isGeminiConfigured } from '../config/gemini.js';
import { callGeminiAPI } from './aiService.js';
import * as readingRepository from '../repositories/readingRepository.js';
import * as sentenceAnalysisRepository from '../repositories/readingSentenceAnalysisRepository.js';
import { READING, COMMON } from '../constants/messages.js';
import { READING_SENTENCE_ROLES } from '../constants/reading.js';
import { hashSentences, splitArticleSentences } from '../utils/sentenceSplitter.js';
import AppError from '../utils/AppError.js';

const ANALYSIS_CHUNK_SIZE = 6;
const ANALYSIS_CONCURRENCY = 3;
const CONTEXT_MAX_CHARS = 8000;
const SEVERITIES = ['minor', 'important', 'critical'];
const VERDICTS = ['correct', 'partial', 'incorrect'];

const clean = (value, max = 1500) => String(value ?? '').trim().slice(0, max);
const asArray = (value, max) => (Array.isArray(value) ? value.slice(0, max) : []);
const clampScore = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

/** @param {{ index: number }[]} rows */
const toIndexMap = (rows = []) => {
	const map = new Map();
	for (const row of rows) {
		if (!map.has(row.index)) map.set(row.index, row);
	}
	return map;
};

/**
 * Ghép phần tử AI trả về với câu theo index. AI có thể trả `{results: [...]}`, array,
 * hoặc một object đơn khi chỉ có 1 câu.
 * @param {unknown} raw
 * @param {number[]} indices
 * @returns {Map<number, any>}
 */
function matchRowsByIndex(raw, indices) {
	let rows = [];
	if (Array.isArray(raw)) rows = raw;
	else if (Array.isArray(raw?.results)) rows = raw.results;
	else if (raw && typeof raw === 'object') rows = [raw];
	rows = rows.slice(0, indices.length * 2);

	if (indices.length === 1 && rows.length === 1) return new Map([[indices[0], rows[0]]]);
	const map = new Map();
	for (const row of rows) {
		const match = String(row?.index ?? '').match(/\d+/);
		const index = match ? Number(match[0]) : NaN;
		if (indices.includes(index) && !map.has(index)) map.set(index, row);
	}
	return map;
}

/**
 * @param {ReturnType<typeof splitArticleSentences>} sentences
 * @returns {string}
 */
function buildContext(sentences) {
	const paragraphs = [];
	for (const s of sentences) {
		paragraphs[s.paragraphIndex] = `${paragraphs[s.paragraphIndex] ?? ''}${s.plainJa}`;
	}
	return paragraphs.filter(Boolean).join('\n\n').slice(0, CONTEXT_MAX_CHARS);
}

function buildAnalysisPrompt({ article, context, targets }) {
	const list = targets.map((s) => `[${s.index}] ${s.plainJa}`).join('\n');
	return `Bạn là giáo viên ngữ pháp tiếng Nhật cho người Việt, trình độ ${article.jlpt}. Phân tích từng câu được đánh số trong bài "${article.titleJa}". Dùng toàn bài làm ngữ cảnh, đặc biệt để suy ra chủ ngữ bị lược.

Với mỗi câu:
- index: đúng số thứ tự trong ngoặc vuông.
- referenceVi: bản dịch tiếng Việt tự nhiên, trung thành, đúng ngữ cảnh.
- subject: chủ ngữ của mệnh đề chính. ja là cụm nguyên văn trong câu (giữ trợ từ は/が nếu có). Nếu bị lược thì implied=true, ja="" và vi là chủ ngữ suy ra từ ngữ cảnh. noteVi giải thích ngắn vì sao xác định như vậy.
- predicate: vị ngữ chính (thường ở cuối câu). ja nguyên văn, vi là nghĩa, noteVi nêu thời/thể/phủ định/kính ngữ/khả năng/bị động nếu có.
- components: chia câu thành các cụm theo đúng thứ tự xuất hiện. Mỗi ja PHẢI là chuỗi con nguyên văn của câu, ghép lại gần như ra câu gốc. role thuộc: ${READING_SENTENCE_ROLES.join('|')}. vi là nghĩa ngắn của cụm.
- structureVi: 1–3 câu mô tả cấu trúc (mệnh đề chính/phụ, mệnh đề bổ nghĩa cho danh từ, quan hệ logic giữa các vế).
- grammarPoints: tối đa 5 mẫu ngữ pháp, trợ từ hoặc cách chia đáng chú ý. pattern viết dạng chuẩn (ví dụ 〜ようにする), meaningVi là nghĩa, usageVi giải thích cách dùng trong chính câu này.
Không trả HTML hoặc Markdown.

BÀI ĐỌC (ngữ cảnh):
${context}

CÁC CÂU CẦN PHÂN TÍCH:
${list}

Trả về JSON object {"results":[...]}, mỗi phần tử trong results:
{"index":number,"referenceVi":string,"subject":{"ja":string,"vi":string,"implied":boolean,"noteVi":string},"predicate":{"ja":string,"vi":string,"noteVi":string},"components":[{"ja":string,"role":string,"vi":string}],"structureVi":string,"grammarPoints":[{"pattern":string,"meaningVi":string,"usageVi":string}]}`;
}

const normalizePart = (raw, allowImplied) => ({
	ja: clean(raw?.ja, 300),
	vi: clean(raw?.vi, 300),
	implied: allowImplied ? Boolean(raw?.implied) : false,
	noteVi: clean(raw?.noteVi, 600),
});

/**
 * @param {unknown} raw
 * @param {{ index: number, plainJa: string }} sentence
 */
function normalizeAnalysis(raw, sentence) {
	return {
		index: sentence.index,
		textJa: sentence.plainJa,
		referenceVi: clean(raw?.referenceVi, 1500),
		subject: normalizePart(raw?.subject, true),
		predicate: normalizePart(raw?.predicate, false),
		components: asArray(raw?.components, 20)
			.map((c) => ({
				ja: clean(c?.ja, 200),
				role: READING_SENTENCE_ROLES.includes(c?.role) ? c.role : 'modifier',
				vi: clean(c?.vi, 300),
			}))
			.filter((c) => c.ja),
		structureVi: clean(raw?.structureVi, 1000),
		grammarPoints: asArray(raw?.grammarPoints, 5)
			.map((g) => ({
				pattern: clean(g?.pattern, 120),
				meaningVi: clean(g?.meaningVi, 400),
				usageVi: clean(g?.usageVi, 800),
			}))
			.filter((g) => g.pattern),
	};
}

async function analyzeChunk({ article, context, targets }) {
	const raw = await callGeminiAPI(buildAnalysisPrompt({ article, context, targets }), {
		temperature: 0.2,
		maxTokens: 8192,
		arrayMode: false,
	});
	const byIndex = matchRowsByIndex(raw, targets.map((s) => s.index));
	return targets
		.filter((s) => byIndex.has(s.index))
		.map((s) => normalizeAnalysis(byIndex.get(s.index), s))
		.filter((a) => a.referenceVi);
}

async function generateAnalyses(article, sentences, indices) {
	const context = buildContext(sentences);
	const targets = indices.map((i) => sentences[i]);
	const chunks = [];
	for (let i = 0; i < targets.length; i += ANALYSIS_CHUNK_SIZE) {
		chunks.push(targets.slice(i, i + ANALYSIS_CHUNK_SIZE));
	}
	const results = [];
	for (let i = 0; i < chunks.length; i += ANALYSIS_CONCURRENCY) {
		const batch = chunks.slice(i, i + ANALYSIS_CONCURRENCY);
		const settled = await Promise.allSettled(
			batch.map((chunk) => analyzeChunk({ article, context, targets: chunk })),
		);
		for (const item of settled) {
			if (item.status === 'fulfilled') results.push(...item.value);
		}
	}
	return results;
}

/**
 * Lấy phân tích đã cache cho các câu; câu nào thiếu thì gọi AI tạo và lưu lại.
 * @returns {Promise<Map<number, object>>}
 */
async function ensureAnalyses(article, sentences, indices) {
	const contentHash = hashSentences(sentences);
	let doc = await sentenceAnalysisRepository.findByArticleId(article._id);
	if (!doc || doc.contentHash !== contentHash) {
		doc = await sentenceAnalysisRepository.resetForHash(article._id, contentHash);
	}
	const cached = toIndexMap(doc.sentences);
	const missing = indices.filter((i) => !cached.has(i));
	if (!missing.length || !isGeminiConfigured()) return cached;

	const generated = await generateAnalyses(article, sentences, missing);
	if (generated.length) {
		await sentenceAnalysisRepository.pushSentences(article._id, contentHash, generated);
		for (const analysis of generated) cached.set(analysis.index, analysis);
	}
	return cached;
}

function buildFeedbackPrompt({ article, rows }) {
	const blocks = rows
		.map(({ index, translationVi, sentence, analysis }) => {
			const subject = analysis.subject.implied
				? `(bị lược) ${analysis.subject.vi}`
				: `${analysis.subject.ja} — ${analysis.subject.vi}`;
			return `[${index}]
Câu gốc: ${sentence.plainJa}
Chủ ngữ: ${subject}
Vị ngữ: ${analysis.predicate.ja} — ${analysis.predicate.vi}
Bản tham khảo: ${analysis.referenceVi}
Bản dịch học viên: ${translationVi}`;
		})
		.join('\n\n');

	return `Bạn là giáo viên dịch Nhật–Việt cho người học trình độ ${article.jlpt}. Chấm bản dịch TỪNG CÂU của học viên trong bài "${article.titleJa}".
Tiêu chí: dịch đúng chủ ngữ (kể cả chủ ngữ bị lược), đúng vị ngữ (thời, thể, phủ định, sắc thái), đủ ý, đúng quan hệ logic, tiếng Việt tự nhiên. Không phạt cách diễn đạt khác bản tham khảo nếu nghĩa đúng. score dùng thang 0–100 (gần như đúng thì 85–100), tuyệt đối không dùng thang 10.
- verdict: correct | partial | incorrect.
- subjectOk / predicateOk: học viên có thể hiện đúng chủ ngữ / vị ngữ không.
- commentVi: 1–3 câu nhận xét cụ thể.
- issues: tối đa 4 lỗi; quote là cụm ngắn trích NGUYÊN VĂN từ bản dịch học viên, correctionVi là cách sửa, explanationVi giải thích dựa trên ngữ pháp của câu gốc, severity: minor | important | critical.
- suggestionVi: bản dịch của học viên sau khi sửa tối thiểu, giữ văn phong của học viên.
Không trả HTML hoặc Markdown.

${blocks}

Trả về JSON object {"results":[...]}, mỗi phần tử trong results:
{"index":number,"score":number,"verdict":string,"subjectOk":boolean,"predicateOk":boolean,"commentVi":string,"issues":[{"quote":string,"correctionVi":string,"explanationVi":string,"severity":string}],"suggestionVi":string}`;
}

function normalizeFeedback(raw) {
	return {
		score: clampScore(raw?.score),
		verdict: VERDICTS.includes(raw?.verdict) ? raw.verdict : 'partial',
		subjectOk: Boolean(raw?.subjectOk),
		predicateOk: Boolean(raw?.predicateOk),
		commentVi: clean(raw?.commentVi, 1000),
		issues: asArray(raw?.issues, 4).map((issue) => ({
			quote: clean(issue?.quote, 300),
			correctionVi: clean(issue?.correctionVi, 600),
			explanationVi: clean(issue?.explanationVi, 900),
			severity: SEVERITIES.includes(issue?.severity) ? issue.severity : 'important',
		})),
		suggestionVi: clean(raw?.suggestionVi, 1500),
	};
}

async function requestFeedback(article, rows) {
	const raw = await callGeminiAPI(buildFeedbackPrompt({ article, rows }), {
		temperature: 0.25,
		maxTokens: 8192,
		arrayMode: false,
	});
	const matched = matchRowsByIndex(raw, rows.map((r) => r.index));
	return new Map([...matched].map(([index, item]) => [index, normalizeFeedback(item)]));
}

/** Câu nào AI bỏ sót thì chấm lại thêm 1 lần. */
async function gradeTranslations(article, rows) {
	if (!rows.length) return new Map();
	const feedbacks = await requestFeedback(article, rows);
	const missing = rows.filter((r) => !feedbacks.has(r.index));
	if (missing.length) {
		for (const [index, feedback] of await requestFeedback(article, missing)) {
			feedbacks.set(index, feedback);
		}
	}
	return feedbacks;
}

/**
 * Chấm bản dịch từng câu. Phân tích câu chỉ trả về cho những câu học viên đã nộp.
 * @param {{ article: object, items: { index: number, translationVi: string }[] }} params
 */
export async function analyzeSentenceTranslations({ article, items }) {
	const sentences = splitArticleSentences(article);
	const byIndex = new Map(items.map((item) => [item.index, clean(item.translationVi, 1000)]));
	const indices = [...byIndex.keys()];
	if (indices.some((i) => i >= sentences.length)) {
		throw new AppError(COMMON.BAD_REQUEST, 400);
	}

	const analyses = await ensureAnalyses(article, sentences, indices);
	const rows = indices
		.filter((index) => analyses.has(index))
		.map((index) => ({
			index,
			translationVi: byIndex.get(index),
			sentence: sentences[index],
			analysis: analyses.get(index),
		}));
	const feedbacks = isGeminiConfigured() ? await gradeTranslations(article, rows) : new Map();

	const results = indices.map((index) => ({
		index,
		translationVi: byIndex.get(index),
		feedback: feedbacks.get(index) ?? null,
		analysis: analyses.get(index) ?? null,
	}));
	const complete = results.every((r) => r.feedback && r.analysis);
	return { results, source: complete ? 'gemini' : 'placeholder' };
}

function buildSummaryPrompt({ article, rows }) {
	const blocks = rows
		.map(({ index, translationVi, score, sentence, analysis }) => {
			const grammar = (analysis?.grammarPoints ?? []).map((g) => g.pattern).join(', ');
			return `[${index + 1}] (${score}/100) ${sentence.plainJa}
Tham khảo: ${analysis?.referenceVi ?? ''}
Học viên: ${translationVi}${grammar ? `\nNgữ pháp: ${grammar}` : ''}`;
		})
		.join('\n\n');

	return `Bạn là giáo viên dịch Nhật–Việt cho người học trình độ ${article.jlpt}. Học viên đã dịch và được chấm TỪNG CÂU của bài "${article.titleJa}". Viết TỔNG KẾT CHUNG cho cả bài: tập trung vào xu hướng và lỗi lặp lại, không chấm lại từng câu. Số trong ngoặc vuông là số câu học viên nhìn thấy, điểm trong ngoặc tròn là điểm đã chấm.
- summaryVi: 2–4 câu nhận xét tổng thể (mức độ hiểu bài, độ chính xác, độ tự nhiên và mạch lạc khi ghép các câu thành đoạn).
- strengthsVi: tối đa 4 điểm mạnh cụ thể.
- weaknessesVi: tối đa 4 điểm yếu lặp lại (ví dụ bỏ sót chủ ngữ bị lược, nhầm thời/thể, dịch sát chữ), nêu số câu bị ảnh hưởng.
- grammarToReview: tối đa 5 mẫu ngữ pháp nên ôn; pattern viết dạng chuẩn, reasonVi nêu câu nào dịch chưa đúng vì mẫu này.
- adviceVi: tối đa 4 lời khuyên hành động cụ thể cho lần đọc tiếp theo.
Không trả HTML hoặc Markdown.

${blocks}

Trả về đúng một JSON object:
{"summaryVi":string,"strengthsVi":string[],"weaknessesVi":string[],"grammarToReview":[{"pattern":string,"reasonVi":string}],"adviceVi":string[]}`;
}

const cleanList = (value, max) =>
	asArray(value, max)
		.map((item) => clean(item, 600))
		.filter(Boolean);

function normalizeSummary(raw) {
	if (!raw || typeof raw !== 'object') return null;
	const summary = {
		summaryVi: clean(raw.summaryVi, 1500),
		strengthsVi: cleanList(raw.strengthsVi, 4),
		weaknessesVi: cleanList(raw.weaknessesVi, 4),
		grammarToReview: asArray(raw.grammarToReview, 5)
			.map((g) => ({ pattern: clean(g?.pattern, 120), reasonVi: clean(g?.reasonVi, 600) }))
			.filter((g) => g.pattern),
		adviceVi: cleanList(raw.adviceVi, 4),
	};
	return summary.summaryVi ? summary : null;
}

/**
 * Tổng kết chung sau khi học viên đã chấm xong toàn bộ câu.
 * @param {{ article: object, items: { index: number, translationVi: string, score: number }[] }} params
 */
export async function summarizeArticleTranslation({ article, items }) {
	const sentences = splitArticleSentences(article);
	const byIndex = new Map(items.map((item) => [item.index, item]));
	const complete =
		sentences.length > 0 &&
		items.length === sentences.length &&
		sentences.every((s) => byIndex.has(s.index));
	if (!complete) {
		throw new AppError(READING.TRANSLATION_INCOMPLETE, 400);
	}
	if (!isGeminiConfigured()) return { summary: null, source: 'placeholder' };

	const analyses = await ensureAnalyses(article, sentences, sentences.map((s) => s.index));
	const rows = sentences.map((sentence) => ({
		index: sentence.index,
		translationVi: clean(byIndex.get(sentence.index).translationVi, 1000),
		score: clampScore(byIndex.get(sentence.index).score),
		sentence,
		analysis: analyses.get(sentence.index) ?? null,
	}));
	const raw = await callGeminiAPI(buildSummaryPrompt({ article, rows }), {
		temperature: 0.3,
		maxTokens: 4096,
		arrayMode: false,
	});
	const summary = normalizeSummary(raw);
	return { summary, source: summary ? 'gemini' : 'placeholder' };
}

/** Danh sách câu (chỉ câu tiếng Nhật) để học viên dịch. */
export function listArticleSentences(article) {
	return splitArticleSentences(article).map(({ index, paragraphIndex, textJa }) => ({
		index,
		paragraphIndex,
		textJa,
	}));
}

async function buildStatus(article) {
	const sentences = splitArticleSentences(article);
	const doc = await sentenceAnalysisRepository.findByArticleId(article._id);
	const fresh = Boolean(doc) && doc.contentHash === hashSentences(sentences);
	const analyzed = fresh
		? [...toIndexMap(doc.sentences).keys()].filter((i) => i < sentences.length).length
		: 0;
	return {
		totalSentences: sentences.length,
		analyzedCount: analyzed,
		stale: Boolean(doc) && !fresh,
		updatedAt: doc?.updatedAt ?? null,
	};
}

async function findArticleOrThrow(articleId) {
	const article = await readingRepository.findArticleById(articleId);
	if (!article) throw new AppError(READING.NOT_FOUND, 404);
	return article;
}

export async function getSentenceAnalysisStatus(articleId) {
	return buildStatus(await findArticleOrThrow(articleId));
}

/** Admin: bỏ phân tích cũ và tạo lại cho toàn bộ câu. */
export async function regenerateSentenceAnalysis(articleId) {
	const article = await findArticleOrThrow(articleId);
	if (!isGeminiConfigured()) {
		throw new AppError(READING.SENTENCE_AI_UNAVAILABLE, 503);
	}
	const sentences = splitArticleSentences(article);
	await sentenceAnalysisRepository.resetForHash(article._id, hashSentences(sentences));
	await ensureAnalyses(article, sentences, sentences.map((s) => s.index));
	return buildStatus(article);
}

export async function deleteSentenceAnalysis(articleId) {
	await sentenceAnalysisRepository.deleteByArticleId(articleId);
}
