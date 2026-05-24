import { JOURNAL } from '../constants/apiEndpoints.js';
import api from './api.js';

export async function getJournalQuota() {
	const body = await api.get(JOURNAL.QUOTA);
	return body.data?.quota ?? { used: 0, limit: 3, remaining: 3 };
}

export async function listJournalEntries(params = {}) {
	const body = await api.get(JOURNAL.ENTRIES, { params });
	return {
		entries: body.data?.entries ?? [],
		quota: body.data?.quota ?? null,
		pagination: body.data?.pagination ?? null,
	};
}

export async function getJournalEntry(id) {
	const body = await api.get(JOURNAL.entry(id));
	return body.data?.entry ?? null;
}

export async function analyzeJournalEntry(data) {
	const body = await api.post(JOURNAL.ANALYZE, data);
	return {
		entry: body.data?.entry ?? null,
		source: body.data?.source ?? 'gemini',
		quota: body.data?.quota ?? null,
	};
}

export async function deleteJournalEntry(id) {
	const body = await api.delete(JOURNAL.entry(id));
	return body.data ?? null;
}
