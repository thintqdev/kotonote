import Joi from 'joi';
import {
	DAILY_GOAL_MINUTES_OPTIONS,
	REMINDER_TIME_PATTERN,
} from '../constants/userSettings.js';

const notificationsSchema = Joi.object({
	emailDigest: Joi.boolean(),
	dailyStudyReminder: Joi.boolean(),
	weeklyReport: Joi.boolean(),
});

const studySchema = Joi.object({
	dailyGoalMinutes: Joi.number().valid(...DAILY_GOAL_MINUTES_OPTIONS),
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
