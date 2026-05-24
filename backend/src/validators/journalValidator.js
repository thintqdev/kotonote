import Joi from 'joi';
import { JOURNAL_CONTENT_MAX, JOURNAL_JLPT_LEVELS, JOURNAL_TITLE_MAX } from '../constants/journal.js';

export const analyzeJournalSchema = Joi.object({
	contentJa: Joi.string().trim().min(1).max(JOURNAL_CONTENT_MAX).required(),
	title: Joi.string().trim().max(JOURNAL_TITLE_MAX).allow(''),
	jlpt: Joi.string().valid(...JOURNAL_JLPT_LEVELS),
}).unknown(false);

export const listJournalSchema = Joi.object({
	page: Joi.number().integer().min(1).default(1),
	limit: Joi.number().integer().min(1).max(50).default(30),
}).unknown(false);
