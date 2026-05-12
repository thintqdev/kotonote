import express from 'express';
import * as vocabularyController from '../../controllers/vocabularyController.js';
import { validate } from '../../middlewares/validate.js';
import { vocabularyDeckSchema, vocabularySchema } from '../../validators/vocabularyValidator.js';

const router = express.Router();

// Admin Vocabulary Deck routes
router.post('/decks', validate(vocabularyDeckSchema), vocabularyController.createDeck);
router.put('/decks/:id', validate(vocabularyDeckSchema), vocabularyController.updateDeck);
router.delete('/decks/:id', vocabularyController.deleteDeck);

// Admin Vocabulary Word routes
router.post('/words', validate(vocabularySchema), vocabularyController.createVocab);
router.put('/words/:id', validate(vocabularySchema), vocabularyController.updateVocab);
router.delete('/words/:id', vocabularyController.deleteVocab);

// Import & AI Generation routes
router.post('/decks/:deckId/import', vocabularyController.importVocabularyFromJSON);
router.post('/generate', vocabularyController.generateVocabularyWithAI);

export default router;
