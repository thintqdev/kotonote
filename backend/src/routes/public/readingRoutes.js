import express from 'express';
import * as readingController from '../../controllers/readingController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { analyzeReadingTranslationSchema, saveReadingProgressSchema } from '../../validators/readingValidator.js';
import { readingAiRateLimit } from '../../middlewares/readingAiRateLimit.js';

const router = express.Router();

router.use(authenticate);

router.get('/summary', readingController.getReadingSummary);
router.get('/', readingController.listPublishedArticles);
router.get('/:slug', readingController.getPublishedArticleBySlug);
router.post('/:slug/translation-feedback', readingAiRateLimit, validate(analyzeReadingTranslationSchema), readingController.analyzeArticleTranslation);
router.put(
	'/:slug/progress',
	validate(saveReadingProgressSchema),
	readingController.saveArticleProgress,
);

export default router;
