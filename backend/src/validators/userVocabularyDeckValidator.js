import Joi from 'joi';
import {
	vocabularyCreateSchema,
	vocabularyDeckCreateSchema,
	vocabularyDeckUpdateSchema,
	vocabularyUpdateSchema,
} from './vocabularyValidator.js';

export const userVocabularyDeckCreateSchema = vocabularyDeckCreateSchema.keys({
	isActive: Joi.forbidden(),
	displayOrder: Joi.number().integer().min(0).optional(),
});

export const userVocabularyDeckUpdateSchema = vocabularyDeckUpdateSchema.keys({
	isActive: Joi.forbidden(),
	ownerId: Joi.forbidden(),
});

export const userVocabularyCreateSchema = vocabularyCreateSchema;
export const userVocabularyUpdateSchema = vocabularyUpdateSchema;

export const userVocabularyImportSchema = Joi.object({
	vocabularyList: Joi.array()
		.items(
			Joi.object({
				word: Joi.string().required().trim(),
				reading: Joi.string().required().trim(),
				meaning: Joi.string().required().trim(),
				meaningJa: Joi.string().trim().allow('', null).optional(),
				partOfSpeech: Joi.string().optional(),
				example: Joi.string().trim().allow('', null).optional(),
				exampleReading: Joi.string().trim().allow('', null).optional(),
				exampleMeaning: Joi.string().trim().allow('', null).optional(),
				audioUrl: Joi.string().trim().allow('', null).optional(),
				imageUrl: Joi.string().trim().allow('', null).optional(),
				displayOrder: Joi.number().integer().min(0).optional(),
			}),
		)
		.min(1)
		.max(25)
		.required(),
});
