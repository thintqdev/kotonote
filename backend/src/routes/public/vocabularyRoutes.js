import express from 'express';
import * as vocabularyController from '../../controllers/vocabularyController.js';
import * as vocabularyProgressController from '../../controllers/vocabularyProgressController.js';
import userVocabularyDeckRoutes from './userVocabularyDeckRoutes.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.use('/my', userVocabularyDeckRoutes);

router.get('/progress', vocabularyProgressController.getMyDeckProgress);
router.get('/progress/:deckId', vocabularyProgressController.getDeckProgressById);
router.post(
	'/progress/:deckId/advance',
	vocabularyProgressController.advanceDeckProgress,
);

router.get('/decks', vocabularyController.getAllDecks);
router.get('/decks/:id', vocabularyController.getDeckById);
router.get('/decks/:id/vocabulary', vocabularyController.getDeckWithVocabulary);

router.get('/deck/:deckId/words', vocabularyController.getVocabularyByDeck);

export default router;
