import mongoose from 'mongoose';
import { ARENA_ATTEMPT_STATUS, ARENA_GAME_KEYS } from '../constants/arena.js';

const gameResultSchema = new mongoose.Schema(
	{
		gameKey: {
			type: String,
			enum: Object.values(ARENA_GAME_KEYS),
			required: true,
		},
		score: { type: Number, default: 0 },
		correctCount: { type: Number, default: 0, min: 0 },
		totalCount: { type: Number, default: 0, min: 0 },
		durationMs: { type: Number, default: 0, min: 0 },
		details: { type: mongoose.Schema.Types.Mixed, default: {} },
	},
	{ _id: false },
);

const arenaAttemptSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		dateKey: {
			type: String,
			required: true,
			trim: true,
			match: /^\d{4}-\d{2}-\d{2}$/,
		},
		status: {
			type: String,
			enum: Object.values(ARENA_ATTEMPT_STATUS),
			default: ARENA_ATTEMPT_STATUS.IN_PROGRESS,
		},
		jlpt: { type: String, default: 'N4', trim: true },
		sessionPayload: {
			type: mongoose.Schema.Types.Mixed,
			default: null,
		},
		gameResults: { type: [gameResultSchema], default: [] },
		score: { type: Number, default: 0, min: 0 },
		correctCount: { type: Number, default: 0, min: 0 },
		totalCount: { type: Number, default: 0, min: 0 },
		durationMs: { type: Number, default: 0, min: 0 },
		startedAt: { type: Date },
		submittedAt: { type: Date },
	},
	{ timestamps: true },
);

arenaAttemptSchema.index({ userId: 1, dateKey: 1 }, { unique: true });
arenaAttemptSchema.index({ dateKey: 1, jlpt: 1, status: 1, score: -1, durationMs: 1 });

export default mongoose.model('ArenaAttempt', arenaAttemptSchema);
