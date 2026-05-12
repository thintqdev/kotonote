import express from 'express';
import * as surveyController from '../../controllers/surveyController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { surveySchema } from '../../validators/surveyValidator.js';

const router = express.Router();

// User survey routes (require authentication)
router.post('/', authenticate, validate(surveySchema), surveyController.submitSurvey);
router.get('/me', authenticate, surveyController.getMySurvey);

export default router;
