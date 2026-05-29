import Survey from '../models/Survey.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import MembershipCheckout from '../models/MembershipCheckout.js';
import * as siteViewRepository from '../repositories/siteViewRepository.js';

function startOfDay(d) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

function dayKey(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function buildLast7Days() {
	const now = new Date();
	const days = [];
	for (let i = 6; i >= 0; i -= 1) {
		const d = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
		days.push({
			key: dayKey(d),
			date: d,
			label: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
		});
	}
	return days;
}

function toCountMap(rows) {
	const map = new Map();
	for (const r of rows || []) {
		const k = r?._id ? String(r._id) : '';
		map.set(k, Number(r?.count || 0));
	}
	return map;
}

async function aggregateByCreatedAt(Model, match = {}) {
	return Model.aggregate([
		{ $match: match },
		{
			$project: {
				day: {
					$dateToString: {
						format: '%Y-%m-%d',
						date: '$createdAt',
					},
				},
			},
		},
		{ $group: { _id: '$day', count: { $sum: 1 } } },
	]);
}

export async function getAdminOverviewStats() {
	const days = buildLast7Days();
	const since = days[0].date;

	const dayKeys = days.map((d) => d.key);
	const todayKey = dayKey(new Date());

	const [
		totalUsers,
		activeUsers,
		totalSurveys,
		surveyToday,
		feedbackOpen,
		feedbackToday,
		checkoutsToday,
		paidToday,
		viewsToday,
		viewsByDayMap,
		surveyByDayRows,
		feedbackByDayRows,
		checkoutByDayRows,
		paidByDayRows,
		recentOpenFeedbacks,
		weakAreaGroups,
	] = await Promise.all([
		User.countDocuments({}),
		User.countDocuments({ status: 'active' }),
		Survey.countDocuments({}),
		Survey.countDocuments({ createdAt: { $gte: startOfDay(new Date()) } }),
		Feedback.countDocuments({ status: 'open' }),
		Feedback.countDocuments({ createdAt: { $gte: startOfDay(new Date()) } }),
		MembershipCheckout.countDocuments({ createdAt: { $gte: startOfDay(new Date()) } }),
		MembershipCheckout.countDocuments({
			status: 'paid',
			createdAt: { $gte: startOfDay(new Date()) },
		}),
		siteViewRepository.getViewsForDateKey(todayKey),
		siteViewRepository.getViewsByDateKeys(dayKeys),
		aggregateByCreatedAt(Survey, { createdAt: { $gte: since } }),
		aggregateByCreatedAt(Feedback, { createdAt: { $gte: since } }),
		aggregateByCreatedAt(MembershipCheckout, { createdAt: { $gte: since } }),
		aggregateByCreatedAt(MembershipCheckout, {
			status: 'paid',
			createdAt: { $gte: since },
		}),
		Feedback.find({ status: 'open' })
			.sort({ createdAt: -1 })
			.limit(5)
			.populate('userId', 'name email')
			.lean(),
		Survey.aggregate([
			{ $unwind: '$weakAreas' },
			{ $group: { _id: '$weakAreas', count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 3 },
		]),
	]);

	const surveyMap = toCountMap(surveyByDayRows);
	const feedbackMap = toCountMap(feedbackByDayRows);
	const checkoutMap = toCountMap(checkoutByDayRows);
	const paidMap = toCountMap(paidByDayRows);

	const trends7d = days.map((d) => ({
		dateKey: d.key,
		label: d.label,
		views: viewsByDayMap.get(d.key) ?? 0,
		surveys: surveyMap.get(d.key) ?? 0,
		feedbacks: feedbackMap.get(d.key) ?? 0,
		checkouts: checkoutMap.get(d.key) ?? 0,
		paid: paidMap.get(d.key) ?? 0,
	}));

	const totalCheckouts7d = trends7d.reduce((s, row) => s + row.checkouts, 0);
	const totalPaid7d = trends7d.reduce((s, row) => s + row.paid, 0);
	const conversion7d =
		totalCheckouts7d > 0
			? Number(((totalPaid7d / totalCheckouts7d) * 100).toFixed(1))
			: 0;

	return {
		kpis: {
			totalUsers,
			activeUsers,
			totalSurveys,
			surveyToday,
			feedbackOpen,
			feedbackToday,
			checkoutsToday,
			paidToday,
			viewsToday,
			conversion7d,
		},
		trends7d,
		todo: {
			recentOpenFeedbacks: recentOpenFeedbacks.map((f) => ({
				_id: String(f._id),
				category: f.category,
				message: f.message,
				pageUrl: f.pageUrl || '',
				createdAt: f.createdAt,
				user: f.userId && typeof f.userId === 'object'
					? {
						name: f.userId.name || '',
						email: f.userId.email || '',
					}
					: null,
			})),
			topWeakAreas: weakAreaGroups.map((r) => ({
				key: String(r._id || ''),
				count: Number(r.count || 0),
			})),
		},
	};
}

