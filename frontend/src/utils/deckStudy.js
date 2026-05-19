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

/**
 * Khớp backend VOCAB_DECK_SORT: displayOrder ↑, title ↑, _id ↑ khi hòa.
 * @param {object[]} decks
 */
export function sortDecksByOrder(decks) {
	return [...decks].sort((a, b) => {
		const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
		if (orderDiff !== 0) return orderDiff;
		const titleA = String(a.titleJa || a.title || '');
		const titleB = String(b.titleJa || b.title || '');
		const titleCmp = titleA.localeCompare(titleB, 'vi');
		if (titleCmp !== 0) return titleCmp;
		return String(a._id ?? '').localeCompare(String(b._id ?? ''));
	});
}

/**
 * Số thứ tự bài (1-based) của deck trong danh sách đã sort.
 * @param {object[]} sortedDecks
 * @param {string} deckId
 */
export function lessonNoForDeck(sortedDecks, deckId) {
	const idx = sortedDecks.findIndex((d) => String(d._id) === String(deckId));
	return idx >= 0 ? idx + 1 : null;
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

/** Giai đoạn tối thiểu = đã hoàn thành quiz lần 1 → Nảy mầm (growthStage 1) */
export const VOCAB_UNLOCK_SPROUT_STAGE = 1;

/**
 * @param {string|import('mongoose').Types.ObjectId} deckId
 * @param {Record<string, number>} [progressByDeckId]
 */
export function deckGrowthStage(deckId, progressByDeckId) {
	const s = progressByDeckId?.[String(deckId)];
	return Number.isFinite(s) ? Math.max(0, Math.floor(Number(s))) : 0;
}

/**
 * growthStage của các bài trước bài `lessonNo` (1-based).
 * @param {object[]} sortedDecks
 * @param {number} lessonNo
 * @param {Record<string, number>} progressByDeckId
 */
export function previousDeckGrowthStages(sortedDecks, lessonNo, progressByDeckId) {
	const n = Math.max(1, Math.floor(Number(lessonNo) || 1));
	/** @type {number[]} */
	const stages = [];
	for (let i = 0; i < n - 1; i++) {
		const deck = sortedDecks[i];
		if (deck) {
			stages.push(deckGrowthStage(deck._id, progressByDeckId));
		}
	}
	return stages;
}

/**
 * Mở khóa bài từ vựng theo growthStage (API progress):
 * - Bài 1: luôn mở
 * - Bài 2: bài 1 đạt Nảy mầm (≥1)
 * - Bài 3: trong bài 1–2 có ≥1 bài đạt Nảy mầm
 * - Bài 4+: bài ngay trước đạt Nảy mầm
 *
 * @param {object[]} sortedDecks — đã sort displayOrder trong cùng JLPT
 * @param {number} lessonNo — 1-based
 * @param {Record<string, number>} progressByDeckId
 */
export function isVocabLessonUnlockedByGrowth(
	sortedDecks,
	lessonNo,
	progressByDeckId,
) {
	const n = Math.max(1, Math.floor(Number(lessonNo) || 1));
	if (n <= 1) return true;

	const prev = previousDeckGrowthStages(sortedDecks, lessonNo, progressByDeckId);
	if (!prev.length) return true;

	const need = VOCAB_UNLOCK_SPROUT_STAGE;

	if (n === 2) {
		return prev[0] >= need;
	}
	if (n === 3) {
		return prev.filter((s) => s >= need).length >= 1;
	}
	return prev[prev.length - 1] >= need;
}

/**
 * Key i18n gợi ý vì sao bài còn khóa.
 * @param {number} lessonNo
 */
export function getVocabLessonUnlockReasonKey(lessonNo) {
	const n = Math.max(1, Math.floor(Number(lessonNo) || 1));
	if (n === 2) return 'vocabPage.unlockReason.lesson2';
	if (n === 3) return 'vocabPage.unlockReason.lesson3';
	return 'vocabPage.unlockReason.lessonDefault';
}

/**
 * Kanji / legacy: mở khi thuộc hết từ bài trước.
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

/**
 * @param {object[]} sortedDecks
 * @param {ReturnType<typeof mapKanjiRecord>[]} mergedItems
 * @param {Record<string, number> | null} [progressByDeckId] — khi có: vocab dùng growth unlock
 */
export function buildDeckLessons(sortedDecks, mergedItems, progressByDeckId = null) {
	const useGrowthUnlock =
		progressByDeckId != null && typeof progressByDeckId === 'object';

	return sortedDecks.map((deck, index) => {
		const lessonNo = index + 1;
		const deckItems = mergedItems.filter(
			(x) => String(x.deckId) === String(deck._id),
		);
		const learned = deckItems.filter((x) => x.learned).length;
		const jlpt = deck.jlpt || levelToJlpt(deck.level);
		const unlocked = useGrowthUnlock
			? isVocabLessonUnlockedByGrowth(
					sortedDecks,
					lessonNo,
					progressByDeckId,
				)
			: isDeckLessonUnlocked(sortedDecks, mergedItems, lessonNo);

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
			unlocked,
			unlockReasonKey: unlocked
				? null
				: getVocabLessonUnlockReasonKey(lessonNo),
			jlpt,
		};
	});
}
