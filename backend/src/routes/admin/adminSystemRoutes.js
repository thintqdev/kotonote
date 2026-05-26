import express from 'express';
import * as adminSystemController from '../../controllers/adminSystemController.js';

const router = express.Router();

router.get('/health', adminSystemController.getSystemHealth);

export default router;
