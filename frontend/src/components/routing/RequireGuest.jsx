import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { needsEmailVerification } from "../../utils/authVerification.js";
import AuthRouteLoading from "./AuthRouteLoading.jsx";

/** Chỉ khi chưa đăng nhập (login / register). */
export default function RequireGuest() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthRouteLoading />;
  }
  if (user) {
    if (needsEmailVerification(user)) {
      return (
        <Navigate
          to="/register/thank-you"
          replace
          state={{ email: user.email || "" }}
        />
      );
    }
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
