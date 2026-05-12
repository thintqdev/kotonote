import express from 'express';
import * as surveyController from '../controllers/surveyController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { surveySchema } from '../validators/surveyValidator.js';
import { USER_ROLE } from '../constants/userStatus.js';

const router = express.Router();

// User routes - require authentication
router.post('/', authenticate, validate(surveySchema), surveyController.submitSurvey);
router.get('/me', authenticate, surveyController.getMySurvey);

// Admin routes - require admin role
router.get('/', authenticate, authorize(USER_ROLE.ADMIN), surveyController.getAllSurveys);
router.get('/stats', authenticate, authorize(USER_ROLE.ADMIN), surveyController.getSurveyStats);

export default router;
