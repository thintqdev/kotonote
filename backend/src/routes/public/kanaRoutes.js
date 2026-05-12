import express from 'express';
import * as kanaController from '../../controllers/kanaController.js';

const router = express.Router();

// Public routes
router.get('/script/:script', kanaController.getKanaByScript);
router.get('/script/:script/grouped', kanaController.getKanaGrouped);

export default router;
