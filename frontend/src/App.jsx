import { Suspense } from "react";
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
import RouteFallback from "./components/routing/RouteFallback.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import RegisterThankYouPage from "./pages/RegisterThankYouPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import { TermsPage, PrivacyPage } from "./pages/LegalDocumentPage.jsx";
import PageViewTracker from "./components/analytics/PageViewTracker.jsx";
import * as Pages from "./routes/lazyPages.js";
import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <SurveyCompletionProvider>
          <Router>
          <UserNotificationProvider>
          <PageViewTracker />
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
          <Suspense fallback={<RouteFallback />}>
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
                <Route path="/profile" element={<Pages.Profile />} />
                <Route path="/change-password" element={<Pages.ChangePasswordPage />} />
                <Route path="/settings" element={<Pages.SettingsPage />} />
                <Route path="/feedback" element={<Pages.FeedbackPage />} />
                <Route path="/membership" element={<Pages.MembershipPage />} />
                <Route
                  path="/membership/checkout"
                  element={<Pages.MembershipCheckoutPage />}
                />
                <Route
                  path="/membership/checkout/return"
                  element={<Pages.MembershipCheckoutReturnPage />}
                />
                <Route
                  path="/membership/history"
                  element={<Pages.MembershipPaymentHistoryPage />}
                />
                <Route
                  path="/membership/receipt/:checkoutId"
                  element={<Pages.MembershipReceiptPage />}
                />
                <Route path="/notifications" element={<Pages.NotificationsPage />} />
                <Route path="/grammar" element={<Pages.GrammarListPage />} />
                <Route
                  path="/grammar/practice"
                  element={<Pages.GrammarPracticePage />}
                />
                <Route path="/grammar/:slug" element={<Pages.GrammarDetailPage />} />
                <Route path="/alphabet" element={<Pages.AlphabetPage />} />
                <Route
                  path="/vocabulary/browse"
                  element={<Pages.VocabularyListPage />}
                />
                <Route
                  path="/vocabulary/mine"
                  element={<Pages.UserVocabularyMyDecksPage />}
                />
                <Route
                  path="/vocabulary/mine/:deckId/edit"
                  element={<Pages.UserVocabularyDeckEditorPage />}
                />
                <Route
                  path="/vocabulary/lesson/:lessonNo"
                  element={<Pages.VocabularyPage />}
                />
                <Route path="/vocabulary/:id" element={<Pages.VocabularyDetailPage />} />
                <Route path="/vocabulary" element={<Pages.VocabularyIndexRedirect />} />
                <Route path="/kanji/browse" element={<Pages.KanjiListPage />} />
                <Route path="/kanji/mine" element={<Pages.UserKanjiMyDecksPage />} />
                <Route
                  path="/kanji/mine/:deckId/edit"
                  element={<Pages.UserKanjiDeckEditorPage />}
                />
                <Route path="/kanji/lesson/:lessonNo" element={<Pages.KanjiPage />} />
                <Route path="/kanji" element={<Pages.KanjiIndexRedirect />} />
                <Route path="/reading" element={<Pages.ReadingListPage />} />
                <Route path="/reading/:id" element={<Pages.ReadingArticlePage />} />
                <Route path="/notebook" element={<Pages.NotebookPage />} />
                <Route path="/journal" element={<Pages.JournalPage />} />
                <Route path="/leaderboard" element={<Pages.LeaderboardPage />} />
                <Route path="/arena" element={<Pages.ArenaPage />} />
                <Route path="/listening" element={<Pages.ListeningPage />} />
                <Route path="/listening/:id" element={<Pages.ListeningExercisePage />} />
                <Route path="/kaiwa" element={<Pages.KaiwaListPage />} />
                <Route
                  path="/kaiwa/sessions/:sessionId"
                  element={<Pages.KaiwaSessionViewPage />}
                />
                <Route
                  path="/kaiwa/:id/history"
                  element={<Pages.KaiwaSessionHistoryPage />}
                />
                <Route path="/kaiwa/:id/practice" element={<Pages.KaiwaPracticePage />} />
                <Route path="/kaiwa/:id" element={<Pages.KaiwaDetailPage />} />
                <Route path="/practice/history" element={<Pages.ExamPaperHistoryPage />} />
                <Route
                  path="/practice/history/:attemptId/result"
                  element={<Pages.ExamPaperResultPage />}
                />
                <Route
                  path="/practice/history/:attemptId/review"
                  element={<Pages.ExamPaperReviewPage />}
                />
                <Route path="/practice" element={<Pages.ExamPaperListPage />} />
                <Route path="/practice/:slug/result" element={<Pages.ExamPaperResultPage />} />
                <Route path="/practice/:slug/review" element={<Pages.ExamPaperReviewPage />} />
                <Route path="/practice/:slug" element={<Pages.ExamPaperTakePage />} />
              </Route>
            </Route>
            <Route path="/welcome" element={<Navigate to="/" replace />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<Pages.AdminShell />}>
              <Route index element={<Pages.AdminOverviewPage />} />
              <Route path="analytics" element={<Pages.AdminSystemPage />} />
              <Route
                path="vocabulary/decks/:deckId"
                element={<Pages.VocabularyDeckEditorPage />}
              />
              <Route
                path="vocabulary/new"
                element={<Navigate to="/admin/vocabulary/decks/new" replace />}
              />
              <Route
                path="vocabulary/create"
                element={<Navigate to="/admin/vocabulary/decks/new" replace />}
              />
              <Route path="vocabulary" element={<Pages.AdminVocabularyHome />} />
              <Route
                path="kanji/decks/:deckId"
                element={<Pages.KanjiDeckEditorPage />}
              />
              <Route path="kanji" element={<Pages.AdminKanjiHome />} />
              <Route path="grammar/new" element={<Pages.AdminGrammarEditorPage />} />
              <Route path="grammar/practice" element={<Pages.AdminGrammarPracticePage />} />
              <Route path="grammar/:id/edit" element={<Pages.AdminGrammarEditorPage />} />
              <Route path="grammar" element={<Pages.AdminGrammarHome />} />
              <Route path="reading/new" element={<Pages.AdminReadingEditorPage />} />
              <Route path="reading/:id/edit" element={<Pages.AdminReadingEditorPage />} />
              <Route path="reading" element={<Pages.AdminReadingHome />} />
              <Route path="listening" element={<Pages.AdminListeningHome />} />
              <Route path="kaiwa/new" element={<Pages.AdminKaiwaEditorPage />} />
              <Route path="kaiwa/:id/edit" element={<Pages.AdminKaiwaEditorPage />} />
              <Route path="kaiwa" element={<Pages.AdminKaiwaHome />} />
              <Route path="exam-papers/:id/edit" element={<Pages.AdminExamPaperEditorPage />} />
              <Route path="exam-papers" element={<Pages.AdminExamPaperHome />} />
              <Route path="exam-structures/:id/edit" element={<Pages.AdminExamStructureEditPage />} />
              <Route path="exam-structures" element={<Pages.AdminExamStructureHome />} />
              <Route path="quotes" element={<Pages.AdminQuotesPage />} />
              <Route path="feedback" element={<Pages.AdminFeedbackPage />} />
              <Route path="prompts" element={<Pages.AdminPromptsPage />} />
              <Route path="badges" element={<Pages.BadgePage />} />
              <Route path="users" element={<Pages.AdminUsersPage />} />
              <Route path="subscriptions" element={<Pages.AdminSubscriptionsPage />} />
              <Route
                path="notifications"
                element={<Pages.AdminNotificationsDemoPage />}
              />
              <Route path="settings" element={<Pages.AdminSettingsPage />} />
              <Route path="arena" element={<Pages.AdminArenaPage />} />
              <Route path="*" element={<Pages.AdminStubContent />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
          </UserNotificationProvider>
        </Router>
      </SurveyCompletionProvider>
    </AuthProvider>
  );
}

export default App;
