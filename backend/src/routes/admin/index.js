import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { USER_ROLE } from '../../constants/userStatus.js';
import adminVocabularyRoutes from './adminVocabularyRoutes.js';
import adminQuoteRoutes from './adminQuoteRoutes.js';
import adminBadgeRoutes from './adminBadgeRoutes.js';
import adminSurveyRoutes from './adminSurveyRoutes.js';
import adminStreakRoutes from './adminStreakRoutes.js';
import adminKanjiRoutes from './adminKanjiRoutes.js';
import adminAIRoutes from './adminAIRoutes.js';
import adminUserRoutes from './adminUserRoutes.js';
import adminNotificationRoutes from './adminNotificationRoutes.js';
import adminGrammarRoutes from './adminGrammarRoutes.js';
import adminReadingRoutes from './adminReadingRoutes.js';

import adminListeningRoutes from './adminListeningRoutes.js';
import adminKaiwaRoutes from './adminKaiwaRoutes.js';
import adminExamPaperRoutes from './adminExamPaperRoutes.js';
import adminExamStructureRoutes from './adminExamStructureRoutes.js';
import adminPromptRoutes from './adminPromptRoutes.js';
import adminMembershipRoutes from './adminMembershipRoutes.js';
import adminFeedbackRoutes from './adminFeedbackRoutes.js';
import adminSystemRoutes from './adminSystemRoutes.js';
import adminSettingsRoutes from './adminSettingsRoutes.js';
import adminArenaRoutes from './adminArenaRoutes.js';
import adminSentenceTemplateRoutes from './adminSentenceTemplateRoutes.js';

const router = express.Router();

// Apply authentication and admin authorization to all admin routes
router.use(authenticate);
router.use(authorize(USER_ROLE.ADMIN));

// Mount admin routes
router.use('/vocabulary', adminVocabularyRoutes);
router.use('/quotes', adminQuoteRoutes);
router.use('/badges', adminBadgeRoutes);
router.use('/surveys', adminSurveyRoutes);
router.use('/streaks', adminStreakRoutes);
router.use('/kanji', adminKanjiRoutes);
router.use('/ai', adminAIRoutes);
router.use('/users', adminUserRoutes);
router.use('/notifications', adminNotificationRoutes);
router.use('/grammar', adminGrammarRoutes);
router.use('/reading', adminReadingRoutes);
router.use('/listening', adminListeningRoutes);
router.use('/kaiwa', adminKaiwaRoutes);
router.use('/exam-papers', adminExamPaperRoutes);
router.use('/exam-structures', adminExamStructureRoutes);
router.use('/prompts', adminPromptRoutes);
router.use('/memberships', adminMembershipRoutes);
router.use('/feedback', adminFeedbackRoutes);
router.use('/system', adminSystemRoutes);
router.use('/settings', adminSettingsRoutes);
router.use('/arena', adminArenaRoutes);
router.use('/sentence-templates', adminSentenceTemplateRoutes);

export default router;
