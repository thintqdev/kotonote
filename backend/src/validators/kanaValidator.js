import Joi from 'joi';
import { KANA_SCRIPT, KANA_TYPE } from '../constants/kana.js';

export const kanaSchema = Joi.object({
	char: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	romaji: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	script: Joi.string()
		.valid(...Object.values(KANA_SCRIPT))
		.required()
		.messages({
			'any.required': 'MSG_003',
			'any.only': 'MSG_003',
		}),
	type: Joi.string()
		.valid(...Object.values(KANA_TYPE))
		.default(KANA_TYPE.GOJUON)
		.messages({
			'any.only': 'MSG_003',
		}),
	rowKey: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	columnIndex: Joi.number().integer().min(0).required().messages({
		'any.required': 'MSG_003',
		'number.min': 'MSG_003',
	}),
	leadChar: Joi.string().trim().allow('', null).optional(),
	mnemonicVi: Joi.string().trim().allow('', null).optional(),
	mnemonicJa: Joi.string().trim().allow('', null).optional(),
	strokeCount: Joi.number().integer().min(1).optional(),
	displayOrder: Joi.number().integer().min(0).default(0),
	isActive: Joi.boolean().default(true),
});
