import express from 'express';
import * as vocabularyController from '../../controllers/vocabularyController.js';
import { validate } from '../../middlewares/validate.js';
import {
	vocabularyDeckCreateSchema,
	vocabularyDeckUpdateSchema,
	vocabularyCreateSchema,
	vocabularyUpdateSchema,
} from '../../validators/vocabularyValidator.js';

const router = express.Router();

// Admin Vocabulary Deck routes
router.post('/decks', validate(vocabularyDeckCreateSchema), vocabularyController.createDeck);
router.put('/decks/:id', validate(vocabularyDeckUpdateSchema), vocabularyController.updateDeck);
router.delete('/decks/:id', vocabularyController.deleteDeck);

// Admin Vocabulary Word routes
router.post('/words', validate(vocabularyCreateSchema), vocabularyController.createVocab);
router.put('/words/:id', validate(vocabularyUpdateSchema), vocabularyController.updateVocab);
router.delete('/words/:id', vocabularyController.deleteVocab);

// Import & AI Generation routes
router.post('/decks/:deckId/import', vocabularyController.importVocabularyFromJSON);
router.post('/generate', vocabularyController.generateVocabularyWithAI);

export default router;
