import express from 'express';
import * as examPaperController from '../../controllers/examPaperController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/history', examPaperController.listExamPaperAttempts);
router.get('/history/:attemptId', examPaperController.getExamPaperAttempt);
router.post('/history/:attemptId/review', examPaperController.reviewExamPaperAttempt);
router.get('/', examPaperController.listPublishedExamPapers);
router.get('/:slug', examPaperController.getPublishedExamPaperBySlug);
router.post('/:slug/submit', examPaperController.submitPublishedExamPaper);
router.post('/:slug/review', examPaperController.reviewPublishedExamPaper);

export default router;
