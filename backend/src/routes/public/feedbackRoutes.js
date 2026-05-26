import express from 'express';
import * as feedbackController from '../../controllers/feedbackController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { submitFeedbackSchema } from '../../validators/feedbackValidator.js';
import { feedbackMediaUploadMiddleware } from '../../middlewares/feedbackMediaUpload.js';

const router = express.Router();

router.post(
	'/uploads',
	authenticate,
	feedbackMediaUploadMiddleware,
	feedbackController.uploadFeedbackMedia
);

router.post(
	'/',
	authenticate,
	validate(submitFeedbackSchema),
	feedbackController.submitFeedback
);
router.get('/me', authenticate, feedbackController.getMyFeedbacks);

export default router;
