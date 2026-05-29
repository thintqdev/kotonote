import express from 'express';
import * as pageViewController from '../../controllers/pageViewController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/page-views', authenticate, pageViewController.recordPageView);

export default router;
