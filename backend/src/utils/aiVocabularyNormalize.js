import { PART_OF_SPEECH } from '../constants/vocabulary.js';
import { sanitizeKanaReading } from './japaneseReadingSanitize.js';

const POS_VALUES = new Set(Object.values(PART_OF_SPEECH));

/**
 * Chuẩn hóa một object từ AI / JSON import sang payload Vocabulary.
 * @param {unknown} raw
 * @returns {object | null}
 */
export function normalizeVocabularyFromAI(raw) {
	if (!raw || typeof raw !== 'object') {
		return null;
	}

	const o = /** @type {Record<string, unknown>} */ (raw);
	const word = String(o.word ?? '').trim();
	const reading = sanitizeKanaReading(word, String(o.reading ?? o.kana ?? ''));
	const meaning = String(o.meaning ?? o.meaningVi ?? '').trim();

	if (!word || !reading || !meaning) {
		return null;
	}

	const meaningJa = String(o.meaningJa ?? '').trim();
	const example = String(o.example ?? o.exampleSentence ?? '').trim();
	const exampleReading = String(o.exampleReading ?? '').trim();
	const exampleMeaning = String(o.exampleMeaning ?? '').trim();
	const rawPos = String(o.partOfSpeech ?? '').trim().toLowerCase();
	const partOfSpeech = POS_VALUES.has(rawPos) ? rawPos : 'noun';
	const displayOrder = Number(o.displayOrder);

	const payload = {
		word,
		reading,
		meaning,
		meaningJa: meaningJa || undefined,
		example: example || undefined,
		exampleReading: exampleReading || undefined,
		exampleMeaning: exampleMeaning || undefined,
		partOfSpeech,
		displayOrder:
			Number.isFinite(displayOrder) && displayOrder >= 0 ? displayOrder : undefined,
		isActive: o.isActive !== false,
	};

	return Object.fromEntries(
		Object.entries(payload).filter(([, v]) => v !== undefined)
	);
}

/**
 * @param {unknown} data
 * @returns {object[]}
 */
export function normalizeVocabularyListFromAI(data) {
	if (!Array.isArray(data)) {
		return [];
	}
	return data.map((item) => normalizeVocabularyFromAI(item)).filter(Boolean);
}
