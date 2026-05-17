import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { needsEmailVerification } from "../../utils/authVerification.js";
import AuthRouteLoading from "./AuthRouteLoading.jsx";

/** Chỉ user đã đăng nhập (JWT app). */
export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthRouteLoading />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (needsEmailVerification(user)) {
    return (
      <Navigate
        to="/register/thank-you"
        replace
        state={{ email: user.email || "" }}
      />
    );
  }
  return <Outlet />;
}
