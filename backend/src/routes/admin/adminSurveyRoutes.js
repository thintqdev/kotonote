import express from 'express';
import * as surveyController from '../../controllers/surveyController.js';

const router = express.Router();

// Admin Survey routes
router.get('/', surveyController.getAllSurveys);
router.get('/stats', surveyController.getSurveyStats);
router.get('/overview', surveyController.getAdminOverview);

export default router;
