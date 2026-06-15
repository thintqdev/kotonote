import mongoose from 'mongoose';
import {
	ARENA_DEFAULT_END,
	ARENA_DEFAULT_JLPT,
	ARENA_DEFAULT_REMINDER_MINUTES,
	ARENA_DEFAULT_START,
	ARENA_DEFAULT_TIMEZONE,
	ARENA_DEFAULT_WEEKDAYS,
	ARENA_SETTINGS_ID,
} from '../constants/arena.js';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';

const arenaSettingsSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			default: ARENA_SETTINGS_ID,
		},
		enabled: {
			type: Boolean,
			default: true,
		},
		startTime: {
			type: String,
			default: ARENA_DEFAULT_START,
			trim: true,
			match: /^([01]\d|2[0-3]):([0-5]\d)$/,
		},
		endTime: {
			type: String,
			default: ARENA_DEFAULT_END,
			trim: true,
			match: /^(([01]\d|2[0-3]):([0-5]\d)|24:00)$/,
		},
		timezone: {
			type: String,
			default: ARENA_DEFAULT_TIMEZONE,
			trim: true,
		},
		weekdays: {
			type: [{ type: Number, min: 0, max: 6 }],
			default: () => [...ARENA_DEFAULT_WEEKDAYS],
		},
		reminderMinutesBefore: {
			type: Number,
			default: ARENA_DEFAULT_REMINDER_MINUTES,
			min: 5,
			max: 180,
		},
		jlpt: {
			type: String,
			enum: GRAMMAR_JLPT_LEVELS,
			default: ARENA_DEFAULT_JLPT,
		},
		titleVi: { type: String, default: 'Đấu trường tiếng Nhật', trim: true },
		titleJa: { type: String, default: '日本語アリーナ', trim: true },
	},
	{ timestamps: true, collection: 'arena_settings' },
);

export default mongoose.model('ArenaSettings', arenaSettingsSchema);
