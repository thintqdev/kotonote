import { AUTH_COOKIE } from '../constants/authCookies.js';

/**
 * @param {string} [expiresIn]
 * @returns {number}
 */
export function jwtCookieMaxAgeMs(expiresIn = process.env.JWT_EXPIRES_IN || '7d') {
	const raw = String(expiresIn).trim();
	const m = /^(\d+)([dhms])$/i.exec(raw);
	if (!m) return 7 * 24 * 60 * 60 * 1000;
	const n = Number(m[1]);
	const mult = { d: 86_400_000, h: 3_600_000, m: 60_000, s: 1000 };
	return n * (mult[m[2].toLowerCase()] || 86_400_000);
}

/**
 * @param {boolean} [remember]
 * @returns {import('express').CookieOptions}
 */
export function buildAuthCookieOptions(remember = false) {
	const opts = {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
	};
	if (remember) {
		opts.maxAge = jwtCookieMaxAgeMs();
	}
	return opts;
}

/** @returns {import('express').CookieOptions} */
export function buildClearAuthCookieOptions() {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
	};
}

/**
 * @param {import('express').Response} res
 * @param {string} token
 * @param {boolean} [remember]
 */
export function setUserAuthCookie(res, token, remember = false) {
	res.cookie(AUTH_COOKIE.USER, token, buildAuthCookieOptions(remember));
}

/**
 * @param {import('express').Response} res
 * @param {string} token
 * @param {boolean} [remember]
 */
export function setAdminAuthCookie(res, token, remember = false) {
	res.cookie(AUTH_COOKIE.ADMIN, token, buildAuthCookieOptions(remember));
}

/** @param {import('express').Response} res */
export function clearUserAuthCookie(res) {
	res.clearCookie(AUTH_COOKIE.USER, buildClearAuthCookieOptions());
}

/** @param {import('express').Response} res */
export function clearAdminAuthCookie(res) {
	res.clearCookie(AUTH_COOKIE.ADMIN, buildClearAuthCookieOptions());
}

/**
 * @param {import('express').Request} req
 * @param {string} cookieName
 * @returns {string | null}
 */
export function extractAuthToken(req, cookieName) {
	const fromCookie = req.cookies?.[cookieName];
	if (typeof fromCookie === 'string' && fromCookie.trim()) {
		return fromCookie.trim();
	}
	if (req.headers.authorization?.startsWith('Bearer ')) {
		const bearer = req.headers.authorization.split(' ')[1];
		if (bearer?.trim()) return bearer.trim();
	}
	return null;
}
