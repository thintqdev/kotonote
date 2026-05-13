import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useSurveyCompletion } from "../../context/SurveyCompletionContext.jsx";
import AuthRouteLoading from "./AuthRouteLoading.jsx";

/**
 * Đã đăng nhập và đã gửi khảo sát — các trang app chính.
 * Chưa khảo sát → luôn về /survey.
 */
export default function RequireAuthAndSurvey() {
  const { user, loading: authLoading } = useAuth();
  const { completed, ready, loading: surveyLoading } = useSurveyCompletion();
  const location = useLocation();

  if (authLoading) {
    return <AuthRouteLoading />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!ready || surveyLoading) {
    return <AuthRouteLoading />;
  }
  if (completed === false) {
    return <Navigate to="/survey" replace />;
  }
  return <Outlet />;
}
