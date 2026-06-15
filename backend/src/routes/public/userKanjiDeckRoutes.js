import express from 'express';
import * as userKanjiDeckController from '../../controllers/userKanjiDeckController.js';
import { requireMinMembershipTier } from '../../middlewares/requireMembershipTier.js';
import { validate } from '../../middlewares/validate.js';
import {
	userKanjiDeckCreateSchema,
	userKanjiDeckUpdateSchema,
	userKanjiCreateSchema,
	userKanjiImportSchema,
	userKanjiUpdateSchema,
} from '../../validators/userKanjiDeckValidator.js';
import { USER_KANJI_DECK_MIN_TIER } from '../../constants/userKanjiDeck.js';

const router = express.Router();

const requirePro = requireMinMembershipTier(USER_KANJI_DECK_MIN_TIER);

router.get('/decks', userKanjiDeckController.listMyDecks);
router.post(
	'/decks',
	requirePro,
	validate(userKanjiDeckCreateSchema),
	userKanjiDeckController.createMyDeck,
);
router.get('/decks/:id', userKanjiDeckController.getMyDeck);
router.get('/decks/:id/kanji', userKanjiDeckController.getMyDeckWithKanji);
router.put(
	'/decks/:id',
	requirePro,
	validate(userKanjiDeckUpdateSchema),
	userKanjiDeckController.updateMyDeck,
);
router.delete('/decks/:id', requirePro, userKanjiDeckController.deleteMyDeck);

router.post(
	'/decks/:deckId/kanji',
	requirePro,
	validate(userKanjiCreateSchema),
	userKanjiDeckController.createMyKanji,
);
router.post(
	'/decks/:deckId/import',
	requirePro,
	validate(userKanjiImportSchema),
	userKanjiDeckController.importMyKanji,
);
router.put(
	'/kanji/:kanjiId',
	requirePro,
	validate(userKanjiUpdateSchema),
	userKanjiDeckController.updateMyKanji,
);
router.delete('/kanji/:kanjiId', requirePro, userKanjiDeckController.deleteMyKanji);

export default router;
