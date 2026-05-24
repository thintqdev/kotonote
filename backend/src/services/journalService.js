import * as journalRepository from '../repositories/journalRepository.js';
import {
	JOURNAL_DAILY_LIMIT,
	JOURNAL_JLPT_LEVELS,
	JOURNAL_TITLE_MAX,
} from '../constants/journal.js';
import { JOURNAL } from '../constants/messages.js';
import { getJournalDateKey } from '../utils/journalDateKey.js';
import { analyzeJournalContent } from './journalAiService.js';

function mapEntry(entry) {
	if (!entry) return null;
	const plain = entry.toObject ? entry.toObject() : { ...entry };
	return {
		id: String(plain._id ?? plain.id),
		...plain,
		_id: undefined,
	};
}

/**
 * @param {import('mongoose').Types.ObjectId} userId
 */
export const getDailyQuota = async (userId) => {
	const dateKey = getJournalDateKey();
	const used = await journalRepository.countEntriesByUserOnDateKey(userId, dateKey);
	const limit = JOURNAL_DAILY_LIMIT;
	return {
		dateKey,
		used,
		limit,
		remaining: Math.max(0, limit - used),
	};
};

/**
 * @param {import('mongoose').Types.ObjectId} userId
 */
const assertDailyQuotaAvailable = async (userId) => {
	const quota = await getDailyQuota(userId);
	if (quota.remaining <= 0) {
		throw { messageCode: JOURNAL.DAILY_LIMIT, statusCode: 429 };
	}
	return quota;
};

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {{ page?: number, limit?: number }} query
 */
export const listEntries = async (userId, query = {}) => {
	const { entries, total, page, limit } = await journalRepository.findEntriesByUser(
		userId,
		query,
	);
	const quota = await getDailyQuota(userId);
	return {
		entries: entries.map((e) => ({
			id: String(e._id),
			title: e.title,
			contentJa: e.contentJa,
			jlpt: e.jlpt,
			analysis: {
				overallScore: e.analysis?.overallScore ?? 0,
				levelEstimate: e.analysis?.levelEstimate ?? '',
				summaryVi: e.analysis?.summaryVi ?? '',
			},
			source: e.source,
			dateKey: e.dateKey,
			createdAt: e.createdAt,
			updatedAt: e.updatedAt,
		})),
		quota,
		pagination: {
			page,
			limit,
			total,
			pages: Math.ceil(total / limit) || 1,
		},
	};
};

export const getEntry = async (userId, entryId) => {
	const entry = await journalRepository.findEntryByIdForUser(entryId, userId);
	if (!entry) {
		throw { messageCode: JOURNAL.NOT_FOUND, statusCode: 404 };
	}
	return mapEntry(entry);
};

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {{ contentJa: string, title?: string, jlpt?: string }} body
 */
export const analyzeAndSaveEntry = async (userId, body = {}) => {
	await assertDailyQuotaAvailable(userId);

	const contentJa = String(body.contentJa ?? '').trim();
	const jlpt = JOURNAL_JLPT_LEVELS.includes(body.jlpt) ? body.jlpt : 'N4';
	const title =
		String(body.title ?? '')
			.trim()
			.slice(0, JOURNAL_TITLE_MAX) ||
		contentJa.slice(0, 40) + (contentJa.length > 40 ? '…' : '');

	const { analysis, source } = await analyzeJournalContent({ contentJa, jlpt });
	const dateKey = getJournalDateKey();

	const entry = await journalRepository.createEntry({
		userId,
		dateKey,
		title,
		contentJa,
		jlpt,
		analysis,
		source,
	});

	const quota = await getDailyQuota(userId);
	return {
		entry: mapEntry(entry),
		source,
		quota,
	};
};

export const deleteEntry = async (userId, entryId) => {
	const entry = await journalRepository.deleteEntryByIdForUser(entryId, userId);
	if (!entry) {
		throw { messageCode: JOURNAL.NOT_FOUND, statusCode: 404 };
	}
	return { deleted: true };
};
