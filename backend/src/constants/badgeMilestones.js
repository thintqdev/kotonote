/**
 * Map mốc thành tích → `Badge.key` (admin phải tạo/seed badge cùng key).
 * Khi đạt đúng số `count`, gọi `tryUnlockMilestoneBadge(userId, track, count)`.
 *
 * Thêm track mới: khai báo ở đây + gọi hook trong service tương ứng + seed badge.
 */
export const BADGE_MILESTONE_TRACKS = Object.freeze({
	streak: Object.freeze({
		7: 'streak_7',
		30: 'streak_30',
		100: 'streak_100',
	}),
	reading: Object.freeze({
		1: 'reading_complete_1',
		10: 'reading_complete_10',
	}),
});

/**
 * @param {string} track — ví dụ `streak`, `reading`
 * @param {number} count — giá trị hiện tại (streak ngày, số bài done, …)
 * @returns {string|null} badgeKey nếu có mốc khớp chính xác
 */
export function resolveMilestoneBadgeKey(track, count) {
	const map = BADGE_MILESTONE_TRACKS[track];
	if (!map) return null;
	const n = Number(count);
	if (!Number.isFinite(n) || n < 1) return null;
	return map[n] ?? null;
}
