import asyncHandler from 'express-async-handler';
import * as authService from '../services/authService.js';
import { apiSuccess, apiError } from '../utils/response.js';
import { AUTH } from '../constants/messages.js';

export const register = asyncHandler(async (req, res) => {
	const { email, password, name } = req.body;
	
	const result = await authService.register({ email, password, name });
	
	return apiSuccess(res, result, result.messageCode, 201);
});

export const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	
	const result = await authService.login(email, password);
	
	return apiSuccess(res, result, AUTH.LOGIN_SUCCESS, 200);
});

export const googleLogin = asyncHandler(async (req, res) => {
	const { token } = req.body;
	
	const result = await authService.googleLogin(token);
	
	return apiSuccess(res, result, AUTH.LOGIN_SUCCESS, 200);
});

export const verifyEmail = asyncHandler(async (req, res) => {
	const { token } = req.query;
	
	const result = await authService.verifyEmail(token);
	
	return apiSuccess(res, result, AUTH.EMAIL_VERIFIED_SUCCESS, 200);
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
	const { email } = req.body;
	
	const result = await authService.resendVerificationEmail(email);
	
	return apiSuccess(res, result, AUTH.VERIFICATION_EMAIL_SENT, 200);
});
