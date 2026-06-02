/** Giờ bắt đầu: 00:00–23:30 mỗi 30 phút */
export const ARENA_START_TIME_OPTIONS = (() => {
	const list = [];
	for (let h = 0; h < 24; h += 1) {
		for (const m of [0, 30]) {
			list.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
		}
	}
	return list;
})();

/** Giờ kết thúc: thêm 24:00 */
export const ARENA_END_TIME_OPTIONS = [...ARENA_START_TIME_OPTIONS, '24:00'];

export const ARENA_TIMEZONE_OPTIONS = [
	{ value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh (Việt Nam)' },
	{ value: 'Asia/Tokyo', label: 'Asia/Tokyo (Nhật Bản)' },
	{ value: 'Asia/Bangkok', label: 'Asia/Bangkok' },
	{ value: 'Asia/Singapore', label: 'Asia/Singapore' },
	{ value: 'Asia/Seoul', label: 'Asia/Seoul' },
	{ value: 'UTC', label: 'UTC' },
];
