/**
 * Đích điều hướng từ thông báo (ví dụ thành tựu → Profile / khu huy hiệu).
 * @param {{ actionType?: string, actionData?: Record<string, unknown> | null }} notif
 * @returns {string | null} Chuỗi dùng cho `navigate(...)` / `<Link to>`
 */
export function getNavigationTargetFromNotification(notif) {
	if (!notif || notif.actionType !== 'open_page') return null;
	const data = notif.actionData;
	if (!data || typeof data !== 'object') return null;
	const path = typeof data.path === 'string' ? data.path.trim() : '';
	if (!path) return null;
	const badgeKey =
		typeof data.badgeKey === 'string' ? data.badgeKey.trim() : '';
	const params = new URLSearchParams();
	if (badgeKey) params.set('highlightBadge', badgeKey);
	const qs = params.toString();
	const rawHash =
		typeof data.hash === 'string' ? data.hash.trim().replace(/^#/, '') : '';
	const hash = rawHash ? `#${rawHash}` : '';
	return qs ? `${path}?${qs}${hash}` : `${path}${hash}`;
}
