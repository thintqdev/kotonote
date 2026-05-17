/** Ngày local YYYY-MM-DD (theo timezone máy chủ). */
export function isoDateLocal(d) {
	const dt = d instanceof Date ? d : new Date(d);
	if (Number.isNaN(dt.getTime())) return '';
	const y = dt.getFullYear();
	const m = String(dt.getMonth() + 1).padStart(2, '0');
	const day = String(dt.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

/** Thứ Hai 0:00 local của tuần chứa `base`. */
export function startOfWeekMonday(base = new Date()) {
	const x = new Date(base.getFullYear(), base.getMonth(), base.getDate());
	const mondayOffset = (x.getDay() + 6) % 7;
	x.setDate(x.getDate() - mondayOffset);
	return x;
}

/** 7 ngày T2→CN (YYYY-MM-DD local). */
export function weekIsoDatesMondayFirst(base = new Date()) {
	const mon = startOfWeekMonday(base);
	const dates = [];
	for (let i = 0; i < 7; i++) {
		const t = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i);
		dates.push(isoDateLocal(t));
	}
	return dates;
}

/**
 * Số ngày lịch so với hôm nay (giờ local server, noon tránh DST).
 * @param {string} iso YYYY-MM-DD
 * @returns {number | null}
 */
export function calendarDaysFromIsoDate(iso) {
	if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
	const [y, m, d] = iso.split('-').map(Number);
	const target = new Date(y, m - 1, d, 12, 0, 0, 0);
	if (Number.isNaN(target.getTime())) return null;
	const now = new Date();
	const today = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		12,
		0,
		0,
		0,
	);
	return Math.round((target.getTime() - today.getTime()) / 86400000);
}
