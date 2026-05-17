import User from '../models/User.js';
import {
	DEFAULT_FOCUS_AREA_KEYS,
	FOCUS_AREA_MAX,
	focusAreaOptionsPayload,
	normalizeFocusAreaKeys,
} from '../constants/focusAreas.js';

/**
 * @param {import('mongoose').Types.ObjectId} userId
 */
export const getFocusAreas = async (userId) => {
	const user = await User.findById(userId).select('profile').lean();
	if (!user) return null;

	const profile = user.profile || {};
	const selectedKeys = normalizeFocusAreaKeys(
		profile.focusAreaKeys ?? DEFAULT_FOCUS_AREA_KEYS,
	);

	return {
		selectedKeys,
		maxSelectable: FOCUS_AREA_MAX,
		options: focusAreaOptionsPayload(),
	};
};

/**
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {unknown} keys
 */
export const updateFocusAreas = async (userId, keys) => {
	const user = await User.findById(userId);
	if (!user) return null;

	user.profile = user.profile || {};
	user.profile.focusAreaKeys = normalizeFocusAreaKeys(keys);
	await user.save();

	return getFocusAreas(userId);
};
