import express from 'express';
import * as badgeController from '../../controllers/badgeController.js';
import { validate } from '../../middlewares/validate.js';
import { badgeSchema } from '../../validators/badgeValidator.js';
import { badgeUploadMiddleware } from '../../middlewares/badgeUpload.js';

const router = express.Router();

router.get('/', badgeController.getAllBadges);
router.post('/', validate(badgeSchema), badgeController.createBadge);
router.post(
	'/:id/icon',
	badgeUploadMiddleware,
	badgeController.uploadBadgeIcon
);
router.delete('/:id/icon', badgeController.deleteBadgeIcon);
router.get('/:id', badgeController.getBadgeById);
router.put('/:id', validate(badgeSchema), badgeController.updateBadge);
router.delete('/:id', badgeController.deleteBadge);

export default router;
