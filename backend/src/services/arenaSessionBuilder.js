import {
	ARENA_GAME_KEYS,
	ARENA_PARTICLE_MCQ_CORE,
	ARENA_PARTICLE_MCQ_POOL,
	ARENA_PARTICLE_MCQ_SIZE,
	ARENA_MEANING_MCQ_SIZE,
	ARENA_READING_MCQ_SIZE,
} from '../constants/arena.js';
import {
	buildMeaningMcqChoices,
	buildParticleMcqChoices,
	buildReadingMcqChoices,
	collectMeaningPool,
	pickByDateSeed,
	resolveActiveArenaGames,
	shuffleVocabChoices,
} from '../utils/arenaPick.js';
import * as arenaRepository from '../repositories/arenaRepository.js';

function stripKanji(row) {
	return {
		id: String(row._id),
		char: row.char,
	};
}

function stripVocab(row, boxIndex) {
	return {
		id: String(row._id),
		boxIndex,
		wordJa: row.wordJa,
		reading: row.reading || '',
		choices: row.choices || [],
	};
}

function buildParticleItem(row, dateKey) {
	const mcq = buildParticleMcqChoices(
		row.answer,
		row.acceptAnswers || [],
		`${dateKey}:particle:${row._id}`,
		ARENA_PARTICLE_MCQ_POOL,
		ARENA_PARTICLE_MCQ_SIZE,
		ARENA_PARTICLE_MCQ_CORE,
	);
	return {
		client: {
			id: String(row._id),
			sentenceJa: row.sentenceJa,
			sentenceVi: row.sentenceVi || '',
			choices: mcq.choices,
		},
		answerKey: {
			id: String(row._id),
			answerIndex: mcq.answerIndex,
		},
	};
}

/**
 * @param {string} jlpt
 * @param {string} dateKey
 * @param {import('mongoose').LeanDocument[]} games
 */
function buildReadingItem(row, dateKey, allReadings) {
	const correct = String(row.reading || '').trim();
	const mcq = buildReadingMcqChoices(
		correct,
		allReadings,
		`${dateKey}:reading:${row._id}`,
		ARENA_READING_MCQ_SIZE,
	);
	return {
		client: {
			id: String(row._id),
			wordJa: row.wordJa,
			choices: mcq.choices,
		},
		answerKey: {
			id: String(row._id),
			answerIndex: mcq.answerIndex,
		},
	};
}

function buildMeaningItem(row, dateKey, meaningPool) {
	const choices = row.choices || [];
	const answerIndex = row.answerIndex ?? 0;
	const correct =
		String(choices[answerIndex] ?? choices[0] ?? '').trim();
	let mcq = shuffleVocabChoices(choices, answerIndex, `${dateKey}:meaning:${row._id}`);
	if (mcq.choices.length < 2 && correct) {
		mcq = buildMeaningMcqChoices(
			correct,
			meaningPool,
			`${dateKey}:meaning:${row._id}`,
			ARENA_MEANING_MCQ_SIZE,
		);
	}
	return {
		client: {
			id: String(row._id),
			wordJa: row.wordJa,
			reading: row.reading || '',
			choices: mcq.choices,
		},
		answerKey: {
			id: String(row._id),
			answerIndex: mcq.answerIndex,
		},
	};
}

export async function buildArenaSessionPayload(jlpt, dateKey, games) {
	const activeGames = resolveActiveArenaGames(games);
	const payloads = {};

	for (const game of activeGames) {
		const key = game.gameKey;
		if (key === ARENA_GAME_KEYS.KANJI_RAIN) {
			const pool = await arenaRepository.listActiveKanji(jlpt);
			const picked = pickByDateSeed(pool, `${dateKey}:kanji`, game.poolPickCount || 60);
			payloads[key] = {
				gameKey: key,
				config: {
					durationSeconds: game.durationSeconds || 120,
					pointsPerCorrect: game.pointsPerCorrect || 10,
					penaltySeconds: game.penaltySeconds ?? 5,
				},
				items: picked.map(stripKanji),
				answerKey: picked.map((row) => ({
					id: String(row._id),
					hanViet: row.hanViet,
				})),
			};
		} else if (key === ARENA_GAME_KEYS.VOCAB_BOX) {
			const pool = await arenaRepository.listActiveVocab(jlpt);
			const count = game.boxCount || 12;
			const picked = pickByDateSeed(pool, `${dateKey}:vocab`, count);
			payloads[key] = {
				gameKey: key,
				config: {
					boxCount: picked.length,
					pointsPerCorrect: game.pointsPerCorrect || 10,
					hopeStarBonus: game.hopeStarBonus ?? 20,
					hopeStarPenalty: game.hopeStarPenalty ?? -10,
					maxHopeStars: game.maxHopeStars ?? 3,
				},
				items: picked.map((row, i) => stripVocab(row, i + 1)),
				answerKey: picked.map((row) => ({
					id: String(row._id),
					answerIndex: row.answerIndex,
				})),
			};
		} else if (key === ARENA_GAME_KEYS.PARTICLE_QUIZ) {
			const pool = await arenaRepository.listActiveParticles(jlpt);
			const picked = pickByDateSeed(
				pool,
				`${dateKey}:particle`,
				game.questionCount || 20,
			);
			const particleBuilt = picked.map((row) => buildParticleItem(row, dateKey));
			payloads[key] = {
				gameKey: key,
				config: {
					questionCount: particleBuilt.length,
					pointsPerCorrect: game.pointsPerCorrect || 10,
				},
				items: particleBuilt.map((b) => b.client),
				answerKey: particleBuilt.map((b) => b.answerKey),
			};
		} else if (key === ARENA_GAME_KEYS.READING_RUSH) {
			const pool = await arenaRepository.listActiveVocab(jlpt);
			const withReading = pool.filter((row) => String(row.reading || '').trim());
			const count = game.questionCount || 15;
			const picked = pickByDateSeed(withReading, `${dateKey}:reading`, count);
			const allReadings = withReading.map((row) => String(row.reading).trim());
			const readingBuilt = picked.map((row) =>
				buildReadingItem(row, dateKey, allReadings),
			);
			payloads[key] = {
				gameKey: key,
				config: {
					questionCount: readingBuilt.length,
					pointsPerCorrect: game.pointsPerCorrect || 10,
				},
				items: readingBuilt.map((b) => b.client),
				answerKey: readingBuilt.map((b) => b.answerKey),
			};
		} else if (key === ARENA_GAME_KEYS.MEANING_RUSH) {
			const pool = await arenaRepository.listActiveVocab(jlpt);
			const withChoices = pool.filter(
				(row) => Array.isArray(row.choices) && row.choices.filter(Boolean).length >= 2,
			);
			const count = game.questionCount || 15;
			const picked = pickByDateSeed(withChoices, `${dateKey}:meaning`, count);
			const meaningPool = collectMeaningPool(withChoices);
			const meaningBuilt = picked.map((row) =>
				buildMeaningItem(row, dateKey, meaningPool),
			);
			payloads[key] = {
				gameKey: key,
				config: {
					questionCount: meaningBuilt.length,
					pointsPerCorrect: game.pointsPerCorrect || 10,
				},
				items: meaningBuilt.map((b) => b.client),
				answerKey: meaningBuilt.map((b) => b.answerKey),
			};
		}
	}

	return {
		games: activeGames.map((g) => ({
			gameKey: g.gameKey,
			order: g.order,
			titleVi: g.titleVi,
			titleJa: g.titleJa,
			descriptionVi: g.descriptionVi,
			descriptionJa: g.descriptionJa,
			payload: payloads[g.gameKey] || null,
		})),
	};
}
