import express from 'express';
import * as kanjiController from '../../controllers/kanjiController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/decks', kanjiController.getAllDecks);
router.get('/decks/:id', kanjiController.getDeckById);
router.get('/decks/:id/kanji', kanjiController.getDeckWithKanji);

router.get('/deck/:deckId/kanji', kanjiController.getKanjiByDeck);
router.get('/:id', kanjiController.getKanjiById);

export default router;
