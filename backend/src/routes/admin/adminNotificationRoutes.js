import express from 'express';
import * as notificationController from '../../controllers/notificationController.js';
import { validate } from '../../middlewares/validate.js';
import {
	sendNotificationSchema,
	sendBatchNotificationSchema,
	createCampaignSchema,
	broadcastNotificationSchema,
} from '../../validators/notificationValidator.js';

const router = express.Router();

router.get(
	'/campaigns',
	notificationController.listCampaigns
);
router.post(
	'/campaigns',
	validate(createCampaignSchema),
	notificationController.createNotificationCampaign
);
router.patch(
	'/campaigns/:campaignId/cancel',
	notificationController.cancelNotificationCampaign
);

router.get('/stats', notificationController.getAdminStats);

router.get('/', notificationController.getAllNotifications);

router.post(
	'/send',
	validate(sendNotificationSchema),
	notificationController.sendNotification
);
router.post(
	'/send-batch',
	validate(sendBatchNotificationSchema),
	notificationController.sendBatchNotifications
);
router.post(
	'/broadcast',
	validate(broadcastNotificationSchema),
	notificationController.broadcastNotification
);

router.delete('/:id', notificationController.deleteNotificationAdmin);

export default router;
