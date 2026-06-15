import { lazy } from 'react';

/** @param {() => Promise<Record<string, unknown>>} importFn @param {string} exportName */
function lazyNamed(importFn, exportName) {
	return lazy(() =>
		importFn().then((mod) => ({
			default: mod[exportName],
		})),
	);
}

// —— User: study & content ——
export const Profile = lazy(() => import('../pages/Profile.jsx'));
export const ChangePasswordPage = lazy(() => import('../pages/ChangePasswordPage.jsx'));
export const SettingsPage = lazy(() => import('../pages/SettingsPage.jsx'));
export const FeedbackPage = lazy(() => import('../pages/FeedbackPage.jsx'));
export const MembershipPage = lazy(() => import('../pages/MembershipPage.jsx'));
export const MembershipCheckoutPage = lazy(() => import('../pages/MembershipCheckoutPage.jsx'));
export const MembershipPaymentHistoryPage = lazy(
	() => import('../pages/MembershipPaymentHistoryPage.jsx'),
);
export const MembershipCheckoutReturnPage = lazy(
	() => import('../pages/MembershipCheckoutReturnPage.jsx'),
);
export const MembershipReceiptPage = lazy(() => import('../pages/MembershipReceiptPage.jsx'));
export const NotificationsPage = lazy(() => import('../pages/NotificationsPage.jsx'));
export const GrammarListPage = lazy(() => import('../pages/GrammarListPage.jsx'));
export const GrammarDetailPage = lazy(() => import('../pages/GrammarDetailPage.jsx'));
export const GrammarPracticePage = lazy(() => import('../pages/GrammarPracticePage.jsx'));
export const VocabularyListPage = lazy(() => import('../pages/VocabularyListPage.jsx'));
export const VocabularyDetailPage = lazy(() => import('../pages/VocabularyDetailPage.jsx'));
export const VocabularyPage = lazy(() => import('../pages/VocabularyPage.jsx'));
export const VocabularyIndexRedirect = lazyNamed(
	() => import('../pages/VocabularyPage.jsx'),
	'VocabularyIndexRedirect',
);
export const UserVocabularyMyDecksPage = lazy(
	() => import('../pages/UserVocabularyMyDecksPage.jsx'),
);
export const UserVocabularyDeckEditorPage = lazy(
	() => import('../pages/UserVocabularyDeckEditorPage.jsx'),
);
export const AlphabetPage = lazy(() => import('../pages/AlphabetPage.jsx'));
export const KanjiListPage = lazy(() => import('../pages/KanjiListPage.jsx'));
export const KanjiPage = lazy(() => import('../pages/KanjiPage.jsx'));
export const KanjiIndexRedirect = lazyNamed(
	() => import('../pages/KanjiPage.jsx'),
	'KanjiIndexRedirect',
);
export const UserKanjiMyDecksPage = lazy(() => import('../pages/UserKanjiMyDecksPage.jsx'));
export const UserKanjiDeckEditorPage = lazy(
	() => import('../pages/UserKanjiDeckEditorPage.jsx'),
);
export const ReadingListPage = lazy(() => import('../pages/ReadingListPage.jsx'));
export const ReadingArticlePage = lazy(() => import('../pages/ReadingArticlePage.jsx'));
export const NotebookPage = lazy(() => import('../pages/NotebookPage.jsx'));
export const JournalPage = lazy(() => import('../pages/JournalPage.jsx'));
export const LeaderboardPage = lazy(() => import('../pages/LeaderboardPage.jsx'));
export const ListeningPage = lazy(() => import('../pages/ListeningPage.jsx'));
export const ListeningExercisePage = lazy(() => import('../pages/ListeningExercisePage.jsx'));
export const KaiwaListPage = lazy(() => import('../pages/KaiwaListPage.jsx'));
export const KaiwaDetailPage = lazy(() => import('../pages/KaiwaDetailPage.jsx'));
export const KaiwaPracticePage = lazy(() => import('../pages/KaiwaPracticePage.jsx'));
export const KaiwaSessionHistoryPage = lazy(
	() => import('../pages/KaiwaSessionHistoryPage.jsx'),
);
export const KaiwaSessionViewPage = lazy(() => import('../pages/KaiwaSessionViewPage.jsx'));
export const ArenaPage = lazy(() => import('../pages/ArenaPage.jsx'));

// —— JLPT practice ——
export const ExamPaperListPage = lazy(() => import('../pages/ExamPaperListPage.jsx'));
export const ExamPaperTakePage = lazy(() => import('../pages/ExamPaperTakePage.jsx'));
export const ExamPaperResultPage = lazy(() => import('../pages/ExamPaperResultPage.jsx'));
export const ExamPaperReviewPage = lazy(() => import('../pages/ExamPaperReviewPage.jsx'));
export const ExamPaperHistoryPage = lazy(() => import('../pages/ExamPaperHistoryPage.jsx'));

// —— Admin ——
export const AdminShell = lazy(() => import('../pages/admin/AdminShell.jsx'));
export const AdminStubContent = lazyNamed(
	() => import('../pages/admin/AdminShell.jsx'),
	'AdminStubContent',
);
export const AdminOverviewPage = lazy(() => import('../pages/admin/AdminOverviewPage.jsx'));
export const AdminSystemPage = lazy(() => import('../pages/admin/AdminSystemPage.jsx'));
export const AdminVocabularyHome = lazy(() => import('../pages/admin/AdminVocabularyHome.jsx'));
export const AdminKanjiHome = lazy(() => import('../pages/admin/AdminKanjiHome.jsx'));
export const VocabularyDeckEditorPage = lazy(
	() => import('../pages/admin/VocabularyDeckEditorPage.jsx'),
);
export const KanjiDeckEditorPage = lazy(() => import('../pages/admin/KanjiDeckEditorPage.jsx'));
export const AdminQuotesPage = lazy(() => import('../pages/admin/AdminQuotesPage.jsx'));
export const AdminPromptsPage = lazy(() => import('../pages/admin/AdminPromptsPage.jsx'));
export const BadgePage = lazy(() => import('../pages/admin/BadgePage.jsx'));
export const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage.jsx'));
export const AdminNotificationsDemoPage = lazy(
	() => import('../pages/admin/AdminNotificationsDemoPage.jsx'),
);
export const AdminGrammarHome = lazy(() => import('../pages/admin/AdminGrammarHome.jsx'));
export const AdminGrammarPracticePage = lazy(
	() => import('../pages/admin/AdminGrammarPracticePage.jsx'),
);
export const AdminGrammarEditorPage = lazy(
	() => import('../pages/admin/AdminGrammarEditorPage.jsx'),
);
export const AdminReadingHome = lazy(() => import('../pages/admin/AdminReadingHome.jsx'));
export const AdminReadingEditorPage = lazy(
	() => import('../pages/admin/AdminReadingEditorPage.jsx'),
);
export const AdminListeningHome = lazy(() => import('../pages/admin/AdminListeningHome.jsx'));
export const AdminSubscriptionsPage = lazy(
	() => import('../pages/admin/AdminSubscriptionsPage.jsx'),
);
export const AdminFeedbackPage = lazy(() => import('../pages/admin/AdminFeedbackPage.jsx'));
export const AdminKaiwaHome = lazy(() => import('../pages/admin/AdminKaiwaHome.jsx'));
export const AdminKaiwaEditorPage = lazy(() => import('../pages/admin/AdminKaiwaEditorPage.jsx'));
export const AdminExamPaperHome = lazy(() => import('../pages/admin/AdminExamPaperHome.jsx'));
export const AdminExamPaperEditorPage = lazy(
	() => import('../pages/admin/AdminExamPaperEditorPage.jsx'),
);
export const AdminExamStructureHome = lazy(
	() => import('../pages/admin/AdminExamStructureHome.jsx'),
);
export const AdminExamStructureEditPage = lazy(
	() => import('../pages/admin/AdminExamStructureEditPage.jsx'),
);
export const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage.jsx'));
export const AdminArenaPage = lazy(() => import('../pages/admin/AdminArenaPage.jsx'));
