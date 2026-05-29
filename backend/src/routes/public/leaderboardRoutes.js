import express from 'express';
import * as leaderboardController from '../../controllers/leaderboardController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, leaderboardController.getLeaderboards);

export default router;
