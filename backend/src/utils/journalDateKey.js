import { JOURNAL_TIMEZONE } from '../constants/journal.js';

/**
 * @param {Date} [date]
 * @returns {string} YYYY-MM-DD theo múi giờ nhật ký
 */
export function getJournalDateKey(date = new Date()) {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: JOURNAL_TIMEZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date);
}
