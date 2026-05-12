import Joi from 'joi';
import { VOCAB_CATEGORY, JLPT_LEVEL, PART_OF_SPEECH } from '../constants/vocabulary.js';

const levelValues = Object.values(JLPT_LEVEL);
const categoryValues = Object.values(VOCAB_CATEGORY);
const posValues = Object.values(PART_OF_SPEECH);

/** Khớp Mongoose VocabularyDeck — API dùng đúng tên field DB */
export const vocabularyDeckCreateSchema = Joi.object({
	title: Joi.string().required().trim().messages({
		'string.empty': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	titleJa: Joi.string().trim().allow('').default(''),
	description: Joi.string().trim().allow('').default(''),
	descriptionJa: Joi.string().trim().allow('').default(''),
	level: Joi.string()
		.valid(...levelValues)
		.required()
		.messages({
			'any.only': 'MSG_003',
			'any.required': 'MSG_003',
		}),
	category: Joi.string()
		.valid(...categoryValues)
		.default(VOCAB_CATEGORY.BASIC),
	thumbnail: Joi.string().trim().allow('', null).default(null),
	displayOrder: Joi.number().integer().min(0).default(0).messages({
		'number.base': 'MSG_003',
		'number.min': 'MSG_003',
	}),
	isActive: Joi.boolean().default(true),
});

export const vocabularyDeckUpdateSchema = Joi.object({
	title: Joi.string().trim(),
	titleJa: Joi.string().trim().allow(''),
	description: Joi.string().trim().allow(''),
	descriptionJa: Joi.string().trim().allow(''),
	level: Joi.string().valid(...levelValues),
	category: Joi.string().valid(...categoryValues),
	thumbnail: Joi.string().trim().allow('', null),
	displayOrder: Joi.number().integer().min(0).messages({
		'number.base': 'MSG_003',
		'number.min': 'MSG_003',
	}),
	isActive: Joi.boolean(),
});

/** Khớp Mongoose Vocabulary */
export const vocabularyCreateSchema = Joi.object({
	deckId: Joi.string().required().messages({
		'string.empty': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	word: Joi.string().required().trim().messages({
		'string.empty': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	reading: Joi.string().required().trim().messages({
		'string.empty': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	meaning: Joi.string().required().trim().messages({
		'string.empty': 'MSG_003',
		'any.required': 'MSG_003',
	}),
	meaningJa: Joi.string().trim().allow('', null).optional(),
	partOfSpeech: Joi.string()
		.valid(...posValues)
		.default(PART_OF_SPEECH.NOUN),
	example: Joi.string().trim().allow('', null).optional(),
	exampleReading: Joi.string().trim().allow('', null).optional(),
	exampleMeaning: Joi.string().trim().allow('', null).optional(),
	audioUrl: Joi.string().trim().allow('', null).optional(),
	imageUrl: Joi.string().trim().allow('', null).optional(),
	displayOrder: Joi.number().integer().min(0).default(0).messages({
		'number.base': 'MSG_003',
		'number.min': 'MSG_003',
	}),
	isActive: Joi.boolean().default(true),
});

export const vocabularyUpdateSchema = Joi.object({
	word: Joi.string().trim(),
	reading: Joi.string().trim(),
	meaning: Joi.string().trim(),
	meaningJa: Joi.string().trim().allow('', null),
	partOfSpeech: Joi.string().valid(...posValues),
	example: Joi.string().trim().allow('', null),
	exampleReading: Joi.string().trim().allow('', null),
	exampleMeaning: Joi.string().trim().allow('', null),
	audioUrl: Joi.string().trim().allow('', null),
	imageUrl: Joi.string().trim().allow('', null),
	displayOrder: Joi.number().integer().min(0).messages({
		'number.base': 'MSG_003',
		'number.min': 'MSG_003',
	}),
	isActive: Joi.boolean(),
});
