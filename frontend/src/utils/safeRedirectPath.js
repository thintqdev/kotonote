/**
 * Path nội bộ an toàn sau đăng nhập — chặn open redirect (`//evil.com`).
 * @param {unknown} pathname
 * @returns {string}
 */
export function getSafeRedirectPath(pathname) {
	if (typeof pathname !== 'string') return '/';
	const p = pathname.trim();
	if (!p.startsWith('/') || p.startsWith('//') || p.startsWith('/\\')) {
		return '/';
	}
	if (p.startsWith('/login')) return '/';
	return p;
}
