const JLPT_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'];

/** @param {string} jlpt — N3 */
export function jlptToApiLevel(jlpt) {
	return String(jlpt || '').trim().toLowerCase();
}

/** @param {string} level — n3 */
export function levelToJlpt(level) {
	const v = String(level || '').trim().toUpperCase();
	return JLPT_ORDER.includes(v) ? v : v;
}

/** @param {object[]} decks */
export function sortDecksByOrder(decks) {
	return [...decks].sort(
		(a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
	);
}

/** Sắp N5→N1 rồi displayOrder — dùng khi hiển thị mọi cấp trên một trang. */
export function sortDecksByJlptAndOrder(decks) {
	return [...decks].sort((a, b) => {
		const ja = JLPT_ORDER.indexOf(a.jlpt || levelToJlpt(a.level));
		const jb = JLPT_ORDER.indexOf(b.jlpt || levelToJlpt(b.level));
		const rankA = ja === -1 ? JLPT_ORDER.length : ja;
		const rankB = jb === -1 ? JLPT_ORDER.length : jb;
		if (rankA !== rankB) return rankA - rankB;
		return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
	});
}

/** Chỉ deck đang bật — lớp phòng khi API/admin trả thêm bản ghi tắt. */
export function filterActiveDecks(decks) {
	return (decks ?? []).filter((d) => d.isActive !== false);
}

/** @param {object[]} decks */
export function jlptLevelsFromDecks(decks) {
	const seen = new Set(decks.map((d) => d.jlpt || levelToJlpt(d.level)));
	return JLPT_ORDER.filter((lv) => seen.has(lv));
}

/**
 * @param {object} k — kanji từ API
 * @param {string} jlpt
 * @param {string} deckId
 */
export function mapKanjiRecord(k, jlpt, deckId) {
	return {
		id: String(k._id),
		deckId: String(deckId),
		order: k.displayOrder ?? 0,
		jlpt,
		char: k.char,
		onYomi: k.onYomi,
		kunYomi: k.kunYomi ?? '—',
		hanViet: k.hanViet,
		meaningVi: k.meaningVi,
		vocabJa: k.vocabJa,
		exampleJa: k.exampleJa,
		exampleVi: k.exampleVi,
		learned: false,
	};
}

const POS_MAP = {
	noun: 'noun',
	verb: 'verb',
	adjective: 'i_adj',
	adverb: 'adv',
	particle: 'noun',
	other: 'noun',
};

/**
 * @param {object} v — vocabulary từ API
 * @param {string} jlpt — N3
 * @param {string} deckId
 */
export function mapVocabRecord(v, jlpt, deckId) {
	return {
		id: String(v._id),
		deckId: String(deckId),
		order: v.displayOrder ?? 0,
		jlpt,
		pos: POS_MAP[v.partOfSpeech] || 'noun',
		surface: v.word,
		reading: v.reading,
		meaningVi: v.meaning,
		meaningJa: v.meaningJa || v.word,
		exampleJaHtml: v.example || '',
		exampleVi: v.exampleMeaning || '',
		learned: false,
		favorite: false,
	};
}

/**
 * @param {ReturnType<typeof mapKanjiRecord>[]} mergedItems
 * @param {object[]} sortedDecks
 * @param {number} lessonNo — 1-based
 */
export function getDeckLessonItems(mergedItems, sortedDecks, lessonNo) {
	const n = Math.max(1, Math.floor(Number(lessonNo) || 1));
	const deck = sortedDecks[n - 1];
	if (!deck) return [];
	const deckId = String(deck._id);
	return mergedItems
		.filter((x) => String(x.deckId) === deckId)
		.sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
}

/**
 * @param {object[]} sortedDecks
 * @param {ReturnType<typeof mapKanjiRecord>[]} mergedItems
 * @param {number} lessonNo
 */
export function isDeckLessonUnlocked(sortedDecks, mergedItems, lessonNo) {
	const n = Math.max(1, Math.floor(Number(lessonNo) || 1));
	if (n <= 1) return true;
	const prevDeck = sortedDecks[n - 2];
	if (!prevDeck) return true;
	const prevItems = mergedItems.filter(
		(x) => String(x.deckId) === String(prevDeck._id),
	);
	if (prevItems.length === 0) return true;
	return prevItems.every((x) => x.learned);
}

/**
 * @param {ReturnType<typeof mapVocabRecord>[]} mergedItems
 * @param {object[]} sortedDecks
 * @param {string} wordId
 */
export function findLessonMetaFromDecks(mergedItems, sortedDecks, wordId) {
	const id = String(wordId || '').trim();
	if (!id) return null;
	const item = mergedItems.find((x) => x.id === id);
	if (!item) return null;
	const deckIdx = sortedDecks.findIndex(
		(d) => String(d._id) === String(item.deckId),
	);
	if (deckIdx === -1) return null;
	return { jlpt: item.jlpt, lessonNo: deckIdx + 1 };
}

/**
 * @param {object[]} sortedDecks
 * @param {ReturnType<typeof mapKanjiRecord>[]} mergedItems
 */
/**
 * Tiến độ “nở hoa” theo map deckId → growthStage (API / DB).
 * @param {ReturnType<typeof buildDeckLessons>} lessons
 * @param {Record<string, number>} progressByDeckId
 * @param {number} growthMax
 */
export function packFlowerProgressByDeckMap(lessons, progressByDeckId, growthMax) {
	const n = lessons.length;
	if (!n) {
		return { flowerCount: 0, lessonCount: 0, pct: 0 };
	}
	let flowerCount = 0;
	for (const lesson of lessons) {
		const stage = progressByDeckId?.[lesson.id] ?? 0;
		if (stage >= growthMax) {
			flowerCount += 1;
		}
	}
	return {
		flowerCount,
		lessonCount: n,
		pct: Math.round((flowerCount / n) * 100),
	};
}

/**
 * @deprecated Dùng packFlowerProgressByDeckMap — giữ cho mock/offline.
 * @param {string} jlpt
 * @param {number} lessonCount
 * @param {(jlpt: string, lessonNo: number) => number} getGrowthStage
 * @param {number} growthMax
 */
export function packFlowerProgress(jlpt, lessonCount, getGrowthStage, growthMax) {
	const n = Math.max(0, Math.floor(Number(lessonCount) || 0));
	if (!n || !jlpt) {
		return { flowerCount: 0, lessonCount: 0, pct: 0 };
	}
	let flowerCount = 0;
	for (let lessonNo = 1; lessonNo <= n; lessonNo += 1) {
		if (getGrowthStage(jlpt, lessonNo) >= growthMax) {
			flowerCount += 1;
		}
	}
	return {
		flowerCount,
		lessonCount: n,
		pct: Math.round((flowerCount / n) * 100),
	};
}

/** Số thứ tự bài trong từng cấp JLPT (khớp localStorage growth). */
export function buildLessonNoInJlptMap(lessons) {
	const counts = {};
	const map = new Map();
	for (const lesson of lessons) {
		const j = lesson.jlpt;
		counts[j] = (counts[j] || 0) + 1;
		map.set(lesson.id, counts[j]);
	}
	return map;
}

/** @deprecated Dùng packFlowerProgressByDeckMap */
export function packFlowerProgressForLessons(
	lessons,
	getGrowthStage,
	growthMax,
	lessonNoInJlpt,
) {
	const n = lessons.length;
	if (!n) {
		return { flowerCount: 0, lessonCount: 0, pct: 0 };
	}
	let flowerCount = 0;
	for (const lesson of lessons) {
		const lessonNo =
			lessonNoInJlpt?.get(lesson.id) ?? lesson.lessonNo;
		if (getGrowthStage(lesson.jlpt, lessonNo) >= growthMax) {
			flowerCount += 1;
		}
	}
	return {
		flowerCount,
		lessonCount: n,
		pct: Math.round((flowerCount / n) * 100),
	};
}

export function buildDeckLessons(sortedDecks, mergedItems) {
	return sortedDecks.map((deck, index) => {
		const lessonNo = index + 1;
		const deckItems = mergedItems.filter(
			(x) => String(x.deckId) === String(deck._id),
		);
		const learned = deckItems.filter((x) => x.learned).length;
		const jlpt = deck.jlpt || levelToJlpt(deck.level);
		return {
			id: String(deck._id),
			deck,
			lessonNo,
			title: deck.title || '',
			titleJa: deck.titleJa || deck.title || '',
			description: deck.description || deck.descriptionJa || '',
			thumbnail: deck.thumbnail || '',
			learned,
			total: deck.kanjiCount ?? deck.wordCount ?? deck.totalWords ?? deckItems.length,
			items: deckItems,
			unlocked: isDeckLessonUnlocked(sortedDecks, mergedItems, lessonNo),
			jlpt,
		};
	});
}
