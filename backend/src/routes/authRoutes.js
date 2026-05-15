import express from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import {
	registerSchema,
	loginSchema,
	changePasswordSchema,
} from '../validators/authValidator.js';
import { googleLoginSchema } from '../validators/googleAuthValidator.js';

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/admin/login', validate(loginSchema), authController.adminLogin);
router.post('/google', validate(googleLoginSchema), authController.googleLogin);
router.post(
	'/change-password',
	authenticate,
	validate(changePasswordSchema),
	authController.changePassword,
);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);

export default router;
