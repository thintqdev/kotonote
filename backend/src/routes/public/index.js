import express from 'express';
import quoteRoutes from './quoteRoutes.js';
import vocabularyRoutes from './vocabularyRoutes.js';
import streakRoutes from './streakRoutes.js';
import leaderboardRoutes from './leaderboardRoutes.js';
import surveyRoutes from './surveyRoutes.js';
import profileRoutes from './profileRoutes.js';
import kanjiRoutes from './kanjiRoutes.js';
import grammarRoutes from './grammarRoutes.js';
import notebookRoutes from './notebookRoutes.js';
import readingRoutes from './readingRoutes.js';
import listeningRoutes from './listeningRoutes.js';
import kaiwaRoutes from './kaiwaRoutes.js';
import journalRoutes from './journalRoutes.js';
import membershipRoutes from './membershipRoutes.js';
import examPaperRoutes from './examPaperRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import arenaRoutes from './arenaRoutes.js';
import sentenceTemplateRoutes from './sentenceTemplateRoutes.js';

const router = express.Router();

// Mount routes (both public and authenticated user routes)
router.use('/quotes', quoteRoutes);
router.use('/vocabulary', vocabularyRoutes);
router.use('/kanji', kanjiRoutes);
router.use('/grammar', grammarRoutes);
router.use('/streaks', streakRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/surveys', surveyRoutes);
router.use('/profile', profileRoutes);
router.use('/users', profileRoutes);
router.use('/notebook', notebookRoutes);
router.use('/reading', readingRoutes);
router.use('/listening', listeningRoutes);
router.use('/kaiwa', kaiwaRoutes);
router.use('/journal', journalRoutes);
router.use('/membership', membershipRoutes);
router.use('/exam-papers', examPaperRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/arena', arenaRoutes);
router.use('/sentences', sentenceTemplateRoutes);

export default router;
