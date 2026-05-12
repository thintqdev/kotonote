import express from 'express';
import quoteRoutes from './quoteRoutes.js';
import kanaRoutes from './kanaRoutes.js';
import vocabularyRoutes from './vocabularyRoutes.js';
import streakRoutes from './streakRoutes.js';
import surveyRoutes from './surveyRoutes.js';
import profileRoutes from './profileRoutes.js';
import kanjiRoutes from './kanjiRoutes.js';

const router = express.Router();

// Mount routes (both public and authenticated user routes)
router.use('/quotes', quoteRoutes);
router.use('/kana', kanaRoutes);
router.use('/vocabulary', vocabularyRoutes);
router.use('/kanji', kanjiRoutes);
router.use('/streaks', streakRoutes);
router.use('/surveys', surveyRoutes);
router.use('/profile', profileRoutes);

export default router;
