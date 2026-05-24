import express from 'express';
import * as journalController from '../../controllers/journalController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { analyzeJournalSchema } from '../../validators/journalValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/quota', journalController.getQuota);
router.get('/entries', journalController.listEntries);
router.post(
	'/entries/analyze',
	validate(analyzeJournalSchema),
	journalController.analyzeEntry,
);
router.get('/entries/:id', journalController.getEntry);
router.delete('/entries/:id', journalController.deleteEntry);

export default router;
