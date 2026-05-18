import { normalizeDailySubjectGoals } from './dailySubjectGoals.js';

export const DAILY_GOAL_MINUTES_OPTIONS = [15, 30, 45, 60];

export const DEFAULT_REMINDER_TIME = '20:00';

/** HH:mm 24h — chỉ :00 hoặc :30 */
export const REMINDER_TIME_PATTERN = /^([01]\d|2[0-3]):(00|30)$/;

/** Khoảng chạy job nhắc học (ms) */
export const STUDY_REMINDER_TICK_MS = 30 * 60 * 1000;

/**
 * Làm tròn HH:mm về slot 30 phút gần nhất.
 * @param {string} time
 */
export function snapReminderTimeToSlot(time) {
	const raw = String(time || '').trim();
	if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(raw)) {
		return DEFAULT_REMINDER_TIME;
	}
	let [h, m] = raw.split(':').map(Number);
	if (m < 15) m = 0;
	else if (m < 45) m = 30;
	else {
		h = (h + 1) % 24;
		m = 0;
	}
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const DEFAULT_USER_SETTINGS = {
	notifications: {
		emailDigest: true,
		dailyStudyReminder: true,
		weeklyReport: false,
	},
	study: {
		dailyGoalMinutes: 30,
		dailySubjectGoals: normalizeDailySubjectGoals(),
		reminderEnabled: true,
		reminderTime: DEFAULT_REMINDER_TIME,
		reminderWeekends: true,
	},
	privacy: {
		analyticsOptIn: false,
	},
};

/**
 * @param {Record<string, unknown> | null | undefined} raw
 */
export function normalizeUserSettings(raw) {
	const s = raw && typeof raw === 'object' ? raw : {};
	const n = s.notifications && typeof s.notifications === 'object' ? s.notifications : {};
	const st = s.study && typeof s.study === 'object' ? s.study : {};
	const p = s.privacy && typeof s.privacy === 'object' ? s.privacy : {};

	const dailyGoalMinutes = Number(st.dailyGoalMinutes);
	const reminderTime = String(st.reminderTime || DEFAULT_REMINDER_TIME).trim();

	return {
		notifications: {
			emailDigest:
				typeof n.emailDigest === 'boolean'
					? n.emailDigest
					: DEFAULT_USER_SETTINGS.notifications.emailDigest,
			dailyStudyReminder:
				typeof n.dailyStudyReminder === 'boolean'
					? n.dailyStudyReminder
					: DEFAULT_USER_SETTINGS.notifications.dailyStudyReminder,
			weeklyReport:
				typeof n.weeklyReport === 'boolean'
					? n.weeklyReport
					: DEFAULT_USER_SETTINGS.notifications.weeklyReport,
		},
		study: {
			dailyGoalMinutes: DAILY_GOAL_MINUTES_OPTIONS.includes(dailyGoalMinutes)
				? dailyGoalMinutes
				: DEFAULT_USER_SETTINGS.study.dailyGoalMinutes,
			dailySubjectGoals: normalizeDailySubjectGoals(st.dailySubjectGoals),
			reminderEnabled:
				typeof st.reminderEnabled === 'boolean'
					? st.reminderEnabled
					: DEFAULT_USER_SETTINGS.study.reminderEnabled,
			reminderTime: REMINDER_TIME_PATTERN.test(reminderTime)
				? reminderTime
				: snapReminderTimeToSlot(reminderTime),
			reminderWeekends:
				typeof st.reminderWeekends === 'boolean'
					? st.reminderWeekends
					: DEFAULT_USER_SETTINGS.study.reminderWeekends,
		},
		privacy: {
			analyticsOptIn:
				typeof p.analyticsOptIn === 'boolean'
					? p.analyticsOptIn
					: DEFAULT_USER_SETTINGS.privacy.analyticsOptIn,
		},
	};
}
