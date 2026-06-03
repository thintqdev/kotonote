import api from './api.js';
import { SENTENCE } from '../constants/apiEndpoints.js';

export async function listSentenceSpecialties() {
	const body = await api.get(SENTENCE.SPECIALTIES);
	return body.data?.specialties ?? [];
}

export async function getSentenceStudyPack(code) {
	const body = await api.get(SENTENCE.specialtyPack(code));
	return body.data ?? {};
}

export async function getSentenceQuiz(code, { count = 5 } = {}) {
	const body = await api.get(SENTENCE.specialtyQuiz(code), {
		params: { count },
	});
	return body.data ?? {};
}

/**
 * @param {string} templateId
 * @param {'flash_seen'|'quiz_correct'|'quiz_wrong'|'mark_mastered'|'mark_review'} action
 */
export async function updateSentenceProgress(templateId, action) {
	const body = await api.post(SENTENCE.templateProgress(templateId), { action });
	return body.data?.progress ?? null;
}
