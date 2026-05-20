import express from 'express';
import * as aiController from '../../controllers/aiController.js';

const router = express.Router();

// AI Generation routes
router.post('/generate/vocabulary', aiController.generateVocabulary);
router.post('/generate/kanji', aiController.generateKanji);
router.post('/generate/grammar', aiController.generateGrammar);
router.post('/generate/reading', aiController.generateReading);
router.post('/translate', aiController.translate);
router.get('/test', aiController.testAIConnection);

export default router;
