import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/me', authenticate, userController.getMe);
router.put('/me', authenticate, userController.updateMe);

export default router;
