import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { SurveyCompletionProvider } from "./context/SurveyCompletionContext.jsx";
import { UserNotificationProvider } from "./context/UserNotificationContext.jsx";
import RequireAuth from "./components/routing/RequireAuth.jsx";
import RequireAuthAndSurvey from "./components/routing/RequireAuthAndSurvey.jsx";
import RequireGuest from "./components/routing/RequireGuest.jsx";
import SurveyGate from "./components/routing/SurveyGate.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import RegisterThankYouPage from "./pages/RegisterThankYouPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import Profile from "./pages/Profile.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import FeedbackPage from "./pages/FeedbackPage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import MembershipCheckoutPage from "./pages/MembershipCheckoutPage.jsx";
import MembershipPaymentHistoryPage from "./pages/MembershipPaymentHistoryPage.jsx";
import MembershipCheckoutReturnPage from "./pages/MembershipCheckoutReturnPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import GrammarListPage from "./pages/GrammarListPage.jsx";
import GrammarDetailPage from "./pages/GrammarDetailPage.jsx";
import VocabularyListPage from "./pages/VocabularyListPage.jsx";
import VocabularyDetailPage from "./pages/VocabularyDetailPage.jsx";
import VocabularyPage, {
  VocabularyIndexRedirect,
} from "./pages/VocabularyPage.jsx";
import AlphabetPage from "./pages/AlphabetPage.jsx";
import KanjiListPage from "./pages/KanjiListPage.jsx";
import KanjiPage, { KanjiIndexRedirect } from "./pages/KanjiPage.jsx";
import ReadingListPage from "./pages/ReadingListPage.jsx";
import ReadingArticlePage from "./pages/ReadingArticlePage.jsx";
import NotebookPage from "./pages/NotebookPage.jsx";
import JournalPage from "./pages/JournalPage.jsx";
import ListeningPage from "./pages/ListeningPage.jsx";
import ListeningExercisePage from "./pages/ListeningExercisePage.jsx";
import KaiwaListPage from "./pages/KaiwaListPage.jsx";
import KaiwaDetailPage from "./pages/KaiwaDetailPage.jsx";
import KaiwaPracticePage from "./pages/KaiwaPracticePage.jsx";
import KaiwaSessionHistoryPage from "./pages/KaiwaSessionHistoryPage.jsx";
import KaiwaSessionViewPage from "./pages/KaiwaSessionViewPage.jsx";
import ExamPaperListPage from "./pages/ExamPaperListPage.jsx";
import ExamPaperTakePage from "./pages/ExamPaperTakePage.jsx";
import ExamPaperResultPage from "./pages/ExamPaperResultPage.jsx";
import ExamPaperReviewPage from "./pages/ExamPaperReviewPage.jsx";
import ExamPaperHistoryPage from "./pages/ExamPaperHistoryPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import AdminShell, {
  AdminStubContent,
} from "./pages/admin/AdminShell.jsx";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage.jsx";
import AdminSystemPage from "./pages/admin/AdminSystemPage.jsx";
import AdminVocabularyHome from "./pages/admin/AdminVocabularyHome.jsx";
import AdminKanjiHome from "./pages/admin/AdminKanjiHome.jsx";
import VocabularyDeckEditorPage from "./pages/admin/VocabularyDeckEditorPage.jsx";
import KanjiDeckEditorPage from "./pages/admin/KanjiDeckEditorPage.jsx";
import AdminQuotesPage from "./pages/admin/AdminQuotesPage.jsx";
import AdminPromptsPage from "./pages/admin/AdminPromptsPage.jsx";
import BadgePage from "./pages/admin/BadgePage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import AdminNotificationsDemoPage from "./pages/admin/AdminNotificationsDemoPage.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import { TermsPage, PrivacyPage } from "./pages/LegalDocumentPage.jsx";
import AdminGrammarHome from "./pages/admin/AdminGrammarHome.jsx";
import AdminGrammarEditorPage from "./pages/admin/AdminGrammarEditorPage.jsx";
import AdminReadingHome from "./pages/admin/AdminReadingHome.jsx";
import AdminReadingEditorPage from "./pages/admin/AdminReadingEditorPage.jsx";
import AdminListeningHome from "./pages/admin/AdminListeningHome.jsx";
import AdminSubscriptionsPage from "./pages/admin/AdminSubscriptionsPage.jsx";
import AdminFeedbackPage from "./pages/admin/AdminFeedbackPage.jsx";
import AdminKaiwaHome from "./pages/admin/AdminKaiwaHome.jsx";
import AdminKaiwaEditorPage from "./pages/admin/AdminKaiwaEditorPage.jsx";
import AdminExamPaperHome from "./pages/admin/AdminExamPaperHome.jsx";
import AdminExamPaperEditorPage from "./pages/admin/AdminExamPaperEditorPage.jsx";
import AdminExamStructureHome from "./pages/admin/AdminExamStructureHome.jsx";
import AdminExamStructureEditPage from "./pages/admin/AdminExamStructureEditPage.jsx";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.jsx";
import MembershipReceiptPage from "./pages/MembershipReceiptPage.jsx";
import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <SurveyCompletionProvider>
        <UserNotificationProvider>
          <Router>
          <Toaster
            position="top-center"
            richColors
            closeButton
            expand={false}
            gap={10}
            toastOptions={{
              duration: 4200,
              classNames: {
                toast: "app-toast",
                title: "app-toast-title",
                description: "app-toast-desc",
              },
            }}
          />
          <Routes>
            <Route element={<RequireGuest />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register/thank-you" element={<RegisterThankYouPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/survey" element={<SurveyGate />} />
              <Route element={<RequireAuthAndSurvey />}>
                <Route path="/" element={<DashboardHome />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/membership" element={<MembershipPage />} />
                <Route
                  path="/membership/checkout"
                  element={<MembershipCheckoutPage />}
                />
                <Route
                  path="/membership/checkout/return"
                  element={<MembershipCheckoutReturnPage />}
                />
                <Route
                  path="/membership/history"
                  element={<MembershipPaymentHistoryPage />}
                />
                <Route
                  path="/membership/receipt/:checkoutId"
                  element={<MembershipReceiptPage />}
                />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/grammar" element={<GrammarListPage />} />
                <Route path="/grammar/:slug" element={<GrammarDetailPage />} />
                <Route path="/alphabet" element={<AlphabetPage />} />
                <Route
                  path="/vocabulary/browse"
                  element={<VocabularyListPage />}
                />
                <Route
                  path="/vocabulary/lesson/:lessonNo"
                  element={<VocabularyPage />}
                />
                <Route path="/vocabulary/:id" element={<VocabularyDetailPage />} />
                <Route path="/vocabulary" element={<VocabularyIndexRedirect />} />
                <Route path="/kanji/browse" element={<KanjiListPage />} />
                <Route path="/kanji/lesson/:lessonNo" element={<KanjiPage />} />
                <Route path="/kanji" element={<KanjiIndexRedirect />} />
                <Route path="/reading" element={<ReadingListPage />} />
                <Route path="/reading/:id" element={<ReadingArticlePage />} />
                <Route path="/notebook" element={<NotebookPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/listening" element={<ListeningPage />} />
                <Route path="/listening/:id" element={<ListeningExercisePage />} />
                <Route path="/kaiwa" element={<KaiwaListPage />} />
                <Route
                  path="/kaiwa/sessions/:sessionId"
                  element={<KaiwaSessionViewPage />}
                />
                <Route
                  path="/kaiwa/:id/history"
                  element={<KaiwaSessionHistoryPage />}
                />
                <Route path="/kaiwa/:id/practice" element={<KaiwaPracticePage />} />
                <Route path="/kaiwa/:id" element={<KaiwaDetailPage />} />
                <Route path="/practice/history" element={<ExamPaperHistoryPage />} />
                <Route
                  path="/practice/history/:attemptId/result"
                  element={<ExamPaperResultPage />}
                />
                <Route
                  path="/practice/history/:attemptId/review"
                  element={<ExamPaperReviewPage />}
                />
                <Route path="/practice" element={<ExamPaperListPage />} />
                <Route path="/practice/:slug/result" element={<ExamPaperResultPage />} />
                <Route path="/practice/:slug/review" element={<ExamPaperReviewPage />} />
                <Route path="/practice/:slug" element={<ExamPaperTakePage />} />
              </Route>
            </Route>
            <Route path="/welcome" element={<Navigate to="/" replace />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="analytics" element={<AdminSystemPage />} />
              <Route
                path="vocabulary/decks/:deckId"
                element={<VocabularyDeckEditorPage />}
              />
              <Route
                path="vocabulary/new"
                element={<Navigate to="/admin/vocabulary/decks/new" replace />}
              />
              <Route
                path="vocabulary/create"
                element={<Navigate to="/admin/vocabulary/decks/new" replace />}
              />
              <Route path="vocabulary" element={<AdminVocabularyHome />} />
              <Route
                path="kanji/decks/:deckId"
                element={<KanjiDeckEditorPage />}
              />
              <Route path="kanji" element={<AdminKanjiHome />} />
              <Route path="grammar/new" element={<AdminGrammarEditorPage />} />
              <Route path="grammar/:id/edit" element={<AdminGrammarEditorPage />} />
              <Route path="grammar" element={<AdminGrammarHome />} />
              <Route path="reading/new" element={<AdminReadingEditorPage />} />
              <Route path="reading/:id/edit" element={<AdminReadingEditorPage />} />
              <Route path="reading" element={<AdminReadingHome />} />
              <Route path="listening" element={<AdminListeningHome />} />
              <Route path="kaiwa/new" element={<AdminKaiwaEditorPage />} />
              <Route path="kaiwa/:id/edit" element={<AdminKaiwaEditorPage />} />
              <Route path="kaiwa" element={<AdminKaiwaHome />} />
              <Route path="exam-papers/:id/edit" element={<AdminExamPaperEditorPage />} />
              <Route path="exam-papers" element={<AdminExamPaperHome />} />
              <Route path="exam-structures/:id/edit" element={<AdminExamStructureEditPage />} />
              <Route path="exam-structures" element={<AdminExamStructureHome />} />
              <Route path="quotes" element={<AdminQuotesPage />} />
              <Route path="feedback" element={<AdminFeedbackPage />} />
              <Route path="prompts" element={<AdminPromptsPage />} />
              <Route path="badges" element={<BadgePage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
              <Route
                path="notifications"
                element={<AdminNotificationsDemoPage />}
              />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="*" element={<AdminStubContent />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
        </UserNotificationProvider>
      </SurveyCompletionProvider>
    </AuthProvider>
  );
}

export default App;
