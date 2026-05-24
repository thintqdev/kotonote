import express from 'express';
import adminListeningController from '../../controllers/admin/adminListeningController.js';
import {
	uploadListeningAudio,
	uploadListeningImage,
} from '../../controllers/admin/adminListeningUploadController.js';
import { listeningAudioUploadMiddleware } from '../../middlewares/listeningAudioUpload.js';
import { listeningImageUploadMiddleware } from '../../middlewares/listeningImageUpload.js';

const router = express.Router();

router.post(
	'/upload/audio',
	listeningAudioUploadMiddleware,
	uploadListeningAudio,
);
router.post(
	'/upload/image',
	listeningImageUploadMiddleware,
	uploadListeningImage,
);

router.get('/', adminListeningController.getAll);
router.get('/:id', adminListeningController.getById);
router.post('/', adminListeningController.create);
router.put('/:id', adminListeningController.update);
router.delete('/:id', adminListeningController.delete);

export default router;
