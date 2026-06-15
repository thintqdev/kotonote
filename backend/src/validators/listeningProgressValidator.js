import Joi from 'joi';
import { STUDY_PROGRESS_STATUS } from '../constants/studyProgress.js';

export const saveListeningProgressSchema = Joi.object({
	status: Joi.string().valid(...STUDY_PROGRESS_STATUS),
	questionAnswers: Joi.array()
		.items(
			Joi.object({
				questionIndex: Joi.number().integer().min(0).required(),
				choiceIndex: Joi.number().integer().min(0).required(),
			}),
		)
		.optional(),
	recordAnswer: Joi.object({
		questionIndex: Joi.number().integer().min(0).required(),
		choiceIndex: Joi.number().integer().min(0).required(),
	}).optional(),
}).min(1);
