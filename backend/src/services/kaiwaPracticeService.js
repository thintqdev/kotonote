import AppError from '../utils/AppError.js';
import { KAIWA } from '../constants/messages.js';
import { callGeminiAPI } from './aiService.js';
import { normalizeKaiwaPracticeTurnFromAI } from '../utils/aiKaiwaPracticeNormalize.js';
import { buildKaiwaOpeningPlaceholderTurn } from '../utils/kaiwaOpeningTurn.js';
import { getPublishedContextById } from './kaiwaContextService.js';

const MAX_HISTORY = 12;

/**
 * @param {Record<string, unknown>} ctx
 * @param {number} userRoleIndex
 * @param {number} partnerRoleIndex
 */
function buildPracticePrompt(ctx, userRoleIndex, partnerRoleIndex) {
	const roles = Array.isArray(ctx.roles) ? ctx.roles : [];
	const userRole = roles[userRoleIndex] ?? roles[0] ?? {};
	const partnerRole = roles[partnerRoleIndex] ?? roles[1] ?? roles[0] ?? {};

	const keyPhrases = (Array.isArray(ctx.keyPhrases) ? ctx.keyPhrases : [])
		.map(
			(p) =>
				`- ${p.phraseJa}${p.reading ? ` (${p.reading})` : ''}: ${p.meaningVi ?? ''}`,
		)
		.join('\n');

	return `You are a Japanese conversation coach for JLPT ${ctx.jlpt} learners (Vietnamese UI).

SCENARIO CONTEXT:
- Title VI: ${ctx.titleVi}
- Setting VI: ${ctx.settingVi ?? ''} / JA: ${ctx.settingJa ?? ''}
- Situation VI: ${ctx.situationVi}
- Situation JA: ${ctx.situationJa ?? ''}
- Objectives: ${ctx.objectivesVi ?? ''}

ROLES:
- Learner plays: ${userRole.nameVi ?? 'Học viên'} (${userRole.nameJa ?? ''}) — ${userRole.descriptionVi ?? ''}
- YOU play: ${partnerRole.nameVi ?? 'Đối tác'} (${partnerRole.nameJa ?? ''}) — ${partnerRole.descriptionVi ?? ''}

KEY PHRASES (use naturally when fitting):
${keyPhrases || '(none)'}

RULES:
- Stay in character as the partner. Use polite Japanese appropriate for ${ctx.jlpt} (です・ます for N5–N4).
- NEVER use romaji. Japanese must be kanji + hiragana/katakana.
- partnerMessageJa: your in-character spoken line (1–3 short sentences).
- partnerMessageVi: Vietnamese translation of what you said (for learner).
- After learner speaks, fill "analysis" in Vietnamese: brief feedback on their Japanese (grammar, politeness, naturalness).
- "suggestion": ONE better/alternative reply the learner could say next (replyJa, replyReading in hiragana, replyVi).
- If learner message is empty and no history: open the scene with your character's FIRST line that fits THIS scenario only (setting, situation, partner role). Do NOT default to café/restaurant lines unless the scenario is clearly at a shop/restaurant/café.
- For travel/directions: partner may offer help (e.g. どうしましたか). For hospital: ask symptoms. For business: greet professionally. Match category "${ctx.category ?? 'daily'}".
- conversationEnded: true only if the scene naturally concludes.

Return ONLY one JSON object:
{
  "partnerMessageJa": string,
  "partnerMessageVi": string,
  "analysis": { "summaryVi": string, "grammarNoteVi": string, "politenessVi": string, "naturalnessVi": string },
  "suggestion": { "replyJa": string, "replyReading": string, "replyVi": string },
  "conversationEnded": boolean
}`;
}

/**
 * @param {Array<{ role?: string, textJa?: string, text?: string }>} messages
 */
function formatHistory(messages) {
	const slice = messages.slice(-MAX_HISTORY);
	if (!slice.length) return '(no messages yet)';
	return slice
		.map((m) => {
			const who = m.role === 'partner' ? 'Partner' : 'Learner';
			const text = String(m.textJa ?? m.text ?? '').trim();
			return `${who}: ${text}`;
		})
		.join('\n');
}

/**
 * @param {object} params
 */
export const runKaiwaPracticeTurn = async ({
	contextId,
	userMessage = '',
	messages = [],
	userRoleIndex = 0,
	partnerRoleIndex = 1,
}) => {
	const ctx = await getPublishedContextById(contextId);
	const roles = Array.isArray(ctx.roles) ? ctx.roles : [];
	const uIdx = Math.min(Math.max(0, userRoleIndex), Math.max(0, roles.length - 1));
	let pIdx = partnerRoleIndex;
	if (pIdx === uIdx && roles.length > 1) {
		pIdx = uIdx === 0 ? 1 : 0;
	}
	pIdx = Math.min(Math.max(0, pIdx), Math.max(0, roles.length - 1));

	const trimmedUser = String(userMessage ?? '').trim();
	const historyText = formatHistory(messages);

	const userBlock = trimmedUser
		? `Learner just said (may be Japanese or Vietnamese — interpret as learner intent):\n${trimmedUser}`
		: 'Learner has not spoken yet. Start the role-play with your character\'s opening line.';

	const prompt = `${buildPracticePrompt(ctx, uIdx, pIdx)}

CONVERSATION SO FAR:
${historyText}

${userBlock}`;

	const aiRaw = await callGeminiAPI(prompt, {
		temperature: 0.65,
		maxTokens: 2048,
		arrayMode: false,
	});

	const normalized = normalizeKaiwaPracticeTurnFromAI(aiRaw);
	if (normalized) {
		return {
			turn: normalized,
			source: 'gemini',
			userRoleIndex: uIdx,
			partnerRoleIndex: pIdx,
		};
	}

	if (!trimmedUser) {
		return {
			turn: buildKaiwaOpeningPlaceholderTurn(ctx, pIdx),
			source: 'placeholder',
			userRoleIndex: uIdx,
			partnerRoleIndex: pIdx,
		};
	}

	throw new AppError(KAIWA.PRACTICE_AI_FAILED, 503);
};
