import User from '../models/User.js';
import Badge from '../models/Badge.js';
import * as notificationService from './notificationService.js';
import { getIo } from '../config/ioRegistry.js';
import { sendNotificationToUser } from '../config/socket.js';
import { resolveMilestoneBadgeKey } from '../constants/badgeMilestones.js';

/**
 * Danh sách badge hiển thị trên profile (đã unlock + join metadata).
 * @param {{ earnedBadges?: { badgeKey: string, unlockedAt?: Date }[] }} userPlain — object sau toJSON()
 */
export async function buildBadgesDisplayForUser(userPlain) {
	const earned = userPlain?.earnedBadges;
	if (!Array.isArray(earned) || earned.length === 0) return [];

	const keys = [...new Set(earned.map((e) => e.badgeKey).filter(Boolean))];
	const defs = await Badge.find({ key: { $in: keys } }).lean();
	const byKey = Object.fromEntries(defs.map((b) => [b.key, b]));

	return [...earned]
		.sort((a, b) => {
			const ta = new Date(a.unlockedAt || 0).getTime();
			const tb = new Date(b.unlockedAt || 0).getTime();
			return tb - ta;
		})
		.map((e) => {
			const def = byKey[e.badgeKey];
			const labelVi = def?.nameVi?.trim() || e.badgeKey;
			const labelJa = def?.nameJa?.trim() || e.badgeKey;
			return {
				id: e.badgeKey,
				badgeKey: e.badgeKey,
				label: labelVi,
				labelVi,
				labelJa,
				emoji: def?.emoji?.trim() || '🏅',
				iconImage: def?.iconImage?.trim() || '',
				unlockedAt: e.unlockedAt,
			};
		});
}

/**
 * Gắn badge cho user (idempotent), gửi notification + Socket.IO.
 * @returns {Promise<{ unlocked: boolean, reason?: string, badge?: object }>}
 */
export async function unlockBadgeForUser(userId, badgeKey) {
	const key = String(badgeKey || '')
		.trim()
		.toLowerCase();
	if (!key) {
		return { unlocked: false, reason: 'invalid_key' };
	}

	const badge = await Badge.findOne({ key, isActive: true }).lean();
	if (!badge) {
		return { unlocked: false, reason: 'badge_not_found' };
	}

	const res = await User.updateOne(
		{
			_id: userId,
			earnedBadges: { $not: { $elemMatch: { badgeKey: key } } },
		},
		{
			$push: {
				earnedBadges: {
					badgeKey: key,
					unlockedAt: new Date(),
				},
			},
		}
	);

	if (res.modifiedCount === 0) {
		return { unlocked: false, reason: 'already_unlocked', badge };
	}

	const nameVi = badge.nameVi?.trim() || key;
	const nameJa = badge.nameJa?.trim() || key;
	const title = 'Thành tựu mở khóa';
	const message = `Bạn đã mở khóa: ${nameVi}`;

	const notification = await notificationService.createNotification({
		userId,
		title,
		message,
		description: nameJa !== nameVi ? nameJa : '',
		type: 'success',
		category: 'achievement',
		priority: 'high',
		actionType: 'open_page',
		actionData: {
			path: '/profile',
			hash: 'badges',
			badgeKey: key,
		},
		metadata: {
			templateType: 'achievement_unlocked',
			variables: { badgeKey: key, nameVi, nameJa },
		},
		source: 'system',
	});

	const io = getIo();
	if (io) {
		sendNotificationToUser(io, String(userId), notification);
	}

	return { unlocked: true, badge, notificationId: String(notification._id) };
}

/**
 * Thử unlock badge theo track + mốc count (chỉ khi count khớp một ngưỡng đã khai báo).
 * @param {import('mongoose').Types.ObjectId|string} userId
 * @param {keyof typeof import('../constants/badgeMilestones.js').BADGE_MILESTONE_TRACKS} track
 * @param {number} count
 */
export async function tryUnlockMilestoneBadge(userId, track, count) {
	const badgeKey = resolveMilestoneBadgeKey(track, count);
	if (!badgeKey) return null;
	return unlockBadgeForUser(userId, badgeKey);
}

/**
 * Sau streak check-in: mốc 7 / 30 / 100 ngày.
 */
export async function tryUnlockStreakBadgesForCount(userId, currentStreak) {
	return tryUnlockMilestoneBadge(userId, 'streak', currentStreak);
}

/**
 * Sau hoàn thành bài đọc: mốc 1 / 10 bài (status `done`).
 */
export async function tryUnlockReadingBadgesForCount(userId, completedCount) {
	return tryUnlockMilestoneBadge(userId, 'reading', completedCount);
}

/**
 * Gọi sau sự kiện nghiệp vụ — không throw (không chặn luồng chính).
 */
export async function safeTryUnlockMilestoneBadge(userId, track, count) {
	try {
		return await tryUnlockMilestoneBadge(userId, track, count);
	} catch (err) {
		console.warn(
			`[badge] milestone unlock failed track=${track} count=${count}:`,
			err?.message || err
		);
		return null;
	}
}
