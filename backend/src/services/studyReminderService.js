import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { USER_STATUS } from '../constants/userStatus.js';
import { normalizeProfileTimeZoneKey } from '../constants/profileLocale.js';
import { normalizeUserSettings } from '../constants/userSettings.js';
import {
	getUserLocalDateParts,
	isWeekendDay,
	resolveUserOffsetMinutes,
} from '../utils/userLocalTime.js';
import * as notificationService from './notificationService.js';
import { getIo } from '../config/ioRegistry.js';
import { sendNotificationToUser } from '../config/socket.js';

const REMINDER_KIND = 'daily_study';

function reminderCopy(dailyGoalMinutes, useJa) {
	if (useJa) {
		return {
			title: '学習の時間です',
			message: `今日の目標は${dailyGoalMinutes}分です。さっそく始めましょう。`,
		};
	}
	return {
		title: 'Đến giờ học rồi',
		message: `Mục tiêu hôm nay: ${dailyGoalMinutes} phút. Mở app và học một chút nhé.`,
	};
}

async function alreadySentToday(userId, localDate) {
	return Boolean(
		await Notification.exists({
			userId,
			source: 'system',
			'metadata.reminderKind': REMINDER_KIND,
			'metadata.localDate': localDate,
		}),
	);
}

/**
 * Gửi nhắc học in-app cho user đủ điều kiện tại phút hiện tại (theo múi giờ hồ sơ).
 */
export async function processStudyReminders(now = new Date()) {
	const users = await User.find({
		status: USER_STATUS.ACTIVE,
		'settings.study.reminderEnabled': true,
		'settings.notifications.dailyStudyReminder': true,
	})
		.select('_id profile settings')
		.lean();

	if (!users.length) return { scanned: 0, sent: 0 };

	let sent = 0;

	for (const user of users) {
		const settings = normalizeUserSettings(user.settings);
		const reminderTime = settings.study.reminderTime;
		const offset = resolveUserOffsetMinutes(
			user.profile?.timeZoneLabel,
			user.profile?.location,
		);
		const local = getUserLocalDateParts(now, offset);
		const [, minuteSlot] = local.time.split(':');

		if (minuteSlot !== '00' && minuteSlot !== '30') continue;
		if (local.time !== reminderTime) continue;

		if (!settings.study.reminderWeekends && isWeekendDay(local.dayOfWeek)) {
			continue;
		}

		if (await alreadySentToday(user._id, local.dateIso)) continue;

		const useJa =
			user.profile?.location === 'jp' ||
			normalizeProfileTimeZoneKey(user.profile?.timeZoneLabel) === 'gmt+9';

		const { title, message } = reminderCopy(
			settings.study.dailyGoalMinutes,
			useJa,
		);

		const notification = await notificationService.createNotification({
			userId: user._id,
			title,
			message,
			type: 'info',
			category: 'system',
			priority: 'normal',
			actionType: 'open_page',
			actionData: { path: '/' },
			metadata: {
				reminderKind: REMINDER_KIND,
				localDate: local.dateIso,
				reminderTime,
			},
			source: 'system',
		});

		const io = getIo();
		if (io) {
			sendNotificationToUser(io, String(user._id), notification);
		}

		sent += 1;
	}

	return { scanned: users.length, sent };
}
