import express from 'express';
import * as grammarController from '../../controllers/grammarController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', grammarController.listPublishedGrammars);
router.get('/:slug', grammarController.getPublishedGrammarBySlug);

export default router;
