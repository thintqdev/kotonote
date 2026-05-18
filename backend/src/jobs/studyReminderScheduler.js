import { processStudyReminders } from '../services/studyReminderService.js';
import { STUDY_REMINDER_TICK_MS } from '../constants/userSettings.js';

/** Chờ tới :00 hoặc :30 UTC tiếp theo (offset +7/+9 là cả giờ → local cũng :00/:30). */
function msUntilNextUtcHalfHour() {
	const now = new Date();
	const min = now.getUTCMinutes();
	const sec = now.getUTCSeconds();
	const ms = now.getUTCMilliseconds();
	if (min < 30) {
		return (30 - min) * 60_000 - sec * 1000 - ms;
	}
	return (60 - min) * 60_000 - sec * 1000 - ms;
}

export function startStudyReminderScheduler() {
	const tick = () => {
		processStudyReminders().catch((err) => {
			// eslint-disable-next-line no-console
			console.error('[StudyReminder]', err);
		});
	};

	setTimeout(() => {
		tick();
		setInterval(tick, STUDY_REMINDER_TICK_MS);
	}, msUntilNextUtcHalfHour());
}
