import express from 'express';
import * as kanjiController from '../../controllers/kanjiController.js';
import { validate } from '../../middlewares/validate.js';
import { kanjiDeckSchema, kanjiSchema, bulkKanjiSchema } from '../../validators/kanjiValidator.js';

const router = express.Router();

// Admin Kanji Deck routes
router.post('/decks', validate(kanjiDeckSchema), kanjiController.createDeck);
router.put('/decks/:id', validate(kanjiDeckSchema), kanjiController.updateDeck);
router.delete('/decks/:id', kanjiController.deleteDeck);

// Admin Kanji routes
router.post('/kanji', validate(kanjiSchema), kanjiController.createKanji);
router.post('/decks/:deckId/bulk', validate(bulkKanjiSchema), kanjiController.bulkCreateKanji);
router.put('/kanji/:id', validate(kanjiSchema), kanjiController.updateKanji);
router.delete('/kanji/:id', kanjiController.deleteKanji);

// Import routes
router.post('/decks/:deckId/import', validate(bulkKanjiSchema), kanjiController.importKanjiFromJSON);

// NOTE: AI Generation has been moved to /api/admin/ai/generate/kanji
// See adminAIRoutes.js for AI-related endpoints

export default router;
