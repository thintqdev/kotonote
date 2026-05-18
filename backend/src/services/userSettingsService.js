import User from '../models/User.js';
import { normalizeUserSettings } from '../constants/userSettings.js';

/**
 * @param {import('mongoose').Types.ObjectId} userId
 */
export const getUserSettings = async (userId) => {
	const user = await User.findById(userId).select('settings').lean();
	if (!user) return null;
	return normalizeUserSettings(user.settings);
};

/**
 * Gộp patch vào settings hiện tại.
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {Record<string, unknown>} patch
 */
export const updateUserSettings = async (userId, patch) => {
	const user = await User.findById(userId);
	if (!user) return null;

	const current = normalizeUserSettings(user.settings);
	const next = normalizeUserSettings({
		notifications: {
			...current.notifications,
			...(patch.notifications && typeof patch.notifications === 'object'
				? patch.notifications
				: {}),
		},
		study: {
			...current.study,
			...(patch.study && typeof patch.study === 'object' ? patch.study : {}),
		},
		privacy: {
			...current.privacy,
			...(patch.privacy && typeof patch.privacy === 'object' ? patch.privacy : {}),
		},
	});

	user.settings = next;
	user.markModified('settings');
	await user.save();

	return next;
};
