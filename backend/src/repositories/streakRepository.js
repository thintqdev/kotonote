import Streak from '../models/Streak.js';

export const findStreakByUserId = async (userId) => {
	return await Streak.findOne({ userId });
};

export const createStreak = async (userId) => {
	const streak = new Streak({ userId });
	return await streak.save();
};

export const getOrCreateStreak = async (userId) => {
	let streak = await findStreakByUserId(userId);
	
	if (!streak) {
		streak = await createStreak(userId);
	}
	
	return streak;
};

export const getTopStreaks = async (limit = 10) => {
	return await Streak.find()
		.sort({ currentStreak: -1 })
		.limit(limit)
		.populate('userId', 'name email avatar');
};

export const getStreakStats = async () => {
	const stats = await Streak.aggregate([
		{
			$group: {
				_id: null,
				totalUsers: { $sum: 1 },
				avgCurrentStreak: { $avg: '$currentStreak' },
				avgLongestStreak: { $avg: '$longestStreak' },
				totalCheckIns: { $sum: '$totalCheckIns' },
			},
		},
	]);
	
	return stats[0] || {
		totalUsers: 0,
		avgCurrentStreak: 0,
		avgLongestStreak: 0,
		totalCheckIns: 0,
	};
};
