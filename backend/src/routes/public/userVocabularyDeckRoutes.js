import express from 'express';
import * as userVocabularyDeckController from '../../controllers/userVocabularyDeckController.js';
import { requireMinMembershipTier } from '../../middlewares/requireMembershipTier.js';
import { validate } from '../../middlewares/validate.js';
import {
	userVocabularyDeckCreateSchema,
	userVocabularyDeckUpdateSchema,
	userVocabularyCreateSchema,
	userVocabularyImportSchema,
	userVocabularyUpdateSchema,
} from '../../validators/userVocabularyDeckValidator.js';
import { USER_VOCAB_DECK_MIN_TIER } from '../../constants/userVocabularyDeck.js';

const router = express.Router();

const requirePro = requireMinMembershipTier(USER_VOCAB_DECK_MIN_TIER);

router.get('/decks', userVocabularyDeckController.listMyDecks);
router.post(
	'/decks',
	requirePro,
	validate(userVocabularyDeckCreateSchema),
	userVocabularyDeckController.createMyDeck,
);
router.get('/decks/:id', userVocabularyDeckController.getMyDeck);
router.get('/decks/:id/vocabulary', userVocabularyDeckController.getMyDeckWithVocabulary);
router.put(
	'/decks/:id',
	requirePro,
	validate(userVocabularyDeckUpdateSchema),
	userVocabularyDeckController.updateMyDeck,
);
router.delete('/decks/:id', requirePro, userVocabularyDeckController.deleteMyDeck);

router.post(
	'/decks/:deckId/words',
	requirePro,
	validate(userVocabularyCreateSchema),
	userVocabularyDeckController.createMyVocab,
);
router.post(
	'/decks/:deckId/import',
	requirePro,
	validate(userVocabularyImportSchema),
	userVocabularyDeckController.importMyVocabulary,
);
router.put(
	'/words/:vocabId',
	requirePro,
	validate(userVocabularyUpdateSchema),
	userVocabularyDeckController.updateMyVocab,
);
router.delete('/words/:vocabId', requirePro, userVocabularyDeckController.deleteMyVocab);

export default router;
