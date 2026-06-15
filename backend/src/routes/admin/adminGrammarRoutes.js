import express from 'express';
import * as grammarController from '../../controllers/grammarController.js';
import adminGrammarPracticeRoutes from './adminGrammarPracticeRoutes.js';
import { validate } from '../../middlewares/validate.js';
import {
	createGrammarSchema,
	updateGrammarSchema,
} from '../../validators/grammarValidator.js';

const router = express.Router();

router.use('/practice', adminGrammarPracticeRoutes);

router.get('/', grammarController.listAdminGrammars);
router.get('/:id', grammarController.getAdminGrammarById);
router.post('/', validate(createGrammarSchema), grammarController.createGrammar);
router.put('/:id', validate(updateGrammarSchema), grammarController.updateGrammar);
router.delete('/:id', grammarController.deleteGrammar);

export default router;
