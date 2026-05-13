import { Navigate } from "react-router-dom";
import { useSurveyCompletion } from "../../context/SurveyCompletionContext.jsx";
import SurveyPage from "../../pages/SurveyPage.jsx";
import AuthRouteLoading from "./AuthRouteLoading.jsx";

/** Đã đăng nhập: nếu đã khảo sát thì về app; không thì hiển thị khảo sát. */
export default function SurveyGate() {
  const { completed, ready, loading } = useSurveyCompletion();

  if (!ready || loading) {
    return <AuthRouteLoading />;
  }
  if (completed) {
    return <Navigate to="/" replace />;
  }
  return <SurveyPage />;
}
