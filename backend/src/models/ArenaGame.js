import mongoose from 'mongoose';
import { ARENA_GAME_KEYS } from '../constants/arena.js';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';

const arenaGameSchema = new mongoose.Schema(
	{
		gameKey: {
			type: String,
			required: true,
			unique: true,
			enum: Object.values(ARENA_GAME_KEYS),
		},
		order: { type: Number, default: 0, min: 0 },
		isActive: { type: Boolean, default: true },
		titleVi: { type: String, default: '', trim: true },
		titleJa: { type: String, default: '', trim: true },
		descriptionVi: { type: String, default: '', trim: true },
		descriptionJa: { type: String, default: '', trim: true },
		durationSeconds: { type: Number, default: 0, min: 0 },
		penaltySeconds: { type: Number, default: 5, min: 0, max: 60 },
		pointsPerCorrect: { type: Number, default: 10, min: 1 },
		poolPickCount: { type: Number, default: 60, min: 10 },
		boxCount: { type: Number, default: 12, min: 1, max: 12 },
		questionCount: { type: Number, default: 20, min: 1 },
		hopeStarBonus: { type: Number, default: 20 },
		hopeStarPenalty: { type: Number, default: -10 },
		maxHopeStars: { type: Number, default: 3, min: 0, max: 12 },
		defaultJlpt: {
			type: String,
			enum: GRAMMAR_JLPT_LEVELS,
			default: 'N4',
		},
	},
	{ timestamps: true },
);

export default mongoose.model('ArenaGame', arenaGameSchema);
