import Badge from '../models/Badge.js';

export const findAllBadges = async (filters = {}) => {
	return await Badge.find(filters).sort({ displayOrder: 1, createdAt: -1 });
};

export const findBadgeById = async (badgeId) => {
	return await Badge.findById(badgeId);
};

export const findBadgeByKey = async (key) => {
	return await Badge.findOne({ key: String(key || '').trim().toLowerCase() });
};

export const createBadge = async (badgeData) => {
	const badge = new Badge(badgeData);
	return await badge.save();
};

export const updateBadge = async (badgeId, updateData) => {
	return await Badge.findByIdAndUpdate(badgeId, updateData, {
		new: true,
		runValidators: true,
	});
};

export const deleteBadge = async (badgeId) => {
	return await Badge.findByIdAndDelete(badgeId);
};
