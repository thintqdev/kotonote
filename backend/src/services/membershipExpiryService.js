import User from '../models/User.js';
import { MEMBERSHIP_BILLING, jlptUnlockedForTier } from '../constants/membership.js';

/**
 * Hết hạn gói yearly đã quá `expiresAt` — ghi `status: expired` vào DB.
 * Lifetime và gói free không bị ảnh hưởng.
 */
export async function expireDueMemberships() {
	const now = new Date();
	const users = await User.find({
		'membership.status': 'active',
		'membership.billing': MEMBERSHIP_BILLING.YEARLY,
		'membership.expiresAt': { $ne: null, $lt: now },
	}).select('_id membership email');

	let expiredCount = 0;
	for (const user of users) {
		user.membership.status = 'expired';
		user.membership.jlptUnlocked = jlptUnlockedForTier('free');
		user.markModified('membership');
		// eslint-disable-next-line no-await-in-loop
		await user.save();
		expiredCount += 1;
	}

	return {
		scanned: users.length,
		expiredCount,
		ranAt: now,
	};
}
