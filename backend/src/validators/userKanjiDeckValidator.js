import Joi from 'joi';
import { kanjiDeckSchema, kanjiSchema } from './kanjiValidator.js';

export const userKanjiDeckCreateSchema = kanjiDeckSchema.keys({
	isActive: Joi.forbidden(),
});

export const userKanjiDeckUpdateSchema = Joi.object({
	titleVi: Joi.string().trim(),
	titleJa: Joi.string().trim(),
	descriptionVi: Joi.string().trim().allow(''),
	descriptionJa: Joi.string().trim().allow(''),
	jlpt: Joi.string().valid('N5', 'N4', 'N3', 'N2', 'N1'),
	displayOrder: Joi.number().integer().min(0),
	ownerId: Joi.forbidden(),
	isActive: Joi.forbidden(),
}).min(1);

export const userKanjiCreateSchema = kanjiSchema;
export const userKanjiUpdateSchema = kanjiSchema.fork(['deckId'], (s) => s.optional());

export const userKanjiImportSchema = Joi.object({
	kanjiList: Joi.array()
		.items(
			kanjiSchema.fork(['deckId'], (s) => s.optional()).keys({
				char: Joi.string().required().trim(),
				onYomi: Joi.string().required().trim(),
				kunYomi: Joi.string().trim().default('—'),
				hanViet: Joi.string().required().trim(),
				meaningVi: Joi.string().required().trim(),
				vocabJa: Joi.string().required().trim(),
				exampleJa: Joi.string().required().trim(),
				exampleVi: Joi.string().required().trim(),
				displayOrder: Joi.number().integer().min(0).optional(),
			}),
		)
		.min(1)
		.max(25)
		.required(),
});
