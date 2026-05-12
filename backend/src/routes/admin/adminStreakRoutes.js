import express from 'express';
import * as streakController from '../../controllers/streakController.js';

const router = express.Router();

// Admin Streak routes
router.get('/stats', streakController.getStreakStats);

export default router;
