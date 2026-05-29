import VocabularyDeckProgress from '../models/VocabularyDeckProgress.js';
import KanjiDeckProgress from '../models/KanjiDeckProgress.js';
import ReadingArticleProgress from '../models/ReadingArticleProgress.js';
import ReadingArticle from '../models/ReadingArticle.js';
import Grammar from '../models/Grammar.js';
import ListeningExercise from '../models/ListeningExercise.js';
import KaiwaPracticeSession from '../models/KaiwaPracticeSession.js';
import User from '../models/User.js';
import * as vocabularyRepository from '../repositories/vocabularyRepository.js';
import * as kanjiRepository from '../repositories/kanjiRepository.js';
import { isVocabLessonUnlockedByGrowth } from '../utils/vocabLessonUnlock.js';
import {
	growthProgressPercent,
	lessonNoFromSiblings,
	levelToJlpt,
	VOCAB_GROWTH_STAGE_MAX,
	KANJI_LESSON_GROWTH_MAX,
} from '../utils/deckLessonMeta.js';
import { listInProgressGrammar } from './grammarProgressService.js';
import { listInProgressListening } from './listeningProgressService.js';

const SUBJECT_ORDER = [
	'vocab',
	'kanji',
	'reading',
	'grammar',
	'listening',
	'kaiwa',
];

/**
 * @typedef {object} ContinueItem
 * @property {string} subjectId
 * @property {'in_progress' | 'suggested'} kind
 * @property {string} title
 * @property {string} [subtitle]
 * @property {number} percent
 * @property {string} path
 * @property {string} touchedAt — ISO
 * @property {Record<string, unknown>} meta
 */

/**
 * @param {string} jlptKey — N5 or n5
 */
function normalizeJlptKey(jlptKey) {
	const u = String(jlptKey || 'N5')
		.trim()
		.toUpperCase();
	return u.startsWith('N') ? u : `N${u}`;
}

function levelFromJlpt(jlpt) {
	return normalizeJlptKey(jlpt).toLowerCase();
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
async function resolvePreferredJlpt(userId) {
	const user = await User.findById(userId).select('profile').lean();
	const typeKey = user?.profile?.examTypeKey;
	const levelKey = user?.profile?.examLevelKey;
	if (typeKey === 'jlpt' && levelKey) {
		return normalizeJlptKey(levelKey);
	}
	return 'N5';
}

/**
 * @param {object} params
 * @returns {ContinueItem}
 */
function buildItem({
	subjectId,
	kind,
	title,
	subtitle = '',
	percent,
	path,
	touchedAt,
	meta = {},
}) {
	return {
		subjectId,
		kind,
		title,
		subtitle,
		percent: Math.min(100, Math.max(0, Math.round(Number(percent) || 0))),
		path,
		touchedAt: touchedAt instanceof Date ? touchedAt.toISOString() : touchedAt,
		meta,
	};
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {string} preferredJlpt
 */
async function collectVocabCandidates(userId, preferredJlpt) {
	/** @type {ContinueItem[]} */
	const items = [];

	const inProgressRows = await VocabularyDeckProgress.find({
		userId,
		growthStage: { $gt: 0, $lt: VOCAB_GROWTH_STAGE_MAX },
	})
		.sort({ updatedAt: -1 })
		.limit(5)
		.lean();

	if (inProgressRows.length) {
		/** @type {Map<string, object[]>} */
		const siblingsByLevel = new Map();

		for (const row of inProgressRows) {
			const jlpt = normalizeJlptKey(row.jlpt || preferredJlpt);
			const level = levelFromJlpt(jlpt);
			if (!siblingsByLevel.has(level)) {
				const siblings = await vocabularyRepository.findAllDecks({
					level,
					isActive: true,
				});
				siblingsByLevel.set(level, siblings);
			}
			const siblings = siblingsByLevel.get(level) ?? [];
			const deck = siblings.find((d) => String(d._id) === String(row.deckId));
			if (!deck) continue;
			const lessonNo = lessonNoFromSiblings(siblings, row.deckId);
			const title =
				deck.title?.trim() ||
				deck.titleJa?.trim() ||
				`Bài ${lessonNo}`;
			items.push(
				buildItem({
					subjectId: 'vocab',
					kind: 'in_progress',
					title,
					subtitle: `${jlpt} · Bài ${lessonNo}`,
					percent: growthProgressPercent(
						row.growthStage,
						VOCAB_GROWTH_STAGE_MAX,
					),
					path: `/vocabulary/lesson/${lessonNo}?jlpt=${encodeURIComponent(jlpt)}&deckId=${encodeURIComponent(String(row.deckId))}`,
					touchedAt: row.updatedAt,
					meta: {
						lessonNo,
						jlpt,
						deckId: String(row.deckId),
						growthStage: row.growthStage,
						growthMax: VOCAB_GROWTH_STAGE_MAX,
					},
				}),
			);
		}
	}

	return items;
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {string} preferredJlpt
 */
async function collectKanjiCandidates(userId, preferredJlpt) {
	/** @type {ContinueItem[]} */
	const items = [];
	const jlpt = normalizeJlptKey(preferredJlpt);

	const inProgressRows = await KanjiDeckProgress.find({
		userId,
		growthStage: { $gt: 0, $lt: KANJI_LESSON_GROWTH_MAX },
	})
		.sort({ updatedAt: -1 })
		.limit(5)
		.lean();

	if (inProgressRows.length) {
		/** @type {Map<string, object[]>} */
		const siblingsByJlpt = new Map();

		for (const row of inProgressRows) {
			const rowJlpt = normalizeJlptKey(row.jlpt || jlpt);
			if (!siblingsByJlpt.has(rowJlpt)) {
				const siblings = await kanjiRepository.findAllDecks({
					jlpt: rowJlpt,
					isActive: true,
				});
				siblingsByJlpt.set(rowJlpt, siblings);
			}
			const siblings = siblingsByJlpt.get(rowJlpt) ?? [];
			const deck = siblings.find((d) => String(d._id) === String(row.deckId));
			if (!deck) continue;
			const lessonNo = lessonNoFromSiblings(siblings, row.deckId);
			const deckJlpt = rowJlpt;
			const title =
				deck.title?.trim() ||
				deck.titleJa?.trim() ||
				`Bài ${lessonNo}`;
			items.push(
				buildItem({
					subjectId: 'kanji',
					kind: 'in_progress',
					title,
					subtitle: `${deckJlpt} · Bài ${lessonNo}`,
					percent: growthProgressPercent(
						row.growthStage,
						KANJI_LESSON_GROWTH_MAX,
					),
					path: `/kanji/lesson/${lessonNo}?jlpt=${encodeURIComponent(deckJlpt)}&deckId=${encodeURIComponent(String(row.deckId))}`,
					touchedAt: row.updatedAt,
					meta: {
						lessonNo,
						jlpt: deckJlpt,
						deckId: String(row.deckId),
						growthStage: row.growthStage,
						growthMax: KANJI_LESSON_GROWTH_MAX,
					},
				}),
			);
		}
	}

	return items;
}

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
async function collectReadingCandidates(userId) {
	/** @type {ContinueItem[]} */
	const items = [];

	const rows = await ReadingArticleProgress.find({
		userId,
		status: 'in_progress',
	})
		.sort({ lastReadAt: -1 })
		.limit(5)
		.lean();

	if (!rows.length) return items;

	const articleIds = rows.map((r) => r.articleId);
	const articles = await ReadingArticle.find({
		_id: { $in: articleIds },
		isPublished: true,
	})
		.select('slug titleVi titleJa jlpt questions')
		.lean();
	const articleMap = new Map(articles.map((a) => [String(a._id), a]));

	for (const row of rows) {
		const article = articleMap.get(String(row.articleId));
		if (!article) continue;
		const totalQ = article.questions?.length ?? 0;
		const answered = (row.questionAnswers ?? []).length;
		const percent =
			totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0;
		const title =
			article.titleVi?.trim() || article.titleJa?.trim() || article.slug;

		items.push(
			buildItem({
				subjectId: 'reading',
				kind: 'in_progress',
				title,
				subtitle: article.jlpt || '',
				percent,
				path: `/reading/${encodeURIComponent(article.slug)}`,
				touchedAt: row.lastReadAt || row.updatedAt,
				meta: {
					slug: article.slug,
					answered,
					totalQuestions: totalQ,
					jlpt: article.jlpt,
				},
			}),
		);
	}

	return items;
}

async function collectGrammarCandidates(userId) {
	/** @type {ContinueItem[]} */
	const items = [];
	const rows = await listInProgressGrammar(userId);
	if (!rows.length) return items;

	const grammarIds = rows.map((r) => r.grammarId);
	const grammars = await Grammar.find({
		_id: { $in: grammarIds },
		isPublished: true,
	})
		.select('slug pattern jlpt')
		.lean();
	const map = new Map(grammars.map((g) => [String(g._id), g]));

	for (const row of rows) {
		const g = map.get(String(row.grammarId));
		if (!g) continue;
		const title = g.pattern?.trim() || g.slug;
		items.push(
			buildItem({
				subjectId: 'grammar',
				kind: 'in_progress',
				title,
				subtitle: g.jlpt || row.jlpt || '',
				percent: 0,
				path: `/grammar/${encodeURIComponent(g.slug)}`,
				touchedAt: row.lastReadAt || row.updatedAt,
				meta: { slug: g.slug, jlpt: g.jlpt },
			}),
		);
	}

	return items;
}

async function collectListeningCandidates(userId) {
	/** @type {ContinueItem[]} */
	const items = [];
	const rows = await listInProgressListening(userId);
	if (!rows.length) return items;

	const exerciseIds = rows.map((r) => r.exerciseId);
	const exercises = await ListeningExercise.find({
		_id: { $in: exerciseIds },
		isPublished: true,
	})
		.select('titleVi titleJa jlpt questions')
		.lean();
	const map = new Map(exercises.map((e) => [String(e._id), e]));

	for (const row of rows) {
		const ex = map.get(String(row.exerciseId));
		if (!ex) continue;
		const totalQ = ex.questions?.length ?? 0;
		const answered = (row.questionAnswers ?? []).length;
		const percent =
			totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0;
		const title = ex.titleVi?.trim() || ex.titleJa?.trim() || 'Listening';

		items.push(
			buildItem({
				subjectId: 'listening',
				kind: 'in_progress',
				title,
				subtitle: ex.jlpt || '',
				percent,
				path: `/listening/${encodeURIComponent(String(row.exerciseId))}`,
				touchedAt: row.lastActivityAt || row.updatedAt,
				meta: {
					exerciseId: String(row.exerciseId),
					answered,
					totalQuestions: totalQ,
					jlpt: ex.jlpt,
				},
			}),
		);
	}

	return items;
}

async function collectKaiwaCandidates(userId) {
	/** @type {ContinueItem[]} */
	const items = [];

	const sessions = await KaiwaPracticeSession.find({
		userId,
		isCompleted: false,
		turnCount: { $gt: 0 },
	})
		.sort({ lastActivityAt: -1 })
		.limit(3)
		.select('contextId contextTitleVi contextTitleJa jlpt turnCount lastActivityAt')
		.lean();

	for (const s of sessions) {
		const title =
			s.contextTitleVi?.trim() ||
			s.contextTitleJa?.trim() ||
			'Kaiwa';
		items.push(
			buildItem({
				subjectId: 'kaiwa',
				kind: 'in_progress',
				title,
				subtitle: s.jlpt || '',
				percent: 0,
				path: `/kaiwa/${encodeURIComponent(String(s.contextId))}/practice?sessionId=${encodeURIComponent(String(s._id))}`,
				touchedAt: s.lastActivityAt || s.updatedAt,
				meta: {
					sessionId: String(s._id),
					contextId: String(s.contextId),
					turnCount: s.turnCount ?? 0,
				},
			}),
		);
	}

	return items;
}

/**
 * Bài gợi ý tiếp theo khi chưa có dở dang.
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {string} preferredJlpt
 */
async function buildSuggestedVocab(userId, preferredJlpt) {
	const level = levelFromJlpt(preferredJlpt);
	const jlpt = normalizeJlptKey(preferredJlpt);
	const siblings = await vocabularyRepository.findAllDecks({
		level,
		isActive: true,
	});
	if (!siblings.length) return null;

	const progressRows = await VocabularyDeckProgress.find({
		userId,
		deckId: { $in: siblings.map((d) => d._id) },
	})
		.select('deckId growthStage updatedAt')
		.lean();
	const progressMap = new Map(
		progressRows.map((r) => [String(r.deckId), r]),
	);

	for (let i = 0; i < siblings.length; i++) {
		const deck = siblings[i];
		const lessonNo = i + 1;
		const row = progressMap.get(String(deck._id));
		const stage = row?.growthStage ?? 0;
		if (stage >= VOCAB_GROWTH_STAGE_MAX) continue;
		if (
			!isVocabLessonUnlockedByGrowth(
				siblings,
				lessonNo,
				new Map(
					[...progressMap.entries()].map(([id, r]) => [
						id,
						r.growthStage ?? 0,
					]),
				),
			)
		) {
			continue;
		}

		const title =
			deck.title?.trim() ||
			deck.titleJa?.trim() ||
			`Bài ${lessonNo}`;
		return buildItem({
			subjectId: 'vocab',
			kind: 'suggested',
			title,
			subtitle: `${jlpt} · Bài ${lessonNo}`,
			percent: growthProgressPercent(stage, VOCAB_GROWTH_STAGE_MAX),
			path: `/vocabulary/lesson/${lessonNo}?jlpt=${encodeURIComponent(jlpt)}&deckId=${encodeURIComponent(String(deck._id))}`,
			touchedAt: row?.updatedAt || new Date(0),
			meta: {
				lessonNo,
				jlpt,
				deckId: String(deck._id),
				growthStage: stage,
				growthMax: VOCAB_GROWTH_STAGE_MAX,
			},
		});
	}

	return null;
}

async function buildSuggestedKanji(userId, preferredJlpt) {
	const jlpt = normalizeJlptKey(preferredJlpt);
	const siblings = await kanjiRepository.findAllDecks({
		jlpt,
		isActive: true,
	});
	if (!siblings.length) return null;

	const progressRows = await KanjiDeckProgress.find({
		userId,
		deckId: { $in: siblings.map((d) => d._id) },
	})
		.select('deckId growthStage updatedAt')
		.lean();
	const progressMap = new Map(
		progressRows.map((r) => [String(r.deckId), r]),
	);

	for (let i = 0; i < siblings.length; i++) {
		const deck = siblings[i];
		const lessonNo = i + 1;
		const row = progressMap.get(String(deck._id));
		const stage = row?.growthStage ?? 0;
		if (stage >= KANJI_LESSON_GROWTH_MAX) continue;
		if (
			!isVocabLessonUnlockedByGrowth(
				siblings,
				lessonNo,
				new Map(
					[...progressMap.entries()].map(([id, r]) => [
						id,
						r.growthStage ?? 0,
					]),
				),
			)
		) {
			continue;
		}

		const title =
			deck.title?.trim() ||
			deck.titleJa?.trim() ||
			`Bài ${lessonNo}`;
		return buildItem({
			subjectId: 'kanji',
			kind: 'suggested',
			title,
			subtitle: `${jlpt} · Bài ${lessonNo}`,
			percent: growthProgressPercent(stage, KANJI_LESSON_GROWTH_MAX),
			path: `/kanji/lesson/${lessonNo}?jlpt=${encodeURIComponent(jlpt)}&deckId=${encodeURIComponent(String(deck._id))}`,
			touchedAt: row?.updatedAt || new Date(0),
			meta: {
				lessonNo,
				jlpt,
				deckId: String(deck._id),
				growthStage: stage,
				growthMax: KANJI_LESSON_GROWTH_MAX,
			},
		});
	}

	return null;
}

async function buildSuggestedReading(userId, preferredJlpt) {
	const jlpt = normalizeJlptKey(preferredJlpt);
	const articles = await ReadingArticle.find({
		isPublished: true,
		jlpt,
	})
		.sort({ displayOrder: 1, createdAt: 1, _id: 1 })
		.limit(30)
		.select('slug titleVi titleJa jlpt questions')
		.lean();

	if (!articles.length) return null;

	const progressRows = await ReadingArticleProgress.find({
		userId,
		articleId: { $in: articles.map((a) => a._id) },
	})
		.select('articleId status questionAnswers lastReadAt updatedAt')
		.lean();
	const progressByArticle = new Map(
		progressRows.map((p) => [String(p.articleId), p]),
	);

	const article = articles.find((a) => {
		const p = progressByArticle.get(String(a._id));
		return !p || p.status !== 'done';
	});
	if (!article) return null;

	const progress = progressByArticle.get(String(article._id));

	const totalQ = article.questions?.length ?? 0;
	const answered = progress?.questionAnswers?.length ?? 0;
	const percent =
		totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0;

	return buildItem({
		subjectId: 'reading',
		kind: 'suggested',
		title:
			article.titleVi?.trim() ||
			article.titleJa?.trim() ||
			article.slug,
		subtitle: jlpt,
		percent,
		path: `/reading/${encodeURIComponent(article.slug)}`,
		touchedAt: progress?.lastReadAt || new Date(0),
		meta: {
			slug: article.slug,
			answered,
			totalQuestions: totalQ,
		},
	});
}

function sortContinueItems(items) {
	return [...items].sort((a, b) => {
		if (a.kind !== b.kind) {
			return a.kind === 'in_progress' ? -1 : 1;
		}
		const ta = new Date(a.touchedAt).getTime();
		const tb = new Date(b.touchedAt).getTime();
		if (tb !== ta) return tb - ta;
		const ia = SUBJECT_ORDER.indexOf(a.subjectId);
		const ib = SUBJECT_ORDER.indexOf(b.subjectId);
		return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
	});
}

/**
 * Danh sách tiếp tục học + gợi ý cho dashboard / header.
 * @param {import('mongoose').Types.ObjectId | string} userId
 */
export async function getContinueStudy(userId) {
	const preferredJlpt = await resolvePreferredJlpt(userId);

	const [
		vocab,
		kanji,
		reading,
		grammar,
		listening,
		kaiwa,
	] = await Promise.all([
		collectVocabCandidates(userId, preferredJlpt),
		collectKanjiCandidates(userId, preferredJlpt),
		collectReadingCandidates(userId),
		collectGrammarCandidates(userId),
		collectListeningCandidates(userId),
		collectKaiwaCandidates(userId),
	]);

	let inProgress = sortContinueItems([
		...vocab,
		...kanji,
		...reading,
		...grammar,
		...listening,
		...kaiwa,
	]);

	/** @type {ContinueItem[]} */
	let suggested = [];

	if (!inProgress.length) {
		const [sVocab, sKanji, sReading] = await Promise.all([
			buildSuggestedVocab(userId, preferredJlpt),
			buildSuggestedKanji(userId, preferredJlpt),
			buildSuggestedReading(userId, preferredJlpt),
		]);
		suggested = [sVocab, sKanji, sReading].filter(Boolean);
	}

	const items = [...inProgress, ...suggested].slice(0, 8);

	return {
		primary: items[0] ?? null,
		items,
		preferredJlpt,
	};
}
