import express from 'express';
import * as listeningController from '../../controllers/listeningController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { saveListeningProgressSchema } from '../../validators/listeningProgressValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listeningController.getAllPublished);
router.get('/:id', listeningController.getById);
router.put(
	'/:id/progress',
	validate(saveListeningProgressSchema),
	listeningController.saveExerciseProgress,
);

export default router;
