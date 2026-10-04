import express from 'express';
import * as readingController from '../../controllers/readingController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import {
	analyzeSentenceTranslationsSchema,
	saveReadingProgressSchema,
	summarizeTranslationSchema,
} from '../../validators/readingValidator.js';
import { readingSentenceAiRateLimit } from '../../middlewares/readingAiRateLimit.js';

const router = express.Router();

router.use(authenticate);

router.get('/summary', readingController.getReadingSummary);
router.get('/', readingController.listPublishedArticles);
router.get('/:slug', readingController.getPublishedArticleBySlug);
router.post(
	'/:slug/sentence-feedback',
	readingSentenceAiRateLimit,
	validate(analyzeSentenceTranslationsSchema),
	readingController.analyzeSentenceTranslations,
);
router.post(
	'/:slug/translation-summary',
	readingSentenceAiRateLimit,
	validate(summarizeTranslationSchema),
	readingController.summarizeArticleTranslation,
);
router.put(
	'/:slug/progress',
	validate(saveReadingProgressSchema),
	readingController.saveArticleProgress,
);

export default router;
