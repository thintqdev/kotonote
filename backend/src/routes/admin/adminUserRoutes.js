import express from 'express';
import * as userController from '../../controllers/userController.js';

const router = express.Router();

// User management routes
router.get('/statistics', userController.getUserStatistics);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/status', userController.updateUserStatus);

export default router;
