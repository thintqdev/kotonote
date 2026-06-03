import express from 'express';
import * as controller from '../../controllers/sentenceTemplateController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { progressUpdateSchema } from '../../validators/sentenceTemplateValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/specialties', controller.listSpecialties);
router.get('/specialties/:code/pack', controller.getStudyPack);
router.get('/specialties/:code/quiz', controller.getQuiz);
router.get('/templates/:id', controller.getTemplate);
router.post(
	'/templates/:id/progress',
	validate(progressUpdateSchema),
	controller.updateProgress,
);

export default router;
