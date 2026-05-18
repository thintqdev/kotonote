export const DEFAULT_REMINDER_TIME = '20:00';

/** @returns {string[]} 48 slot / ngày, bước 30 phút */
export function buildReminderTimeOptions() {
	const options = [];
	for (let h = 0; h < 24; h += 1) {
		for (const m of [0, 30]) {
			options.push(
				`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
			);
		}
	}
	return options;
}

export const REMINDER_TIME_OPTIONS = buildReminderTimeOptions();

/**
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
	const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
	return REMINDER_TIME_OPTIONS.includes(slot) ? slot : DEFAULT_REMINDER_TIME;
}
