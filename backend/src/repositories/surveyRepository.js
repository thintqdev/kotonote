import Survey from '../models/Survey.js';
import {
	SURVEY_DAILY_TIME_KEYS,
	SURVEY_DISCOVERY_KEYS,
	SURVEY_GOAL_KEYS,
	SURVEY_LEVEL_KEYS,
	SURVEY_WEAK_AREA_KEYS,
} from '../constants/survey.js';

export const findSurveyByUserId = async (userId) => {
	return await Survey.findOne({ userId });
};

export const createSurvey = async (surveyData) => {
	const survey = new Survey(surveyData);
	return await survey.save();
};

export const updateSurvey = async (userId, updateData) => {
	return await Survey.findOneAndUpdate(
		{ userId },
		{ ...updateData, completedAt: Date.now() },
		{ new: true, runValidators: true }
	);
};

export const getAllSurveys = async (filters = {}) => {
	return await Survey.find(filters).populate('userId', 'name email');
};

/**
 * Chuẩn hoá mảng { _id, count } từ $group → [{ key, count }] theo thứ tự chart.
 * @param {string[]} orderedKeys
 * @param {{ _id: string | null, count: number }[]} groups
 */
const seriesFromGroups = (orderedKeys, groups) => {
	const map = new Map();
	for (const g of groups) {
		const raw = g._id;
		const k =
			raw === null || raw === undefined || raw === ''
				? 'unspecified'
				: String(raw);
		map.set(k, (map.get(k) ?? 0) + (g.count ?? 0));
	}
	return orderedKeys.map((key) => ({
		key,
		count: map.get(key) ?? 0,
	}));
};

/**
 * Thống kê khảo sát dạng chuỗi { key, count } theo từng hạng mục — phục vụ biểu đồ.
 */
export const getSurveyStats = async () => {
	const [row] = await Survey.aggregate([
		{
			$facet: {
				total: [{ $count: 'count' }],
				byLevel: [
					{ $group: { _id: '$level', count: { $sum: 1 } } },
				],
				byGoal: [
					{ $group: { _id: '$goal', count: { $sum: 1 } } },
				],
				byDailyTime: [
					{ $group: { _id: '$dailyTime', count: { $sum: 1 } } },
				],
				byDiscovery: [
					{
						$group: {
							_id: {
								$ifNull: ['$discovery', 'unspecified'],
							},
							count: { $sum: 1 },
						},
					},
				],
				byWeakArea: [
					{ $unwind: '$weakAreas' },
					{ $group: { _id: '$weakAreas', count: { $sum: 1 } } },
				],
			},
		},
	]);

	if (!row) {
		return emptyChartStats();
	}

	const totalSurveys = row.total[0]?.count ?? 0;

	return {
		totalSurveys,
		byLevel: seriesFromGroups(SURVEY_LEVEL_KEYS, row.byLevel ?? []),
		byGoal: seriesFromGroups(SURVEY_GOAL_KEYS, row.byGoal ?? []),
		byDailyTime: seriesFromGroups(SURVEY_DAILY_TIME_KEYS, row.byDailyTime ?? []),
		byDiscovery: seriesFromGroups(SURVEY_DISCOVERY_KEYS, row.byDiscovery ?? []),
		byWeakArea: seriesFromGroups(SURVEY_WEAK_AREA_KEYS, row.byWeakArea ?? []),
	};
};

function emptyChartStats() {
	return {
		totalSurveys: 0,
		byLevel: seriesFromGroups(SURVEY_LEVEL_KEYS, []),
		byGoal: seriesFromGroups(SURVEY_GOAL_KEYS, []),
		byDailyTime: seriesFromGroups(SURVEY_DAILY_TIME_KEYS, []),
		byDiscovery: seriesFromGroups(SURVEY_DISCOVERY_KEYS, []),
		byWeakArea: seriesFromGroups(SURVEY_WEAK_AREA_KEYS, []),
	};
}
