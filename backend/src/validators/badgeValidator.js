import Joi from 'joi';

const keyPattern = /^[a-z0-9_]{2,64}$/;
const categories = [
	'streak',
	'vocabulary',
	'kanji',
	'grammar',
	'reading',
	'listening',
	'quiz',
	'general',
	'other',
];
const rarities = ['common', 'rare', 'epic', 'legendary'];

export const badgeSchema = Joi.object({
	key: Joi.string().trim().lowercase().pattern(keyPattern).required().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
		'string.pattern.base': 'MSG_003',
	}),
	nameVi: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	nameJa: Joi.string().required().trim().messages({
		'any.required': 'MSG_003',
		'string.empty': 'MSG_003',
	}),
	descriptionVi: Joi.string().trim().allow('', null).optional(),
	descriptionJa: Joi.string().trim().allow('', null).optional(),
	emoji: Joi.string().trim().allow('', null).optional(),
	category: Joi.string()
		.valid(...categories)
		.default('general')
		.messages({ 'any.only': 'MSG_003' }),
	rarity: Joi.string()
		.valid(...rarities)
		.default('common')
		.messages({ 'any.only': 'MSG_003' }),
	isActive: Joi.boolean().default(true),
	displayOrder: Joi.number().integer().min(0).default(0),
});
