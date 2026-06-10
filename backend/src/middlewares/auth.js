import asyncHandler from 'express-async-handler';
import { verifyToken } from '../utils/jwt.js';
import { findUserForAuth } from '../repositories/userRepository.js';
import { apiError } from '../utils/response.js';
import { AUTH, COMMON } from '../constants/messages.js';
import { AUTH_PROVIDER } from '../constants/userStatus.js';
import { getJlptUnlockedForUser } from '../utils/jlptAccess.js';

export const authenticate = asyncHandler(async (req, res, next) => {
	let token;
	
	// Get token from Authorization header
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}
	
	if (!token) {
		return apiError(res, AUTH.TOKEN_INVALID, 401);
	}
	
	// Verify token
	const decoded = verifyToken(token);
	
	if (!decoded) {
		return apiError(res, AUTH.TOKEN_INVALID, 401);
	}
	
	// Get user from token
	const user = await findUserForAuth(decoded.userId);
	
	if (!user) {
		return apiError(res, COMMON.UNAUTHORIZED, 401);
	}
	
	// Check if user is active
	if (!user.isActive) {
		return apiError(res, AUTH.LOGIN_FAILED, 403);
	}

	const provider = user.authProvider || AUTH_PROVIDER.LOCAL;
	if (provider === AUTH_PROVIDER.LOCAL && !user.isEmailVerified) {
		return apiError(res, AUTH.EMAIL_NOT_VERIFIED, 403);
	}
	
	req.user = user;
	req.jlptUnlocked = getJlptUnlockedForUser(user);
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
