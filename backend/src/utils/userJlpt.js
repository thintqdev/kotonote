import User from '../models/User.js';
import { GRAMMAR_JLPT_LEVELS } from '../constants/grammar.js';

/**
 * @param {string} levelKey — n3, N3, …
 */
export function normalizeJlptLabel(levelKey) {
	const raw = String(levelKey || '')
		.trim()
		.toUpperCase();
	if (GRAMMAR_JLPT_LEVELS.includes(raw)) return raw;
	if (/^N?[1-5]$/.test(raw)) {
		const n = raw.replace(/^N/, '');
		const label = `N${n}`;
		if (GRAMMAR_JLPT_LEVELS.includes(label)) return label;
	}
	return 'N5';
}

/**
 * Cấp JLPT từ mục tiêu kỳ thi trên profile (mặc định N5).
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export async function resolveUserArenaJlpt(userId) {
	const user = await User.findById(userId).select('profile').lean();
	const typeKey = user?.profile?.examTypeKey;
	const levelKey = user?.profile?.examLevelKey;
	if (typeKey === 'jlpt' && levelKey) {
		return normalizeJlptLabel(levelKey);
	}
	return 'N5';
}
