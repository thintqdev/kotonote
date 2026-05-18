import express from 'express';
import adminListeningController from '../../controllers/admin/adminListeningController.js';

const router = express.Router();

router.get('/', adminListeningController.getAll);
router.get('/:id', adminListeningController.getById);
router.post('/', adminListeningController.create);
router.put('/:id', adminListeningController.update);
router.delete('/:id', adminListeningController.delete);

export default router;
