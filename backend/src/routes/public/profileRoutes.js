import express from 'express';
import * as userController from '../../controllers/userController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { updateMeSchema } from '../../validators/updateMeValidator.js';
import { badgeTestUnlockSchema } from '../../validators/badgeTestUnlockValidator.js';
import { avatarUploadMiddleware } from '../../middlewares/avatarUpload.js';

const router = express.Router();

// User profile routes (require authentication)
router.get('/me', authenticate, userController.getMe);
router.post(
	'/me/avatar',
	authenticate,
	avatarUploadMiddleware,
	userController.uploadMyAvatar,
);
router.put('/me', authenticate, validate(updateMeSchema), userController.updateMe);
router.post(
	'/me/badges/test-unlock',
	authenticate,
	validate(badgeTestUnlockSchema),
	userController.testUnlockBadge
);

export default router;
