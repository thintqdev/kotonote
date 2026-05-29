/** Loại nhắc in-app (metadata.reminderKind) */
export const REMINDER_KIND = {
	DAILY_STUDY: 'daily_study',
	STREAK_CHECKIN: 'streak_checkin',
	DAILY_GOAL_NUDGE: 'daily_goal_nudge',
	EXAM_COUNTDOWN: 'exam_countdown',
};

/** Giờ local cố định (HH:mm, slot :00/:30) */
export const SMART_REMINDER_TIMES = {
	GOAL_NUDGE: '18:00',
	STREAK_CHECKIN: '21:00',
	EXAM_COUNTDOWN: '09:00',
};

/** Nhắc trước ngày thi (số ngày còn lại) */
export const EXAM_COUNTDOWN_DAYS = [14, 7, 3, 1];
