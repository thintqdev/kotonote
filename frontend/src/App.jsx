import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SurveyPage from './pages/SurveyPage.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import Profile from './pages/Profile.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import MembershipPage from './pages/MembershipPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import GrammarListPage from './pages/GrammarListPage.jsx';
import GrammarDetailPage from './pages/GrammarDetailPage.jsx';
import VocabularyListPage from './pages/VocabularyListPage.jsx';
import VocabularyDetailPage from './pages/VocabularyDetailPage.jsx';
import VocabularyStudyPage from './pages/VocabularyStudyPage.jsx';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
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
          <Route path="/vocabulary/browse" element={<VocabularyListPage />} />
          <Route path="/vocabulary/:id" element={<VocabularyDetailPage />} />
          <Route path="/vocabulary" element={<VocabularyStudyPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
