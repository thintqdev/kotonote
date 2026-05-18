import Joi from 'joi';
import {
	DAILY_GOAL_MINUTES_OPTIONS,
	REMINDER_TIME_PATTERN,
} from '../constants/userSettings.js';
import { DAILY_SUBJECT_GOAL_LIMITS } from '../constants/dailySubjectGoals.js';

const dailySubjectGoalsSchema = Joi.object({
	grammar: Joi.number()
		.integer()
		.min(DAILY_SUBJECT_GOAL_LIMITS.grammar.min)
		.max(DAILY_SUBJECT_GOAL_LIMITS.grammar.max),
	vocab: Joi.number()
		.integer()
		.min(DAILY_SUBJECT_GOAL_LIMITS.vocab.min)
		.max(DAILY_SUBJECT_GOAL_LIMITS.vocab.max),
	kanji: Joi.number()
		.integer()
		.min(DAILY_SUBJECT_GOAL_LIMITS.kanji.min)
		.max(DAILY_SUBJECT_GOAL_LIMITS.kanji.max),
});

const notificationsSchema = Joi.object({
	emailDigest: Joi.boolean(),
	dailyStudyReminder: Joi.boolean(),
	weeklyReport: Joi.boolean(),
});

const studySchema = Joi.object({
	dailyGoalMinutes: Joi.number().valid(...DAILY_GOAL_MINUTES_OPTIONS),
	dailySubjectGoals: dailySubjectGoalsSchema,
	reminderEnabled: Joi.boolean(),
	reminderTime: Joi.string().pattern(REMINDER_TIME_PATTERN).messages({
		'string.pattern.base': 'MSG_003',
	}),
	reminderWeekends: Joi.boolean(),
});

const privacySchema = Joi.object({
	analyticsOptIn: Joi.boolean(),
});

export const updateUserSettingsSchema = Joi.object({
	notifications: notificationsSchema,
	study: studySchema,
	privacy: privacySchema,
})
	.or('notifications', 'study', 'privacy')
	.messages({
		'object.missing': 'MSG_003',
	});

/** Frontend gửi toàn bộ object khi lưu */
export const replaceUserSettingsSchema = Joi.object({
	notifications: notificationsSchema.required(),
	study: studySchema.required(),
	privacy: privacySchema.required(),
});
