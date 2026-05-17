import express from 'express';
import * as notebookController from '../../controllers/notebookController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { notebookImageUploadMiddleware } from '../../middlewares/notebookImageUpload.js';
import {
	createNoteSchema,
	updateNoteSchema,
} from '../../validators/notebookValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/notes', notebookController.listNotes);
router.post('/notes', validate(createNoteSchema), notebookController.createNote);
router.post(
	'/images',
	notebookImageUploadMiddleware,
	notebookController.uploadNoteImage,
);
router.get('/notes/:id', notebookController.getNote);
router.put('/notes/:id', validate(updateNoteSchema), notebookController.updateNote);
router.delete('/notes/:id', notebookController.deleteNote);

export default router;
