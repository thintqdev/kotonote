import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./hooks/useAuth.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SurveyPage from "./pages/SurveyPage.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import Profile from "./pages/Profile.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
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
import NotFoundPage from "./pages/NotFoundPage.jsx";
import AdminShell, {
  AdminStubContent,
} from "./pages/admin/AdminShell.jsx";
import AdminVocabularyHome from "./pages/admin/AdminVocabularyHome.jsx";
import AdminKanjiHome from "./pages/admin/AdminKanjiHome.jsx";
import VocabularyDeckEditorPage from "./pages/admin/VocabularyDeckEditorPage.jsx";
import KanjiDeckEditorPage from "./pages/admin/KanjiDeckEditorPage.jsx";
import AdminQuotesPage from "./pages/admin/AdminQuotesPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/welcome" element={<Navigate to="/" replace />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="/" element={<DashboardHome />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/grammar" element={<GrammarListPage />} />
          <Route path="/grammar/:slug" element={<GrammarDetailPage />} />
          <Route path="/alphabet" element={<AlphabetPage />} />
          <Route path="/vocabulary/browse" element={<VocabularyListPage />} />
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
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<AdminStubContent />} />
            <Route
              path="vocabulary/decks/:deckId"
              element={<VocabularyDeckEditorPage />}
            />
            <Route path="vocabulary" element={<AdminVocabularyHome />} />
            <Route
              path="kanji/decks/:deckId"
              element={<KanjiDeckEditorPage />}
            />
            <Route path="kanji" element={<AdminKanjiHome />} />
            <Route path="quotes" element={<AdminQuotesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="*" element={<AdminStubContent />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
