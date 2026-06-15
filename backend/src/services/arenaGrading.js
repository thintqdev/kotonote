import { ARENA_GAME_KEYS } from '../constants/arena.js';
import { normalizeAnswer } from '../utils/arenaPick.js';

function gradeKanjiRain(payload, submission) {
	const keyMap = new Map(
		(payload.answerKey || []).map((k) => [k.id, normalizeAnswer(k.hanViet)]),
	);
	let score = 0;
	let correctCount = 0;
	const details = [];

	for (const a of submission.answers || []) {
		const id = String(a.id || '');
		const expected = keyMap.get(id);
		if (!expected) continue;
		const typed = normalizeAnswer(a.typed);
		const ok = typed.length > 0 && typed === expected;
		if (ok) {
			correctCount += 1;
			score += payload.config?.pointsPerCorrect || 10;
		}
		details.push({ id, ok });
	}

	return {
		gameKey: ARENA_GAME_KEYS.KANJI_RAIN,
		score,
		correctCount,
		totalCount: submission.answers?.length || 0,
		durationMs: Number(submission.durationMs) || 0,
		details,
	};
}

function gradeVocabBox(payload, submission) {
	const keyMap = new Map(
		(payload.answerKey || []).map((k) => [k.id, Number(k.answerIndex)]),
	);
	const pts = payload.config?.pointsPerCorrect || 10;
	const bonus = payload.config?.hopeStarBonus ?? 20;
	const penalty = payload.config?.hopeStarPenalty ?? -10;
	let score = 0;
	let correctCount = 0;
	const details = [];

	for (const a of submission.answers || []) {
		const id = String(a.id || '');
		const expected = keyMap.get(id);
		if (expected == null) continue;
		const choiceIndex = Number(a.choiceIndex);
		const ok = Number.isInteger(choiceIndex) && choiceIndex === expected;
		const hopeStar = Boolean(a.hopeStar);
		let delta = 0;
		if (ok) {
			correctCount += 1;
			delta = hopeStar ? bonus : pts;
		} else if (hopeStar) {
			delta = penalty;
		}
		score += delta;
		details.push({ id, ok, hopeStar, delta });
	}

	return {
		gameKey: ARENA_GAME_KEYS.VOCAB_BOX,
		score,
		correctCount,
		totalCount: submission.answers?.length || 0,
		durationMs: Number(submission.durationMs) || 0,
		details,
	};
}

function gradeParticleQuiz(payload, submission) {
	const indexMap = new Map(
		(payload.answerKey || []).map((k) => [k.id, Number(k.answerIndex)]),
	);
	const typedMap = new Map(
		(payload.answerKey || [])
			.filter((k) => k.answer != null)
			.map((k) => [
				k.id,
				[k.answer, ...(k.acceptAnswers || [])].map(normalizeAnswer),
			]),
	);
	const pts = payload.config?.pointsPerCorrect || 10;
	let score = 0;
	let correctCount = 0;
	const details = [];

	for (const a of submission.answers || []) {
		const id = String(a.id || '');
		const expected = indexMap.get(id);
		let ok = false;
		if (expected != null && Number.isInteger(Number(a.choiceIndex))) {
			ok = Number(a.choiceIndex) === expected;
		} else {
			const accepted = typedMap.get(id);
			const typed = normalizeAnswer(a.typed);
			ok = Boolean(accepted?.length && typed.length > 0 && accepted.includes(typed));
		}
		if (ok) {
			correctCount += 1;
			score += pts;
		}
		details.push({ id, ok });
	}

	return {
		gameKey: ARENA_GAME_KEYS.PARTICLE_QUIZ,
		score,
		correctCount,
		totalCount: submission.answers?.length || 0,
		durationMs: Number(submission.durationMs) || 0,
		details,
	};
}

function gradeReadingRush(payload, submission) {
	const graded = gradeParticleQuiz(payload, submission);
	return { ...graded, gameKey: ARENA_GAME_KEYS.READING_RUSH };
}

function gradeMeaningRush(payload, submission) {
	const graded = gradeParticleQuiz(payload, submission);
	return { ...graded, gameKey: ARENA_GAME_KEYS.MEANING_RUSH };
}

/**
 * @param {object} sessionPayload
 * @param {Array<{ gameKey: string, answers?: unknown[], durationMs?: number }>} gameSubmissions
 */
export function gradeArenaSession(sessionPayload, gameSubmissions) {
	const byKey = new Map(
		(sessionPayload?.games || []).map((g) => [g.gameKey, g.payload]),
	);
	const results = [];

	for (const sub of gameSubmissions || []) {
		const payload = byKey.get(sub.gameKey);
		if (!payload) continue;
		if (sub.gameKey === ARENA_GAME_KEYS.KANJI_RAIN) {
			results.push(gradeKanjiRain(payload, sub));
		} else if (sub.gameKey === ARENA_GAME_KEYS.VOCAB_BOX) {
			results.push(gradeVocabBox(payload, sub));
		} else if (sub.gameKey === ARENA_GAME_KEYS.PARTICLE_QUIZ) {
			results.push(gradeParticleQuiz(payload, sub));
		} else if (sub.gameKey === ARENA_GAME_KEYS.READING_RUSH) {
			results.push(gradeReadingRush(payload, sub));
		} else if (sub.gameKey === ARENA_GAME_KEYS.MEANING_RUSH) {
			results.push(gradeMeaningRush(payload, sub));
		}
	}

	const score = results.reduce((s, r) => s + r.score, 0);
	const correctCount = results.reduce((s, r) => s + r.correctCount, 0);
	const totalCount = results.reduce((s, r) => s + r.totalCount, 0);
	const durationMs = results.reduce((s, r) => s + (r.durationMs || 0), 0);

	return { gameResults: results, score, correctCount, totalCount, durationMs };
}
