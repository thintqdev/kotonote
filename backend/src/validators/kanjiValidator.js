import Joi from 'joi';

export const kanjiDeckSchema = Joi.object({
	titleVi: Joi.string().required().trim().messages({
		'string.empty': 'Vietnamese title is required',
		'any.required': 'Vietnamese title is required',
	}),
	titleJa: Joi.string().required().trim().messages({
		'string.empty': 'Japanese title is required',
		'any.required': 'Japanese title is required',
	}),
	descriptionVi: Joi.string().trim().allow('').default(''),
	descriptionJa: Joi.string().trim().allow('').default(''),
	jlpt: Joi.string().valid('N5', 'N4', 'N3', 'N2', 'N1').required().messages({
		'any.only': 'JLPT level must be one of N5, N4, N3, N2, N1',
		'any.required': 'JLPT level is required',
	}),
	displayOrder: Joi.number().integer().min(0).default(0).messages({
		'number.base': 'Display order must be a number',
		'number.min': 'Display order must be at least 0',
	}),
	isActive: Joi.boolean().default(true),
});

export const kanjiSchema = Joi.object({
	deckId: Joi.string().required().messages({
		'string.empty': 'Deck ID is required',
		'any.required': 'Deck ID is required',
	}),
	char: Joi.string().required().trim().messages({
		'string.empty': 'Kanji character is required',
		'any.required': 'Kanji character is required',
	}),
	onYomi: Joi.string().required().trim().messages({
		'string.empty': 'On-yomi reading is required',
		'any.required': 'On-yomi reading is required',
	}),
	kunYomi: Joi.string().trim().default('—').messages({
		'string.empty': 'Kun-yomi reading cannot be empty',
	}),
	hanViet: Joi.string().required().trim().messages({
		'string.empty': 'Han-Viet reading is required',
		'any.required': 'Han-Viet reading is required',
	}),
	meaningVi: Joi.string().required().messages({
		'string.empty': 'Vietnamese meaning is required',
		'any.required': 'Vietnamese meaning is required',
	}),
	vocabJa: Joi.string().required().messages({
		'string.empty': 'Japanese vocabulary is required',
		'any.required': 'Japanese vocabulary is required',
	}),
	exampleJa: Joi.string().required().messages({
		'string.empty': 'Japanese example is required',
		'any.required': 'Japanese example is required',
	}),
	exampleVi: Joi.string().required().messages({
		'string.empty': 'Vietnamese example is required',
		'any.required': 'Vietnamese example is required',
	}),
	displayOrder: Joi.number().integer().min(0).default(0).messages({
		'number.base': 'Display order must be a number',
		'number.min': 'Display order must be at least 0',
	}),
});

export const bulkKanjiSchema = Joi.object({
	kanjiList: Joi.array().items(kanjiSchema.fork('deckId', (schema) => schema.optional())).min(1).required().messages({
		'array.min': 'At least one kanji is required',
		'any.required': 'Kanji list is required',
	}),
});
