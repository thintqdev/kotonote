import express from 'express';
import * as readingController from '../../controllers/readingController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { saveReadingProgressSchema } from '../../validators/readingValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/summary', readingController.getReadingSummary);
router.get('/', readingController.listPublishedArticles);
router.get('/:slug', readingController.getPublishedArticleBySlug);
router.put(
	'/:slug/progress',
	validate(saveReadingProgressSchema),
	readingController.saveArticleProgress,
);

export default router;
