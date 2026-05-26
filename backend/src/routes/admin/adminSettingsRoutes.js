import express from 'express';
import * as adminSettingsController from '../../controllers/admin/adminSettingsController.js';

const router = express.Router();

router.get('/', adminSettingsController.getStudioSettings);

export default router;
