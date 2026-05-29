import User from '../models/User.js';
import Streak from '../models/Streak.js';
import Notification from '../models/Notification.js';
import { USER_STATUS } from '../constants/userStatus.js';
import { normalizeProfileTimeZoneKey } from '../constants/profileLocale.js';
import { normalizeUserSettings } from '../constants/userSettings.js';
import {
	REMINDER_KIND,
	SMART_REMINDER_TIMES,
} from '../constants/smartReminders.js';
import {
	getUserLocalDateParts,
	isWeekendDay,
	resolveUserOffsetMinutes,
} from '../utils/userLocalTime.js';
import {
	daysUntilExamForUser,
	isExamCountdownMilestone,
} from '../utils/examCountdown.js';
import { getTodayStudyProgress } from '../utils/todayStudyProgress.js';
import * as notificationService from './notificationService.js';
import { getIo } from '../config/ioRegistry.js';
import { sendNotificationToUser } from '../config/socket.js';

const SUBJECT_LABEL_VI = {
	grammar: 'Ngữ pháp',
	vocab: 'Từ vựng',
	kanji: 'Kanji',
};

const SUBJECT_LABEL_JA = {
	grammar: '文法',
	vocab: '単語',
	kanji: '漢字',
};

function userPrefersJa(user) {
	return (
		user.profile?.location === 'jp' ||
		normalizeProfileTimeZoneKey(user.profile?.timeZoneLabel) === 'gmt+9'
	);
}

async function alreadySentToday(userId, reminderKind, localDate) {
	return Boolean(
		await Notification.exists({
			userId,
			source: 'system',
			'metadata.reminderKind': reminderKind,
			'metadata.localDate': localDate,
		}),
	);
}

async function deliverReminder(user, payload) {
	const notification = await notificationService.createNotification({
		userId: user._id,
		source: 'system',
		type: payload.type || 'info',
		category: payload.category || 'system',
		priority: payload.priority || 'normal',
		actionType: payload.actionType || 'open_page',
		actionData: payload.actionData || { path: '/' },
		...payload,
	});

	const io = getIo();
	if (io) {
		sendNotificationToUser(io, String(user._id), notification);
	}

	return notification;
}

function dailyStudyCopy(dailyGoalMinutes, useJa) {
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

function streakCopy(currentStreak, useJa) {
	if (useJa) {
		return {
			title: '今日のチェックイン',
			message:
				currentStreak > 0
					? `連続${currentStreak}日の記録を守りましょう。今すぐチェックイン！`
					: '今日まだチェックインしていません。タップして記録をつけましょう。',
		};
	}
	return {
		title: 'Nhắc giữ chuỗi học',
		message:
			currentStreak > 0
				? `Chuỗi ${currentStreak} ngày sắp mất nếu không check-in. Chạm để giữ lửa nhé!`
				: 'Hôm nay bạn chưa check-in. Mở app và chạm lửa để bắt đầu chuỗi học.',
	};
}

/**
 * @param {{ percent: number, tasks: Array<{ subjectId: string, target: number, completed: number }> }} progress
 * @param {boolean} useJa
 */
function goalNudgeCopy(progress, useJa) {
	const behind = progress.tasks.filter((t) => t.completed < t.target);
	const labels = useJa ? SUBJECT_LABEL_JA : SUBJECT_LABEL_VI;

	if (!behind.length) {
		if (useJa) {
			return {
				title: '今日の目標',
				message: `進捗${progress.percent}%。あと少しで今日の目標達成です。`,
			};
		}
		return {
			title: 'Mục tiêu hôm nay',
			message: `Tiến độ ${progress.percent}% — còn chút nữa là hoàn thành mục tiêu ngày nhé!`,
		};
	}

	const first = behind[0];
	const label = labels[first.subjectId] || first.subjectId;
	const remaining = first.target - first.completed;

	if (useJa) {
		return {
			title: '今日の目標のリマインド',
			message: `進捗${progress.percent}%。${label}はあと${remaining}で今日の目標です。`,
		};
	}
	return {
		title: 'Nhắc mục tiêu hôm nay',
		message: `Tiến độ ${progress.percent}%. ${label} còn ${remaining} — học thêm chút nữa nhé!`,
	};
}

function examCopy(daysUntil, examDateIso, useJa) {
	if (useJa) {
		return {
			title: `試験まであと${daysUntil}日`,
			message: `試験日 ${examDateIso}。今日も計画どおり復習しましょう。`,
		};
	}
	return {
		title: `Còn ${daysUntil} ngày đến kỳ thi`,
		message: `Ngày thi: ${examDateIso}. Dành chút thời gian ôn bài hôm nay nhé!`,
	};
}

function hasCheckedInToday(streak, localDateIso, offsetMinutes) {
	if (!streak?.lastCheckInDate) return false;
	const lastLocal = getUserLocalDateParts(
		new Date(streak.lastCheckInDate),
		offsetMinutes,
	).dateIso;
	return lastLocal === localDateIso;
}

function isHalfHourSlot(localTime) {
	const minute = localTime.split(':')[1];
	return minute === '00' || minute === '30';
}

async function maybeSendDailyStudy(user, settings, local, offset) {
	if (!settings.study.reminderEnabled) return false;
	if (!settings.notifications.dailyStudyReminder) return false;
	if (!isHalfHourSlot(local.time)) return false;
	if (local.time !== settings.study.reminderTime) return false;
	if (!settings.study.reminderWeekends && isWeekendDay(local.dayOfWeek)) {
		return false;
	}
	if (await alreadySentToday(user._id, REMINDER_KIND.DAILY_STUDY, local.dateIso)) {
		return false;
	}

	const useJa = userPrefersJa(user);
	const { title, message } = dailyStudyCopy(
		settings.study.dailyGoalMinutes,
		useJa,
	);

	await deliverReminder(user, {
		title,
		message,
		category: 'system',
		metadata: {
			reminderKind: REMINDER_KIND.DAILY_STUDY,
			localDate: local.dateIso,
			reminderTime: settings.study.reminderTime,
		},
	});
	return true;
}

async function maybeSendStreakCheckIn(user, settings, local, offset) {
	if (!settings.notifications.dailyStudyReminder) return false;
	if (!settings.notifications.streakCheckInReminder) return false;
	if (local.time !== SMART_REMINDER_TIMES.STREAK_CHECKIN) return false;
	if (!settings.study.reminderWeekends && isWeekendDay(local.dayOfWeek)) {
		return false;
	}
	if (
		await alreadySentToday(user._id, REMINDER_KIND.STREAK_CHECKIN, local.dateIso)
	) {
		return false;
	}

	const streak = await Streak.findOne({ userId: user._id }).lean();
	if (hasCheckedInToday(streak, local.dateIso, offset)) {
		return false;
	}

	const useJa = userPrefersJa(user);
	const { title, message } = streakCopy(streak?.currentStreak ?? 0, useJa);

	await deliverReminder(user, {
		title,
		message,
		category: 'streak',
		actionData: { path: '/' },
		metadata: {
			reminderKind: REMINDER_KIND.STREAK_CHECKIN,
			localDate: local.dateIso,
		},
	});
	return true;
}

async function maybeSendGoalNudge(user, settings, local) {
	if (!settings.notifications.dailyStudyReminder) return false;
	if (!settings.notifications.dailyGoalNudge) return false;
	if (local.time !== SMART_REMINDER_TIMES.GOAL_NUDGE) return false;
	if (!settings.study.reminderWeekends && isWeekendDay(local.dayOfWeek)) {
		return false;
	}
	if (
		await alreadySentToday(user._id, REMINDER_KIND.DAILY_GOAL_NUDGE, local.dateIso)
	) {
		return false;
	}

	const progress = await getTodayStudyProgress(
		user._id,
		settings.study.dailySubjectGoals,
	);
	if (progress.percent >= 100) {
		return false;
	}

	const useJa = userPrefersJa(user);
	const { title, message } = goalNudgeCopy(progress, useJa);

	await deliverReminder(user, {
		title,
		message,
		category: 'system',
		actionData: { path: '/settings' },
		metadata: {
			reminderKind: REMINDER_KIND.DAILY_GOAL_NUDGE,
			localDate: local.dateIso,
			percent: progress.percent,
		},
	});
	return true;
}

async function maybeSendExamCountdown(user, settings, local, offset) {
	if (!settings.notifications.dailyStudyReminder) return false;
	if (!settings.notifications.examCountdownReminder) return false;
	if (local.time !== SMART_REMINDER_TIMES.EXAM_COUNTDOWN) return false;
	if (!settings.study.reminderWeekends && isWeekendDay(local.dayOfWeek)) {
		return false;
	}

	const examDateIso = String(user.profile?.examDateIso || '').trim();
	const daysUntil = daysUntilExamForUser(examDateIso, offset);
	if (!isExamCountdownMilestone(daysUntil)) {
		return false;
	}

	const dedupeKey = `${local.dateIso}:${daysUntil}`;
	if (
		await Notification.exists({
			userId: user._id,
			source: 'system',
			'metadata.reminderKind': REMINDER_KIND.EXAM_COUNTDOWN,
			'metadata.localDate': local.dateIso,
			'metadata.daysUntil': daysUntil,
		})
	) {
		return false;
	}

	const useJa = userPrefersJa(user);
	const { title, message } = examCopy(daysUntil, examDateIso, useJa);

	await deliverReminder(user, {
		title,
		message,
		category: 'system',
		priority: 'high',
		actionData: { path: '/profile' },
		metadata: {
			reminderKind: REMINDER_KIND.EXAM_COUNTDOWN,
			localDate: local.dateIso,
			daysUntil,
			examDateIso,
			dedupeKey,
		},
	});
	return true;
}

/**
 * Gửi nhắc học in-app (giờ tùy chọn + nhắc thông minh) theo múi giờ hồ sơ.
 */
export async function processStudyReminders(now = new Date()) {
	const users = await User.find({
		status: USER_STATUS.ACTIVE,
		'settings.notifications.dailyStudyReminder': true,
	})
		.select('_id profile settings')
		.lean();

	if (!users.length) return { scanned: 0, sent: 0 };

	let sent = 0;

	for (const user of users) {
		const settings = normalizeUserSettings(user.settings);
		const offset = resolveUserOffsetMinutes(
			user.profile?.timeZoneLabel,
			user.profile?.location,
		);
		const local = getUserLocalDateParts(now, offset);

		if (!isHalfHourSlot(local.time)) continue;

		const results = await Promise.all([
			maybeSendDailyStudy(user, settings, local, offset),
			maybeSendStreakCheckIn(user, settings, local, offset),
			maybeSendGoalNudge(user, settings, local),
			maybeSendExamCountdown(user, settings, local, offset),
		]);

		sent += results.filter(Boolean).length;
	}

	return { scanned: users.length, sent };
}
