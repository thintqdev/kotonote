import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { USER_STATUS } from '../constants/userStatus.js';
import { REMINDER_KIND } from '../constants/smartReminders.js';
import * as arenaRepository from '../repositories/arenaRepository.js';
import {
	getArenaWindowState,
	isArenaReminderWindow,
} from '../utils/arenaTime.js';
import * as notificationService from './notificationService.js';
import { getIo } from '../config/ioRegistry.js';
import { sendNotificationToUser } from '../config/socket.js';

function userPrefersJa(user) {
	return user.profile?.location === 'jp';
}

async function alreadySentArenaReminder(userId, arenaDateKey) {
	return Boolean(
		await Notification.exists({
			userId,
			source: 'system',
			'metadata.reminderKind': REMINDER_KIND.ARENA_UPCOMING,
			'metadata.arenaDateKey': arenaDateKey,
		}),
	);
}

function arenaReminderCopy(settings, window, useJa) {
	const start = settings.startTime || '20:00';
	const end = settings.endTime || '24:00';
	const mins = settings.reminderMinutesBefore ?? 30;
	if (useJa) {
		return {
			title: '日本語アリーナまもなく開始',
			message: `あと約${mins}分で開催（${start}–${end}）。ランキングを目指して参加しましょう。`,
		};
	}
	return {
		title: 'Đấu trường tiếng Nhật sắp mở',
		message: `Còn khoảng ${mins} phút nữa (${start}–${end}). Vào thi để tranh top BXH nhé!`,
	};
}

async function deliverArenaReminder(user, payload) {
	const notification = await notificationService.createNotification({
		userId: user._id,
		source: 'system',
		type: 'info',
		category: 'learning',
		priority: 'high',
		actionType: 'open_page',
		actionData: { path: '/arena' },
		...payload,
	});

	const io = getIo();
	if (io) {
		sendNotificationToUser(io, String(user._id), notification);
	}
	return notification;
}

/**
 * Nhắc trước giờ mở đấu trường (theo lịch admin, ví dụ T7 19:30 cho mở 20:00).
 */
export async function processArenaReminders(now = new Date()) {
	const settings = await arenaRepository.getOrCreateSettings();
	if (!settings.enabled) {
		return { scanned: 0, sent: 0 };
	}

	const window = getArenaWindowState(settings, now);
	if (!isArenaReminderWindow(settings, window)) {
		return { scanned: 0, sent: 0, skipped: 'not_reminder_window' };
	}

	const users = await User.find({ status: USER_STATUS.ACTIVE })
		.select('_id profile')
		.lean();

	let sent = 0;
	for (const user of users) {
		if (await alreadySentArenaReminder(user._id, window.dateKey)) {
			continue;
		}
		const useJa = userPrefersJa(user);
		const { title, message } = arenaReminderCopy(settings, window, useJa);
		await deliverArenaReminder(user, {
			title,
			message,
			metadata: {
				reminderKind: REMINDER_KIND.ARENA_UPCOMING,
				arenaDateKey: window.dateKey,
				localDate: window.dateKey,
			},
		});
		sent += 1;
	}

	return { scanned: users.length, sent, dateKey: window.dateKey };
}
