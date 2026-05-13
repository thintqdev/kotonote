import express from 'express';
import * as userController from '../../controllers/userController.js';
import { validate } from '../../middlewares/validate.js';
import { bulkUsersStatusSchema } from '../../validators/adminUserValidator.js';

const router = express.Router();

// User management routes (đặt /bulk/status trước /:id)
router.get('/statistics', userController.getUserStatistics);
router.patch('/bulk/status', validate(bulkUsersStatusSchema), userController.bulkUpdateUsersStatus);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/status', userController.updateUserStatus);

export default router;
