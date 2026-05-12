import express from 'express';
import * as kanjiController from '../../controllers/kanjiController.js';

const router = express.Router();

// Public routes - Decks
router.get('/decks', kanjiController.getAllDecks);
router.get('/decks/:id', kanjiController.getDeckById);
router.get('/decks/:id/kanji', kanjiController.getDeckWithKanji);

// Public routes - Kanji
router.get('/deck/:deckId/kanji', kanjiController.getKanjiByDeck);
router.get('/:id', kanjiController.getKanjiById);

export default router;
