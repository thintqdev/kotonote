import express from 'express';
import * as readingController from '../../controllers/readingController.js';
import { validate } from '../../middlewares/validate.js';
import { readingCoverUploadMiddleware } from '../../middlewares/readingCoverUpload.js';
import {
	createReadingSchema,
	updateReadingSchema,
} from '../../validators/readingValidator.js';

const router = express.Router();

router.post(
	'/upload-cover',
	readingCoverUploadMiddleware,
	readingController.uploadReadingCoverDraft,
);
router.get('/', readingController.listAdminArticles);
router.get('/:id', readingController.getAdminArticleById);
router.post('/', validate(createReadingSchema), readingController.createArticle);
router.post(
	'/:id/cover',
	readingCoverUploadMiddleware,
	readingController.uploadArticleCover,
);
router.put('/:id', validate(updateReadingSchema), readingController.updateArticle);
router.delete('/:id', readingController.deleteArticle);

export default router;
