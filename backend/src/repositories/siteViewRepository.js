import SiteViewDaily from '../models/SiteViewDaily.js';

export function dayKeyFromDate(d = new Date()) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

/**
 * @param {string} [dateKey]
 */
export const incrementDailyViews = async (dateKey = dayKeyFromDate()) => {
	const doc = await SiteViewDaily.findOneAndUpdate(
		{ dateKey },
		{ $inc: { views: 1 }, $setOnInsert: { dateKey } },
		{ upsert: true, new: true },
	).lean();
	return doc?.views ?? 1;
};

/**
 * @param {string[]} dateKeys
 * @returns {Promise<Map<string, number>>}
 */
export const getViewsByDateKeys = async (dateKeys) => {
	if (!dateKeys?.length) return new Map();
	const rows = await SiteViewDaily.find({ dateKey: { $in: dateKeys } })
		.select('dateKey views')
		.lean();
	const map = new Map();
	for (const row of rows) {
		map.set(row.dateKey, Number(row.views || 0));
	}
	return map;
};

export const getViewsForDateKey = async (dateKey = dayKeyFromDate()) => {
	const row = await SiteViewDaily.findOne({ dateKey }).select('views').lean();
	return Number(row?.views || 0);
};
