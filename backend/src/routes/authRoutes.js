import express from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import {
	authCredentialRateLimit,
	adminLoginRateLimit,
	authSensitiveRateLimit,
} from '../middlewares/authRateLimit.js';
import {
	registerSchema,
	loginSchema,
	changePasswordSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
	resendVerificationSchema,
	verifyEmailSchema,
} from '../validators/authValidator.js';
import { googleLoginSchema } from '../validators/googleAuthValidator.js';

const router = express.Router();

router.post(
	'/register',
	authCredentialRateLimit,
	validate(registerSchema),
	authController.register,
);
router.post(
	'/login',
	authCredentialRateLimit,
	validate(loginSchema),
	authController.login,
);
router.post(
	'/logout',
	authController.logout,
);
router.post(
	'/admin/login',
	adminLoginRateLimit,
	validate(loginSchema),
	authController.adminLogin,
);
router.post('/admin/logout', authController.adminLogout);
router.post(
	'/google',
	authCredentialRateLimit,
	validate(googleLoginSchema),
	authController.googleLogin,
);
router.post(
	'/change-password',
	authenticate,
	validate(changePasswordSchema),
	authController.changePassword,
);
router.post(
	'/forgot-password',
	authSensitiveRateLimit,
	validate(forgotPasswordSchema),
	authController.forgotPassword,
);
router.post(
	'/reset-password',
	authSensitiveRateLimit,
	validate(resetPasswordSchema),
	authController.resetPassword,
);
router.get('/verify-email', authController.verifyEmail);
router.post(
	'/verify-email',
	validate(verifyEmailSchema),
	authController.verifyEmailPost,
);
router.post(
	'/resend-verification',
	authSensitiveRateLimit,
	validate(resendVerificationSchema),
	authController.resendVerificationEmail,
);

export default router;
