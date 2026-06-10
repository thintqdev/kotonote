import Grammar from '../models/Grammar.js';
import VocabularyDeck from '../models/VocabularyDeck.js';
import Vocabulary from '../models/Vocabulary.js';
import KanjiDeck from '../models/KanjiDeck.js';
import Kanji from '../models/Kanji.js';
import ReadingArticle from '../models/ReadingArticle.js';
import { DASHBOARD_CATALOG_COUNTS_TTL_MS } from '../constants/dashboardHome.js';

/** @type {{ data: DashboardCatalogCounts | null, at: number }} */
let cache = { data: null, at: 0 };

/** @type {Promise<DashboardCatalogCounts> | null} */
let pending = null;

/**
 * @typedef {object} DashboardCatalogCounts
 * @property {number} grammarTotal
 * @property {number} vocabDecksActive
 * @property {number} vocabWordsTotal
 * @property {number} kanjiDecksActive
 * @property {number} kanjiTotal
 * @property {number} readingTotal
 */

async function fetchCatalogCounts() {
	const [
		grammarTotal,
		vocabDecksActive,
		vocabWordsTotal,
		kanjiDecksActive,
		kanjiTotal,
		readingTotal,
	] = await Promise.all([
		Grammar.countDocuments({ isPublished: true }),
		VocabularyDeck.countDocuments({ isActive: true }),
		Vocabulary.countDocuments({ isActive: true }),
		KanjiDeck.countDocuments({ isActive: true }),
		Kanji.countDocuments(),
		ReadingArticle.countDocuments({ isPublished: true }),
	]);

	return {
		grammarTotal,
		vocabDecksActive,
		vocabWordsTotal,
		kanjiDecksActive,
		kanjiTotal,
		readingTotal,
	};
}

export function invalidateDashboardCatalogCountsCache() {
	cache = { data: null, at: 0 };
}

/**
 * CountDocuments toàn cục cho dashboard — cache in-memory + dedupe request đồng thời.
 * @param {{ force?: boolean }} [opts]
 * @returns {Promise<DashboardCatalogCounts>}
 */
export async function getDashboardCatalogCounts(opts = {}) {
	const { force = false } = opts;
	const now = Date.now();

	if (
		!force &&
		cache.data &&
		now - cache.at < DASHBOARD_CATALOG_COUNTS_TTL_MS
	) {
		return cache.data;
	}

	if (!pending) {
		pending = fetchCatalogCounts()
			.then((data) => {
				cache = { data, at: Date.now() };
				pending = null;
				return data;
			})
			.catch((err) => {
				pending = null;
				throw err;
			});
	}

	return pending;
}
