import { sanitizeKanaReading } from './japaneseReadingSanitize.js';

/**
 * @param {unknown} raw
 * @returns {object | null}
 */
function normalizeRole(raw) {
	if (!raw || typeof raw !== 'object') return null;
	const o = /** @type {Record<string, unknown>} */ (raw);
	const nameVi = String(o.nameVi ?? o.name ?? '').trim();
	const nameJa = String(o.nameJa ?? '').trim();
	if (!nameVi && !nameJa) return null;
	return {
		nameVi,
		nameJa,
		descriptionVi: String(o.descriptionVi ?? o.description ?? '').trim(),
		descriptionJa: String(o.descriptionJa ?? '').trim(),
	};
}

/**
 * @param {unknown} raw
 * @returns {object | null}
 */
function normalizeKeyPhrase(raw) {
	if (!raw || typeof raw !== 'object') return null;
	const o = /** @type {Record<string, unknown>} */ (raw);
	const phraseJa = String(o.phraseJa ?? o.phrase ?? o.ja ?? '').trim();
	if (!phraseJa) return null;
	return {
		phraseJa,
		reading: sanitizeKanaReading(phraseJa, String(o.reading ?? '')),
		meaningVi: String(o.meaningVi ?? o.meaning ?? '').trim(),
	};
}

/**
 * @param {unknown} raw
 * @returns {object | null}
 */
export function normalizeKaiwaContextFromAI(raw) {
	if (!raw || typeof raw !== 'object') {
		return null;
	}
	const o = /** @type {Record<string, unknown>} */ (raw);
	const titleVi = String(o.titleVi ?? o.title ?? '').trim();
	const situationVi = String(
		o.situationVi ?? o.contextVi ?? o.situation ?? '',
	).trim();
	if (!titleVi || !situationVi) {
		return null;
	}

	const roles = Array.isArray(o.roles)
		? o.roles.map(normalizeRole).filter(Boolean)
		: [];
	const keyPhrases = Array.isArray(o.keyPhrases)
		? o.keyPhrases.map(normalizeKeyPhrase).filter(Boolean)
		: Array.isArray(o.phrases)
			? o.phrases.map(normalizeKeyPhrase).filter(Boolean)
			: [];

	return {
		titleVi,
		titleJa: String(o.titleJa ?? '').trim(),
		settingVi: String(o.settingVi ?? o.setting ?? '').trim(),
		settingJa: String(o.settingJa ?? '').trim(),
		roles,
		situationVi,
		situationJa: String(o.situationJa ?? o.contextJa ?? '').trim(),
		objectivesVi: String(o.objectivesVi ?? o.objectives ?? '').trim(),
		objectivesJa: String(o.objectivesJa ?? '').trim(),
		keyPhrases,
		culturalNotesVi: String(o.culturalNotesVi ?? o.culturalNotes ?? '').trim(),
		culturalNotesJa: String(o.culturalNotesJa ?? '').trim(),
	};
}
