import express from 'express';
import * as vocabularyController from '../../controllers/vocabularyController.js';

const router = express.Router();

// Public routes - Decks
router.get('/decks', vocabularyController.getAllDecks);
router.get('/decks/:id', vocabularyController.getDeckById);
router.get('/decks/:id/vocabulary', vocabularyController.getDeckWithVocabulary);

// Public routes - Vocabulary
router.get('/deck/:deckId/words', vocabularyController.getVocabularyByDeck);

export default router;
