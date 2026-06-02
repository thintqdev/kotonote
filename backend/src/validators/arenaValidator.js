import Joi from 'joi';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';
import { ARENA_GAME_KEYS } from '../constants/arena.js';

const hm = Joi.string().pattern(/^(([01]\d|2[0-3]):([0-5]\d)|24:00)$/);

export const updateArenaSettingsSchema = Joi.object({
	enabled: Joi.boolean(),
	startTime: hm,
	endTime: hm,
	timezone: Joi.string().trim().min(3).max(64),
	weekdays: Joi.array().items(Joi.number().integer().min(0).max(6)).min(1).max(7),
	reminderMinutesBefore: Joi.number().integer().min(5).max(180),
	titleVi: Joi.string().trim().max(120),
	titleJa: Joi.string().trim().max(120),
}).min(1);

export const updateArenaGameSchema = Joi.object({
	isActive: Joi.boolean(),
	order: Joi.number().integer().min(0),
	titleVi: Joi.string().trim().max(120),
	titleJa: Joi.string().trim().max(120),
	descriptionVi: Joi.string().trim().max(500),
	descriptionJa: Joi.string().trim().max(500),
	durationSeconds: Joi.number().integer().min(60).max(3600),
	pointsPerCorrect: Joi.number().integer().min(1).max(100),
	poolPickCount: Joi.number().integer().min(10).max(200),
	penaltySeconds: Joi.number().integer().min(0).max(60),
	boxCount: Joi.number().integer().min(1).max(12),
	questionCount: Joi.number().integer().min(1).max(50),
	hopeStarBonus: Joi.number().integer().min(0).max(100),
	hopeStarPenalty: Joi.number().integer().min(-100).max(0),
	maxHopeStars: Joi.number().integer().min(0).max(12),
}).min(1);

const gameSubmissionSchema = Joi.object({
	gameKey: Joi.string()
		.valid(...Object.values(ARENA_GAME_KEYS))
		.required(),
	durationMs: Joi.number().integer().min(0).max(3_600_000),
	answers: Joi.array()
		.items(
			Joi.object({
				id: Joi.string().required(),
				typed: Joi.string().allow('').max(32),
				choiceIndex: Joi.number().integer().min(0).max(10),
				hopeStar: Joi.boolean(),
			}).unknown(true),
		)
		.min(0)
		.required(),
});

export const arenaKanjiCheckSchema = Joi.object({
	id: Joi.string().required(),
	skipped: Joi.boolean().default(false),
	typed: Joi.when('skipped', {
		is: true,
		then: Joi.string().trim().max(64).allow(''),
		otherwise: Joi.string().trim().min(1).max(64).required(),
	}),
});

export const arenaSubmitSchema = Joi.object({
	games: Joi.array().items(gameSubmissionSchema).min(1).max(3).required(),
});

export const arenaKanjiImportSchema = Joi.object({
	jlpt: Joi.string().valid(...GRAMMAR_JLPT_LEVELS),
	items: Joi.array()
		.items(
			Joi.object({
				char: Joi.string().trim().min(1).max(8).required(),
				hanViet: Joi.string().trim().min(1).max(64).required(),
				onYomi: Joi.string().trim().max(64).allow(''),
				kunYomi: Joi.string().trim().max(64).allow(''),
				jlpt: Joi.string().valid(...GRAMMAR_JLPT_LEVELS),
			}),
		)
		.min(1)
		.max(500)
		.required(),
});

export const arenaVocabImportSchema = Joi.object({
	jlpt: Joi.string().valid(...GRAMMAR_JLPT_LEVELS),
	items: Joi.array()
		.items(
			Joi.object({
				wordJa: Joi.string().trim().min(1).max(120).required(),
				reading: Joi.string().trim().max(120).allow(''),
				choices: Joi.array().items(Joi.string().trim().min(1).max(200)).min(2).max(6).required(),
				answerIndex: Joi.number().integer().min(0).max(5),
				jlpt: Joi.string().valid(...GRAMMAR_JLPT_LEVELS),
				isActive: Joi.boolean(),
			}),
		)
		.min(1)
		.max(500)
		.required(),
});

export const arenaParticleImportSchema = Joi.object({
	jlpt: Joi.string().valid(...GRAMMAR_JLPT_LEVELS),
	items: Joi.array()
		.items(
			Joi.object({
				sentenceJa: Joi.string().trim().min(1).max(500).required(),
				sentenceVi: Joi.string().trim().max(500).allow(''),
				answer: Joi.string().trim().min(1).max(32).required(),
				acceptAnswers: Joi.array().items(Joi.string().trim().max(32)),
				jlpt: Joi.string().valid(...GRAMMAR_JLPT_LEVELS),
				isActive: Joi.boolean(),
			}),
		)
		.min(1)
		.max(500)
		.required(),
});

export const arenaVocabSchema = Joi.object({
	jlpt: Joi.string().valid(...GRAMMAR_JLPT_LEVELS),
	wordJa: Joi.string().trim().min(1).max(120).required(),
	reading: Joi.string().trim().max(120).allow(''),
	choices: Joi.array().items(Joi.string().trim().min(1).max(200)).min(2).max(6).required(),
	answerIndex: Joi.number().integer().min(0).max(5).required(),
	isActive: Joi.boolean(),
});

export const updateArenaKanjiSchema = Joi.object({
	char: Joi.string().trim().min(1).max(8),
	hanViet: Joi.string().trim().min(1).max(64),
	onYomi: Joi.string().trim().max(64).allow(''),
	kunYomi: Joi.string().trim().max(64).allow(''),
	jlpt: Joi.string().valid(...GRAMMAR_JLPT_LEVELS),
	isActive: Joi.boolean(),
}).min(1);

export const updateArenaVocabSchema = Joi.object({
	jlpt: Joi.string().valid(...GRAMMAR_JLPT_LEVELS),
	wordJa: Joi.string().trim().min(1).max(120),
	reading: Joi.string().trim().max(120).allow(''),
	choices: Joi.array().items(Joi.string().trim().min(1).max(200)).min(2).max(6),
	answerIndex: Joi.number().integer().min(0).max(5),
	isActive: Joi.boolean(),
	displayOrder: Joi.number().integer().min(0),
}).min(1);

export const updateArenaParticleSchema = Joi.object({
	jlpt: Joi.string().valid(...GRAMMAR_JLPT_LEVELS),
	sentenceJa: Joi.string().trim().min(1).max(500),
	sentenceVi: Joi.string().trim().max(500).allow(''),
	answer: Joi.string().trim().min(1).max(32),
	acceptAnswers: Joi.array().items(Joi.string().trim().max(32)),
	isActive: Joi.boolean(),
	displayOrder: Joi.number().integer().min(0),
}).min(1);

export const arenaParticleSchema = Joi.object({
	jlpt: Joi.string().valid(...GRAMMAR_JLPT_LEVELS),
	sentenceJa: Joi.string().trim().min(1).max(500).required(),
	sentenceVi: Joi.string().trim().max(500).allow(''),
	answer: Joi.string().trim().min(1).max(32).required(),
	acceptAnswers: Joi.array().items(Joi.string().trim().max(32)),
	isActive: Joi.boolean(),
});
