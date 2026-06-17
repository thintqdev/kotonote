import asyncHandler from 'express-async-handler';
import { verifyToken } from '../utils/jwt.js';
import { findUserForAuth } from '../repositories/userRepository.js';
import { apiError } from '../utils/response.js';
import { AUTH, COMMON } from '../constants/messages.js';
import { AUTH_PROVIDER } from '../constants/userStatus.js';
import { getJlptUnlockedForUser } from '../utils/jlptAccess.js';
import { AUTH_COOKIE } from '../constants/authCookies.js';
import { extractAuthToken } from '../utils/authCookies.js';

/**
 * @param {import('express').Request} req
 * @param {string} cookieName
 */
async function authenticateFromCookie(req, res, cookieName) {
	const token = extractAuthToken(req, cookieName);

	if (!token) {
		return apiError(res, AUTH.TOKEN_INVALID, 401);
	}

	const decoded = verifyToken(token);

	if (!decoded) {
		return apiError(res, AUTH.TOKEN_INVALID, 401);
	}

	const user = await findUserForAuth(decoded.userId);

	if (!user) {
		return apiError(res, COMMON.UNAUTHORIZED, 401);
	}

	if (!user.isActive) {
		return apiError(res, AUTH.LOGIN_FAILED, 403);
	}

	const provider = user.authProvider || AUTH_PROVIDER.LOCAL;
	if (provider === AUTH_PROVIDER.LOCAL && !user.isEmailVerified) {
		return apiError(res, AUTH.EMAIL_NOT_VERIFIED, 403);
	}

	req.user = user;
	req.jlptUnlocked = getJlptUnlockedForUser(user);
}

/**
 * @param {string} cookieName
 */
function createAuthenticate(cookieName) {
	return asyncHandler(async (req, res, next) => {
		await authenticateFromCookie(req, res, cookieName);
		if (res.headersSent) return;
		next();
	});
}

/** JWT từ cookie `kn_user_session` hoặc Bearer (legacy). */
export const authenticate = createAuthenticate(AUTH_COOKIE.USER);

/** JWT từ cookie `kn_admin_session` hoặc Bearer (legacy). */
export const authenticateAdmin = createAuthenticate(AUTH_COOKIE.ADMIN);

/**
 * User hoặc admin cookie — Studio đọc catalog qua `/kanji/*`, `/vocabulary/*`.
 */
export const authenticateUserOrAdmin = asyncHandler(async (req, res, next) => {
	const userToken = extractAuthToken(req, AUTH_COOKIE.USER);
	const cookieName = userToken ? AUTH_COOKIE.USER : AUTH_COOKIE.ADMIN;
	await authenticateFromCookie(req, res, cookieName);
	if (res.headersSent) return;
	next();
});

export const authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return apiError(res, COMMON.FORBIDDEN, 403);
		}
		next();
	};
};
