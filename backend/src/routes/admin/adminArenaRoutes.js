import express from 'express';
import * as adminArenaController from '../../controllers/admin/adminArenaController.js';
import { validate } from '../../middlewares/validate.js';
import {
	arenaKanjiImportSchema,
	arenaParticleImportSchema,
	arenaParticleSchema,
	arenaVocabImportSchema,
	arenaVocabSchema,
	updateArenaGameSchema,
	updateArenaKanjiSchema,
	updateArenaParticleSchema,
	updateArenaSettingsSchema,
	updateArenaVocabSchema,
} from '../../validators/arenaValidator.js';

const router = express.Router();

router.get('/dashboard', adminArenaController.getArenaDashboard);
router.put('/settings', validate(updateArenaSettingsSchema), adminArenaController.updateArenaSettings);
router.put('/games/:gameKey', validate(updateArenaGameSchema), adminArenaController.updateArenaGame);

router.get('/kanji', adminArenaController.listKanji);
router.post('/kanji/import', validate(arenaKanjiImportSchema), adminArenaController.importKanji);
router.put('/kanji/:id', validate(updateArenaKanjiSchema), adminArenaController.updateKanji);
router.delete('/kanji/:id', adminArenaController.deleteKanji);

router.get('/vocab', adminArenaController.listVocab);
router.post('/vocab/import', validate(arenaVocabImportSchema), adminArenaController.importVocab);
router.post('/vocab', validate(arenaVocabSchema), adminArenaController.createVocab);
router.put('/vocab/:id', validate(updateArenaVocabSchema), adminArenaController.updateVocab);
router.delete('/vocab/:id', adminArenaController.deleteVocab);

router.get('/particles', adminArenaController.listParticles);
router.post(
	'/particles/import',
	validate(arenaParticleImportSchema),
	adminArenaController.importParticles,
);
router.post('/particles', validate(arenaParticleSchema), adminArenaController.createParticle);
router.put('/particles/:id', validate(updateArenaParticleSchema), adminArenaController.updateParticle);
router.delete('/particles/:id', adminArenaController.deleteParticle);

export default router;
