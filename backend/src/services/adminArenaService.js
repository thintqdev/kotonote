import * as arenaRepository from '../repositories/arenaRepository.js';
import { ARENA_MAX_ACTIVE_GAMES } from '../constants/arena.js';
import { ARENA } from '../constants/messages.js';
import { getArenaWindowState } from '../utils/arenaTime.js';

async function assertCanActivateGame(gameKey) {
	const games = await arenaRepository.listGames();
	const activeOthers = games.filter(
		(g) => g.isActive !== false && g.gameKey !== gameKey,
	).length;
	if (activeOthers >= ARENA_MAX_ACTIVE_GAMES) {
		throw { messageCode: ARENA.MAX_ACTIVE_GAMES, statusCode: 400 };
	}
}

export async function getAdminArenaDashboard() {
	const [settings, games, kanjiCount, vocabCount, particleCount] =
		await Promise.all([
			arenaRepository.getOrCreateSettings(),
			arenaRepository.listGames(),
			arenaRepository.countKanji(),
			arenaRepository.countVocab(),
			arenaRepository.countParticles(),
		]);

	return {
		settings,
		window: getArenaWindowState(settings),
		games,
		stats: {
			kanji: kanjiCount,
			vocab: vocabCount,
			particle: particleCount,
		},
		messageCode: ARENA.SETTINGS_FETCHED,
	};
}

export async function updateAdminArenaSettings(patch) {
	const updated = await arenaRepository.updateSettings(patch);
	return {
		settings: updated,
		window: getArenaWindowState(updated),
		messageCode: ARENA.SETTINGS_UPDATED,
	};
}

export async function updateAdminArenaGame(gameKey, patch) {
	if (patch.isActive === true) {
		await assertCanActivateGame(gameKey);
	}
	const game = await arenaRepository.updateGame(gameKey, patch);
	if (!game) {
		throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 404 };
	}
	return { game, messageCode: ARENA.QUESTION_SAVED };
}

export async function listAdminKanji(jlpt) {
	const items = await arenaRepository.listKanjiAdmin(jlpt, 200);
	return { items, total: items.length, messageCode: ARENA.SETTINGS_FETCHED };
}

export async function importAdminKanji(rows, jlpt) {
	const normalized = rows
		.map((row) => ({
			char: String(row.char || '').trim(),
			hanViet: String(row.hanViet || '').trim(),
			onYomi: String(row.onYomi || '').trim(),
			kunYomi: String(row.kunYomi || '').trim(),
			jlpt: row.jlpt || jlpt || 'N4',
			isActive: row.isActive !== false,
		}))
		.filter((row) => row.char && row.hanViet);

	if (!normalized.length) {
		throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 400 };
	}

	const { inserted } = await arenaRepository.insertKanjiMany(normalized);
	return { inserted, messageCode: ARENA.QUESTION_SAVED };
}

export async function updateAdminKanji(id, patch) {
	const item = await arenaRepository.updateKanji(id, patch);
	if (!item) throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 404 };
	return { item, messageCode: ARENA.QUESTION_SAVED };
}

export async function deleteAdminKanji(id) {
	const row = await arenaRepository.deleteKanji(id);
	if (!row) throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 404 };
	return { messageCode: ARENA.QUESTION_DELETED };
}

export async function listAdminVocab(jlpt) {
	const items = await arenaRepository.listVocabAdmin(jlpt);
	return { items, messageCode: ARENA.SETTINGS_FETCHED };
}

export async function createAdminVocab(data) {
	const item = await arenaRepository.createVocab(data);
	return { item, messageCode: ARENA.QUESTION_SAVED };
}

export async function importAdminVocab(rows, jlpt) {
	const normalized = rows
		.map((row) => {
			const choices = (row.choices || [])
				.map((c) => String(c || '').trim())
				.filter(Boolean);
			if (!row.wordJa || choices.length < 2) return null;
			let answerIndex = Number(row.answerIndex);
			if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= choices.length) {
				answerIndex = 0;
			}
			return {
				wordJa: String(row.wordJa).trim(),
				reading: String(row.reading || '').trim(),
				choices,
				answerIndex,
				jlpt: row.jlpt || jlpt || 'N4',
				isActive: row.isActive !== false,
			};
		})
		.filter(Boolean);

	if (!normalized.length) {
		throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 400 };
	}

	const { inserted } = await arenaRepository.insertVocabMany(normalized);
	return { inserted, messageCode: ARENA.QUESTION_SAVED };
}

export async function updateAdminVocab(id, patch) {
	const item = await arenaRepository.updateVocab(id, patch);
	if (!item) throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 404 };
	return { item, messageCode: ARENA.QUESTION_SAVED };
}

export async function deleteAdminVocab(id) {
	const row = await arenaRepository.deleteVocab(id);
	if (!row) throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 404 };
	return { messageCode: ARENA.QUESTION_DELETED };
}

export async function listAdminParticles(jlpt) {
	const items = await arenaRepository.listParticlesAdmin(jlpt);
	return { items, messageCode: ARENA.SETTINGS_FETCHED };
}

export async function createAdminParticle(data) {
	const item = await arenaRepository.createParticle(data);
	return { item, messageCode: ARENA.QUESTION_SAVED };
}

export async function importAdminParticles(rows, jlpt) {
	const normalized = rows
		.map((row) => ({
			sentenceJa: String(row.sentenceJa || '').trim(),
			sentenceVi: String(row.sentenceVi || '').trim(),
			answer: String(row.answer || '').trim(),
			acceptAnswers: Array.isArray(row.acceptAnswers)
				? row.acceptAnswers.map((a) => String(a).trim()).filter(Boolean)
				: [],
			jlpt: row.jlpt || jlpt || 'N4',
			isActive: row.isActive !== false,
		}))
		.filter((row) => row.sentenceJa && row.answer);

	if (!normalized.length) {
		throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 400 };
	}

	const { inserted } = await arenaRepository.insertParticlesMany(normalized);
	return { inserted, messageCode: ARENA.QUESTION_SAVED };
}

export async function updateAdminParticle(id, patch) {
	const item = await arenaRepository.updateParticle(id, patch);
	if (!item) throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 404 };
	return { item, messageCode: ARENA.QUESTION_SAVED };
}

export async function deleteAdminParticle(id) {
	const row = await arenaRepository.deleteParticle(id);
	if (!row) throw { messageCode: ARENA.NO_QUESTIONS, statusCode: 404 };
	return { messageCode: ARENA.QUESTION_DELETED };
}
