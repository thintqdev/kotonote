import express from 'express';
import * as feedbackController from '../../controllers/feedbackController.js';
import { validate } from '../../middlewares/validate.js';
import { adminUpdateFeedbackSchema } from '../../validators/feedbackValidator.js';

const router = express.Router();

router.get('/', feedbackController.listFeedbacksAdmin);
router.patch(
	'/:id',
	validate(adminUpdateFeedbackSchema),
	feedbackController.updateFeedbackStatusAdmin
);

export default router;
