import express from 'express';
import * as streakController from '../../controllers/streakController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/leaderboard', streakController.getTopStreaks);

// User routes (require authentication)
router.get('/me', authenticate, streakController.getMyStreak);
router.post('/check-in', authenticate, streakController.checkIn);
router.post('/freeze', authenticate, streakController.useFreeze);
router.get('/weekly', authenticate, streakController.getWeeklyCheckIns);

export default router;
