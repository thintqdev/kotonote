import User from '../models/User.js';
import EmailDigestLog from '../models/EmailDigestLog.js';
import { USER_STATUS } from '../constants/userStatus.js';
import { normalizeProfileTimeZoneKey } from '../constants/profileLocale.js';
import { normalizeUserSettings } from '../constants/userSettings.js';
import {
	DIGEST_SEND_TIME,
	EMAIL_DIGEST_KIND,
} from '../constants/emailDigest.js';
import {
	getUserLocalDateParts,
	getUserLocalWeekStartIso,
	resolveUserOffsetMinutes,
} from '../utils/userLocalTime.js';
import { getLearningSummary } from './learningSummaryService.js';
import { sendDailyDigestEmail } from './emailService.js';

function userPrefersJa(user) {
	return (
		user.profile?.location === 'jp' ||
		normalizeProfileTimeZoneKey(user.profile?.timeZoneLabel) === 'gmt+9'
	);
}

function buildStatsRows(summary, dailyGoalMinutes, useJa, isWeekly) {
	const streak = summary?.streak ?? {};
	const exam = summary?.exam ?? {};
	const badges = summary?.badges ?? {};
	const checked = streak.checkedThisWeek ?? 0;

	if (useJa) {
		const rows = [
			{ label: '連続チェックイン', value: `${streak.current ?? 0}日` },
			{ label: '最長記録', value: `${streak.longest ?? 0}日` },
			{
				label: isWeekly ? '今週チェックイン' : '今週のチェックイン',
				value: `${checked}/7日`,
			},
			{ label: '1日の目標', value: `${dailyGoalMinutes}分` },
		];
		if (exam.hasGoal && exam.daysUntilExam != null) {
			rows.push({
				label: '試験まで',
				value: `${exam.daysUntilExam}日`,
			});
		}
		if (badges.latest) {
			rows.push({
				label: '最新バッジ',
				value: badges.latest.nameJa || badges.latest.nameVi || '—',
			});
		}
		return rows;
	}

	const rows = [
		{ label: 'Streak hiện tại', value: `${streak.current ?? 0} ngày` },
		{ label: 'Kỷ lục dài nhất', value: `${streak.longest ?? 0} ngày` },
		{
			label: isWeekly ? 'Check-in tuần này' : 'Check-in tuần (T2–CN)',
			value: `${checked}/7 ngày`,
		},
		{ label: 'Mục tiêu mỗi ngày', value: `${dailyGoalMinutes} phút` },
	];
	if (exam.hasGoal && exam.daysUntilExam != null) {
		rows.push({
			label: 'Còn đến ngày thi',
			value: `${exam.daysUntilExam} ngày`,
		});
	}
	if (badges.latest) {
		rows.push({
			label: 'Huy hiệu mới nhất',
			value: badges.latest.nameVi || badges.latest.nameJa || '—',
		});
	}
	return rows;
}

async function alreadySent(userId, kind, periodKey) {
	return Boolean(
		await EmailDigestLog.exists({ userId, kind, periodKey }),
	);
}

async function markSent(userId, kind, periodKey) {
	await EmailDigestLog.create({ userId, kind, periodKey });
}

function isDigestSendSlot(local) {
	const [, minuteSlot] = local.time.split(':');
	return local.time === DIGEST_SEND_TIME && minuteSlot === '00';
}

/**
 * Email tóm tắt hằng ngày lúc 08:00 (múi giờ hồ sơ).
 */
export async function processDailyEmailDigests(now = new Date()) {
	const users = await User.find({
		status: USER_STATUS.ACTIVE,
		isEmailVerified: true,
		'settings.notifications.emailDigest': true,
	})
		.select('_id email name profile settings')
		.lean();

	let sent = 0;

	for (const user of users) {
		const offset = resolveUserOffsetMinutes(
			user.profile?.timeZoneLabel,
			user.profile?.location,
		);
		const local = getUserLocalDateParts(now, offset);
		if (!isDigestSendSlot(local)) continue;
		if (await alreadySent(user._id, EMAIL_DIGEST_KIND.DAILY, local.dateIso)) {
			continue;
		}

		const settings = normalizeUserSettings(user.settings);
		const summary = await getLearningSummary(user._id);
		if (!summary) continue;

		const useJa = userPrefersJa(user);
		const stats = buildStatsRows(
			summary,
			settings.study.dailyGoalMinutes,
			useJa,
			false,
		);
		const dashboardUrl = process.env.CLIENT_URL || 'http://localhost:5173';
		const displayName =
			user.name?.trim() || user.email?.split('@')[0] || 'bạn';

		const ok = await sendDailyDigestEmail({
			email: user.email,
			name: displayName,
			useJa,
			stats,
			dashboardUrl,
			isWeekly: false,
		});

		if (ok) {
			await markSent(user._id, EMAIL_DIGEST_KIND.DAILY, local.dateIso);
			sent += 1;
		}
	}

	return { scanned: users.length, sent };
}

/**
 * Báo cáo tuần — thứ Hai 08:00 local.
 */
export async function processWeeklyEmailReports(now = new Date()) {
	const users = await User.find({
		status: USER_STATUS.ACTIVE,
		isEmailVerified: true,
		'settings.notifications.weeklyReport': true,
	})
		.select('_id email name profile settings')
		.lean();

	let sent = 0;

	for (const user of users) {
		const offset = resolveUserOffsetMinutes(
			user.profile?.timeZoneLabel,
			user.profile?.location,
		);
		const local = getUserLocalDateParts(now, offset);
		if (local.dayOfWeek !== 1) continue;
		if (!isDigestSendSlot(local)) continue;

		const weekKey = getUserLocalWeekStartIso(now, offset);
		if (
			await alreadySent(user._id, EMAIL_DIGEST_KIND.WEEKLY, weekKey)
		) {
			continue;
		}

		const settings = normalizeUserSettings(user.settings);
		const summary = await getLearningSummary(user._id);
		if (!summary) continue;

		const useJa = userPrefersJa(user);
		const stats = buildStatsRows(
			summary,
			settings.study.dailyGoalMinutes,
			useJa,
			true,
		);
		const dashboardUrl = process.env.CLIENT_URL || 'http://localhost:5173';
		const displayName =
			user.name?.trim() || user.email?.split('@')[0] || 'bạn';

		const ok = await sendDailyDigestEmail({
			email: user.email,
			name: displayName,
			useJa,
			stats,
			dashboardUrl,
			isWeekly: true,
		});

		if (ok) {
			await markSent(user._id, EMAIL_DIGEST_KIND.WEEKLY, weekKey);
			sent += 1;
		}
	}

	return { scanned: users.length, sent };
}

export async function processEmailDigests(now = new Date()) {
	const [daily, weekly] = await Promise.all([
		processDailyEmailDigests(now),
		processWeeklyEmailReports(now),
	]);
	return {
		daily,
		weekly,
	};
}
