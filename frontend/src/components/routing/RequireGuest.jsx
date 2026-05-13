import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import AuthRouteLoading from "./AuthRouteLoading.jsx";

/** Chỉ khi chưa đăng nhập (login / register). */
export default function RequireGuest() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthRouteLoading />;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
