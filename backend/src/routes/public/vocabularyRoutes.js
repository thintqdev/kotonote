import express from 'express';
import * as vocabularyController from '../../controllers/vocabularyController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/decks', vocabularyController.getAllDecks);
router.get('/decks/:id', vocabularyController.getDeckById);
router.get('/decks/:id/vocabulary', vocabularyController.getDeckWithVocabulary);

router.get('/deck/:deckId/words', vocabularyController.getVocabularyByDeck);

export default router;
