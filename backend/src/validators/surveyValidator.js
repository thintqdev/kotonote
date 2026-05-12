import Joi from 'joi';
import {
	SURVEY_LEVEL,
	SURVEY_GOAL,
	SURVEY_DAILY_TIME,
	SURVEY_WEAK_AREA,
	SURVEY_DISCOVERY,
} from '../constants/survey.js';

export const surveySchema = Joi.object({
	level: Joi.string()
		.valid(...Object.values(SURVEY_LEVEL))
		.required()
		.messages({
			'any.required': 'MSG_003',
			'any.only': 'MSG_003',
		}),
	goal: Joi.string()
		.valid(...Object.values(SURVEY_GOAL))
		.required()
		.messages({
			'any.required': 'MSG_003',
			'any.only': 'MSG_003',
		}),
	dailyTime: Joi.string()
		.valid(...Object.values(SURVEY_DAILY_TIME))
		.required()
		.messages({
			'any.required': 'MSG_003',
			'any.only': 'MSG_003',
		}),
	weakAreas: Joi.array()
		.items(Joi.string().valid(...Object.values(SURVEY_WEAK_AREA)))
		.default([])
		.messages({
			'array.includes': 'MSG_003',
		}),
	discovery: Joi.string()
		.valid(...Object.values(SURVEY_DISCOVERY))
		.optional()
		.messages({
			'any.only': 'MSG_003',
		}),
	discoveryNote: Joi.string().max(500).optional().allow(''),
	freeNote: Joi.string().max(1000).optional().allow(''),
});
