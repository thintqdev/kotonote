import express from 'express';
import * as notificationController from '../../controllers/notificationController.js';
import { validate } from '../../middlewares/validate.js';
import { sendNotificationSchema, broadcastNotificationSchema } from '../../validators/notificationValidator.js';

const router = express.Router();

// ============ ADMIN NOTIFICATION ROUTES ============

/**
 * @route   GET /api/admin/notifications
 * @desc    Get all notifications (Admin)
 * @access  Admin
 */
router.get('/', notificationController.getAllNotifications);

/**
 * @route   GET /api/admin/notifications/stats
 * @desc    Get notification statistics (Admin)
 * @access  Admin
 */
router.get('/stats', notificationController.getAdminStats);

/**
 * @route   POST /api/admin/notifications/send
 * @desc    Send notification to specific user (Admin)
 * @access  Admin
 */
router.post('/send', validate(sendNotificationSchema), notificationController.sendNotification);

/**
 * @route   POST /api/admin/notifications/send-batch
 * @desc    Send notification to multiple users (Admin)
 * @access  Admin
 */
router.post('/send-batch', validate(sendNotificationSchema), notificationController.sendBatchNotifications);

/**
 * @route   POST /api/admin/notifications/broadcast
 * @desc    Broadcast notification to all users (Admin)
 * @access  Admin
 */
router.post('/broadcast', validate(broadcastNotificationSchema), notificationController.broadcastNotification);

/**
 * @route   DELETE /api/admin/notifications/:id
 * @desc    Delete notification (Admin)
 * @access  Admin
 */
router.delete('/:id', notificationController.deleteNotificationAdmin);

export default router;
