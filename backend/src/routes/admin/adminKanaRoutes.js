import express from 'express';
import * as kanaController from '../../controllers/kanaController.js';
import { validate } from '../../middlewares/validate.js';
import { kanaSchema } from '../../validators/kanaValidator.js';

const router = express.Router();

// Admin Kana routes
router.get('/', kanaController.getAllKana);
router.get('/:id', kanaController.getKanaById);
router.post('/', validate(kanaSchema), kanaController.createKana);
router.post('/bulk', kanaController.bulkCreateKana);
router.put('/:id', validate(kanaSchema), kanaController.updateKana);
router.delete('/:id', kanaController.deleteKana);

export default router;
