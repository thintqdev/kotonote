/**
 * Bám enum backend KanjiDeck.jlpt (chữ hoa N5…N1).
 */

export const KANJI_JLPT_OPTIONS = [
	{ value: 'N5', label: 'N5 — Sơ cấp' },
	{ value: 'N4', label: 'N4' },
	{ value: 'N3', label: 'N3' },
	{ value: 'N2', label: 'N2' },
	{ value: 'N1', label: 'N1' },
];

/** Giới hạn số kanji mỗi deck — khớp `KANJI_DECK_MAX_SIZE` backend */
export const MAX_KANJI_PER_DECK = 25;
