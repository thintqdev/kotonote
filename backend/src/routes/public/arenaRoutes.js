import express from 'express';
import * as arenaController from '../../controllers/arenaController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { arenaKanjiCheckSchema, arenaSubmitSchema } from '../../validators/arenaValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/status', arenaController.getArenaStatus);
router.post('/begin', arenaController.beginArenaChallenge);
router.post('/kanji/check', validate(arenaKanjiCheckSchema), arenaController.checkKanjiAnswer);
router.post('/submit', validate(arenaSubmitSchema), arenaController.submitArenaChallenge);
router.get('/leaderboard', arenaController.getArenaLeaderboard);

export default router;
