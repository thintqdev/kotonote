/** Route auth công khai — 401 khi chưa đăng nhập không redirect sang /login. */
export const PUBLIC_AUTH_ROUTE_PREFIXES = [
	'/login',
	'/register',
	'/verify-email',
	'/forgot-password',
	'/reset-password',
];

/**
 * @param {string} [pathname]
 */
export function isPublicAuthRoute(pathname) {
	const path = pathname || '';
	return PUBLIC_AUTH_ROUTE_PREFIXES.some(
		(prefix) => path === prefix || path.startsWith(`${prefix}/`),
	);
}
