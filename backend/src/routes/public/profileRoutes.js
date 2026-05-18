import express from 'express';
import * as userController from '../../controllers/userController.js';
import * as learningSummaryController from '../../controllers/learningSummaryController.js';
import * as dashboardHomeController from '../../controllers/dashboardHomeController.js';
import * as focusAreaController from '../../controllers/focusAreaController.js';
import * as userSettingsController from '../../controllers/userSettingsController.js';
import { updateFocusAreasSchema } from '../../validators/focusAreaValidator.js';
import { replaceUserSettingsSchema } from '../../validators/userSettingsValidator.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { updateMeSchema } from '../../validators/updateMeValidator.js';
import { badgeTestUnlockSchema } from '../../validators/badgeTestUnlockValidator.js';
import { avatarUploadMiddleware } from '../../middlewares/avatarUpload.js';

const router = express.Router();

// User profile routes (require authentication)
router.get('/me', authenticate, userController.getMe);
router.get(
	'/me/learning-summary',
	authenticate,
	learningSummaryController.getMyLearningSummary,
);
router.get(
	'/me/dashboard-home',
	authenticate,
	dashboardHomeController.getMyDashboardHome,
);
router.get('/me/focus-areas', authenticate, focusAreaController.getMyFocusAreas);
router.put(
	'/me/focus-areas',
	authenticate,
	validate(updateFocusAreasSchema),
	focusAreaController.updateMyFocusAreas,
);
router.get('/me/settings', authenticate, userSettingsController.getMySettings);
router.put(
	'/me/settings',
	authenticate,
	validate(replaceUserSettingsSchema),
	userSettingsController.updateMySettings,
);
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
