import mongoose from 'mongoose';
import ArenaSettings from '../models/ArenaSettings.js';
import ArenaGame from '../models/ArenaGame.js';
import ArenaKanjiPool from '../models/ArenaKanjiPool.js';
import ArenaVocabItem from '../models/ArenaVocabItem.js';
import ArenaParticleItem from '../models/ArenaParticleItem.js';
import ArenaAttempt from '../models/ArenaAttempt.js';
import { ARENA_ATTEMPT_STATUS, ARENA_SETTINGS_ID } from '../constants/arena.js';

export const getOrCreateSettings = async () => {
	let doc = await ArenaSettings.findById(ARENA_SETTINGS_ID).lean();
	if (!doc) {
		doc = (await ArenaSettings.create({ _id: ARENA_SETTINGS_ID })).toObject();
	}
	return doc;
};

export const updateSettings = async (patch) =>
	ArenaSettings.findByIdAndUpdate(ARENA_SETTINGS_ID, patch, {
		new: true,
		runValidators: true,
		upsert: true,
	}).lean();

export const listGames = async () =>
	ArenaGame.find().sort({ order: 1, gameKey: 1 }).lean();

export const updateGame = async (gameKey, patch) =>
	ArenaGame.findOneAndUpdate({ gameKey }, patch, {
		new: true,
		runValidators: true,
	}).lean();

export const listActiveKanji = async (jlpt) =>
	ArenaKanjiPool.find({ isActive: true, jlpt }).sort({ char: 1 }).lean();

export const countKanji = async (jlpt) => {
	const filter = { isActive: true };
	if (jlpt) filter.jlpt = jlpt;
	return ArenaKanjiPool.countDocuments(filter);
};

export const listKanjiAdmin = async (jlpt, limit = 100) => {
	const filter = {};
	if (jlpt) filter.jlpt = jlpt;
	return ArenaKanjiPool.find(filter).sort({ jlpt: 1, char: 1 }).limit(limit).lean();
};

export const insertKanjiMany = async (rows) => {
	if (!rows.length) return { inserted: 0 };
	const result = await ArenaKanjiPool.insertMany(rows, { ordered: false });
	return { inserted: result.length };
};

export const updateKanji = async (id, patch) => {
	if (!mongoose.Types.ObjectId.isValid(id)) return null;
	return ArenaKanjiPool.findByIdAndUpdate(id, patch, {
		new: true,
		runValidators: true,
	}).lean();
};

export const deleteKanji = async (id) => {
	if (!mongoose.Types.ObjectId.isValid(id)) return null;
	return ArenaKanjiPool.findByIdAndDelete(id).lean();
};

export const listActiveVocab = async (jlpt) =>
	ArenaVocabItem.find({ isActive: true, jlpt })
		.sort({ displayOrder: 1, createdAt: 1 })
		.lean();

export const countVocab = async (jlpt) => {
	const filter = { isActive: true };
	if (jlpt) filter.jlpt = jlpt;
	return ArenaVocabItem.countDocuments(filter);
};

export const listVocabAdmin = async (jlpt) => {
	const filter = {};
	if (jlpt) filter.jlpt = jlpt;
	return ArenaVocabItem.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
};

export const createVocab = async (data) => {
	const doc = new ArenaVocabItem(data);
	await doc.save();
	return doc.toObject();
};

export const insertVocabMany = async (rows) => {
	if (!rows.length) return { inserted: 0 };
	const result = await ArenaVocabItem.insertMany(rows, { ordered: false });
	return { inserted: result.length };
};

export const updateVocab = async (id, patch) => {
	if (!mongoose.Types.ObjectId.isValid(id)) return null;
	return ArenaVocabItem.findByIdAndUpdate(id, patch, {
		new: true,
		runValidators: true,
	}).lean();
};

export const deleteVocab = async (id) => {
	if (!mongoose.Types.ObjectId.isValid(id)) return null;
	return ArenaVocabItem.findByIdAndDelete(id).lean();
};

export const listActiveParticles = async (jlpt) =>
	ArenaParticleItem.find({ isActive: true, jlpt })
		.sort({ displayOrder: 1, createdAt: 1 })
		.lean();

export const countParticles = async (jlpt) => {
	const filter = { isActive: true };
	if (jlpt) filter.jlpt = jlpt;
	return ArenaParticleItem.countDocuments(filter);
};

export const listParticlesAdmin = async (jlpt) => {
	const filter = {};
	if (jlpt) filter.jlpt = jlpt;
	return ArenaParticleItem.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
};

export const createParticle = async (data) => {
	const doc = new ArenaParticleItem(data);
	await doc.save();
	return doc.toObject();
};

export const insertParticlesMany = async (rows) => {
	if (!rows.length) return { inserted: 0 };
	const result = await ArenaParticleItem.insertMany(rows, { ordered: false });
	return { inserted: result.length };
};

export const updateParticle = async (id, patch) => {
	if (!mongoose.Types.ObjectId.isValid(id)) return null;
	return ArenaParticleItem.findByIdAndUpdate(id, patch, {
		new: true,
		runValidators: true,
	}).lean();
};

export const deleteParticle = async (id) => {
	if (!mongoose.Types.ObjectId.isValid(id)) return null;
	return ArenaParticleItem.findByIdAndDelete(id).lean();
};

export const findAttemptByUserDate = async (userId, dateKey) =>
	ArenaAttempt.findOne({ userId, dateKey }).lean();

export const createAttempt = async (data) => {
	const doc = new ArenaAttempt(data);
	await doc.save();
	return doc.toObject();
};

export const updateAttempt = async (id, patch) =>
	ArenaAttempt.findByIdAndUpdate(id, patch, { new: true }).lean();

export const getLeaderboardForDate = async (dateKey, jlpt, limit = 50) => {
	const filter = {
		dateKey,
		status: ARENA_ATTEMPT_STATUS.SUBMITTED,
	};
	if (jlpt) filter.jlpt = jlpt;

	const rows = await ArenaAttempt.find(filter)
		.sort({ score: -1, durationMs: 1, submittedAt: 1 })
		.limit(limit)
		.populate('userId', 'name avatar')
		.lean();

	return rows.map((row, index) => ({
		rank: index + 1,
		userId: String(row.userId?._id ?? row.userId),
		name: row.userId?.name || '—',
		avatar: row.userId?.avatar || '',
		score: row.score,
		correctCount: row.correctCount,
		totalCount: row.totalCount,
		durationMs: row.durationMs,
		submittedAt: row.submittedAt,
		gameResults: row.gameResults || [],
	}));
};
