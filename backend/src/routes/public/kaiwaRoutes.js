import express from 'express';
import * as kaiwaController from '../../controllers/kaiwaController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { kaiwaPracticeTurnSchema } from '../../validators/kaiwaPracticeValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', kaiwaController.listPublished);
router.get('/sessions', kaiwaController.listPracticeSessions);
router.get('/sessions/:sessionId', kaiwaController.getPracticeSession);
router.post(
	'/:id/practice/turn',
	validate(kaiwaPracticeTurnSchema),
	kaiwaController.practiceTurn,
);
router.get('/:id/sessions', kaiwaController.listContextPracticeSessions);
router.get('/:id', kaiwaController.getById);

export default router;
