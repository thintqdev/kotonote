import asyncHandler from 'express-async-handler';
import * as authService from '../services/authService.js';
import { apiSuccess } from '../utils/response.js';
import { AUTH } from '../constants/messages.js';
import {
	setUserAuthCookie,
	setAdminAuthCookie,
	clearUserAuthCookie,
	clearAdminAuthCookie,
} from '../utils/authCookies.js';

/**
 * @param {import('express').Response} res
 * @param {{ user: object, token: string }} result
 * @param {string} messageCode
 * @param {number} statusCode
 * @param {{ remember?: boolean, scope: 'user' | 'admin' }} opts
 */
function sendAuthSuccess(res, result, messageCode, statusCode, opts) {
	const remember = opts.remember === true;
	if (opts.scope === 'admin') {
		setAdminAuthCookie(res, result.token, remember);
	} else {
		setUserAuthCookie(res, result.token, remember);
	}
	return apiSuccess(res, { user: result.user }, messageCode, statusCode);
}

export const register = asyncHandler(async (req, res) => {
	const { email, password, name } = req.body;
	
	const result = await authService.register({ email, password, name });
	
	return apiSuccess(res, result, result.messageCode, 201);
});

export const login = asyncHandler(async (req, res) => {
	const { email, password, remember } = req.body;
	
	const result = await authService.login(email, password);
	
	return sendAuthSuccess(res, result, AUTH.LOGIN_SUCCESS, 200, {
		remember,
		scope: 'user',
	});
});

export const googleLogin = asyncHandler(async (req, res) => {
	const { token, password, remember } = req.body;

	const result = await authService.googleLogin(token, password);

	return sendAuthSuccess(res, result, AUTH.LOGIN_SUCCESS, 200, {
		remember,
		scope: 'user',
	});
});

const verifyEmailFromRequest = async (token) => {
	const raw = String(token || '').trim();
	return authService.verifyEmail(raw);
};

/** @deprecated Dùng POST — GET dễ bị prefetch mail client làm hỏng token */
export const verifyEmail = asyncHandler(async (req, res) => {
	const result = await verifyEmailFromRequest(req.query.token);
	setUserAuthCookie(res, result.token, false);
	return apiSuccess(res, { user: result.user }, AUTH.EMAIL_VERIFIED_SUCCESS, 200);
});

export const verifyEmailPost = asyncHandler(async (req, res) => {
	const result = await verifyEmailFromRequest(req.body.token);
	setUserAuthCookie(res, result.token, false);
	return apiSuccess(res, { user: result.user }, AUTH.EMAIL_VERIFIED_SUCCESS, 200);
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
	const { email } = req.body;
	
	const result = await authService.resendVerificationEmail(email);
	
	return apiSuccess(res, result, AUTH.VERIFICATION_EMAIL_SENT, 200);
});

export const adminLogin = asyncHandler(async (req, res) => {
	const { email, password, remember } = req.body;
	
	const result = await authService.adminLogin(email, password);
	
	return sendAuthSuccess(res, result, AUTH.LOGIN_SUCCESS, 200, {
		remember,
		scope: 'admin',
	});
});

export const logout = asyncHandler(async (req, res) => {
	clearUserAuthCookie(res);
	return apiSuccess(res, null, AUTH.LOGOUT_SUCCESS, 200);
});

export const adminLogout = asyncHandler(async (req, res) => {
	clearAdminAuthCookie(res);
	return apiSuccess(res, null, AUTH.LOGOUT_SUCCESS, 200);
});

export const changePassword = asyncHandler(async (req, res) => {
	const { currentPassword, newPassword } = req.body;

	await authService.changePassword(req.user._id, currentPassword, newPassword);

	return apiSuccess(res, {}, AUTH.PASSWORD_CHANGED, 200);
});

export const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	const result = await authService.requestPasswordReset(email);

	return apiSuccess(res, result, AUTH.PASSWORD_RESET_EMAIL_SENT, 200);
});

export const resetPassword = asyncHandler(async (req, res) => {
	const { token, newPassword } = req.body;

	const result = await authService.resetPassword(token, newPassword);

	return apiSuccess(res, result, AUTH.PASSWORD_RESET_SUCCESS, 200);
});
