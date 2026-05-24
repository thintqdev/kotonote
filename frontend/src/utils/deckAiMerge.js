let clientRowSeq = 0;

function nextClientRowId() {
	clientRowSeq += 1;
	return `row-${clientRowSeq}`;
}

/**
 * @param {{ word?: string, reading?: string, meaning?: string }} r
 */
function vocabRowFilled(r) {
	return Boolean(r.word?.trim() || r.reading?.trim() || r.meaning?.trim());
}

/**
 * @param {{ char?: string }} r
 */
function kanjiRowFilled(r) {
	return Boolean(r.char?.trim());
}

/**
 * @param {Array<{ clientId: string, serverId: null | string, word: string, reading: string, meaning: string, meaningJa: string, example: string, exampleMeaning: string }>} rows
 * @param {object[]} items
 * @param {number} maxWords
 */
export function mergeVocabularyAIIntoRows(rows, items, maxWords = 25) {
	const kept = rows.filter(vocabRowFilled);
	const room = Math.max(0, maxWords - kept.length);
	const added = (items ?? []).slice(0, room).map((item) => ({
		clientId: nextClientRowId(),
		serverId: null,
		word: String(item.word ?? '').trim(),
		reading: String(item.reading ?? '').trim(),
		meaning: String(item.meaning ?? item.meaningVi ?? '').trim(),
		meaningJa: String(item.meaningJa ?? '').trim(),
		example: String(item.example ?? item.exampleSentence ?? '').trim(),
		exampleMeaning: String(item.exampleMeaning ?? '').trim(),
	}));

	const merged = [...kept, ...added];
	if (merged.length === 0) {
		return [
			{
				clientId: nextClientRowId(),
				serverId: null,
				word: '',
				reading: '',
				meaning: '',
				meaningJa: '',
				example: '',
				exampleMeaning: '',
			},
		];
	}
	if (merged.length < maxWords && !vocabRowFilled(merged[merged.length - 1])) {
		return merged;
	}
	if (merged.length < maxWords) {
		merged.push({
			clientId: nextClientRowId(),
			serverId: null,
			word: '',
			reading: '',
			meaning: '',
			meaningJa: '',
			example: '',
			exampleMeaning: '',
		});
	}
	return merged;
}

/**
 * @param {object} prev
 * @param {object | null} deck
 */
export function applyVocabularyDeckMeta(prev, deck) {
	if (!deck) return prev;
	return {
		title: prev.title?.trim() ? prev.title : String(deck.title ?? deck.titleVi ?? '').trim(),
		titleJa: prev.titleJa?.trim()
			? prev.titleJa
			: String(deck.titleJa ?? '').trim(),
		description: prev.description?.trim()
			? prev.description
			: String(deck.description ?? deck.descriptionVi ?? '').trim(),
		descriptionJa: prev.descriptionJa?.trim()
			? prev.descriptionJa
			: String(deck.descriptionJa ?? '').trim(),
	};
}

/**
 * @param {Array<object>} rows
 * @param {object[]} items
 * @param {number} maxKanji
 */
export function mergeKanjiAIIntoRows(rows, items, maxKanji) {
	const kept = rows.filter(kanjiRowFilled);
	const room = Math.max(0, maxKanji - kept.length);
	const added = (items ?? []).slice(0, room).map((item) => ({
		clientId: nextClientRowId(),
		serverId: null,
		char: String(item.char ?? '').trim(),
		onYomi: String(item.onYomi ?? item.on ?? '').trim(),
		kunYomi: String(item.kunYomi ?? item.kun ?? '').trim(),
		hanViet: String(item.hanViet ?? item.hanVietReading ?? '').trim(),
		meaningVi: String(item.meaningVi ?? item.meaning ?? '').trim(),
		vocabJa: String(item.vocabJa ?? item.vocabulary ?? '').trim(),
		exampleJa: String(item.exampleJa ?? item.example ?? '').trim(),
		exampleVi: String(item.exampleVi ?? item.exampleMeaning ?? '').trim(),
	}));

	const merged = [...kept, ...added];
	if (merged.length === 0) {
		return [
			{
				clientId: nextClientRowId(),
				serverId: null,
				char: '',
				onYomi: '',
				kunYomi: '',
				hanViet: '',
				meaningVi: '',
				vocabJa: '',
				exampleJa: '',
				exampleVi: '',
			},
		];
	}
	if (merged.length < maxKanji && !kanjiRowFilled(merged[merged.length - 1])) {
		return merged;
	}
	if (merged.length < maxKanji) {
		merged.push({
			clientId: nextClientRowId(),
			serverId: null,
			char: '',
			onYomi: '',
			kunYomi: '',
			hanViet: '',
			meaningVi: '',
			vocabJa: '',
			exampleJa: '',
			exampleVi: '',
		});
	}
	return merged;
}

/**
 * @param {object} prev
 * @param {object | null} deck
 */
export function applyKanjiDeckMeta(prev, deck) {
	if (!deck) return prev;
	return {
		titleVi: prev.titleVi?.trim()
			? prev.titleVi
			: String(deck.titleVi ?? deck.title ?? '').trim(),
		titleJa: prev.titleJa?.trim()
			? prev.titleJa
			: String(deck.titleJa ?? '').trim(),
		descriptionVi: prev.descriptionVi?.trim()
			? prev.descriptionVi
			: String(deck.descriptionVi ?? deck.description ?? '').trim(),
		descriptionJa: prev.descriptionJa?.trim()
			? prev.descriptionJa
			: String(deck.descriptionJa ?? '').trim(),
	};
}
