import express from 'express';
import * as adminGrammarPracticeController from '../../controllers/admin/adminGrammarPracticeController.js';
import { validate } from '../../middlewares/validate.js';
import {
	generateGrammarPracticeSchema,
	importGrammarPracticeSchema,
	updateGrammarPracticeQuestionSchema,
} from '../../validators/grammarPracticeValidator.js';

const router = express.Router();

router.get('/', adminGrammarPracticeController.listGrammarPracticeQuestions);
router.post(
	'/import',
	validate(importGrammarPracticeSchema),
	adminGrammarPracticeController.importGrammarPracticeQuestions,
);
router.post(
	'/generate',
	validate(generateGrammarPracticeSchema),
	adminGrammarPracticeController.generateGrammarPracticeQuestions,
);
router.get('/:id', adminGrammarPracticeController.getGrammarPracticeQuestionById);
router.put(
	'/:id',
	validate(updateGrammarPracticeQuestionSchema),
	adminGrammarPracticeController.updateGrammarPracticeQuestion,
);
router.delete('/:id', adminGrammarPracticeController.deleteGrammarPracticeQuestion);

export default router;
