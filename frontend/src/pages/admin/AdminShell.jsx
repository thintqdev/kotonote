import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import { getAdminToken } from "../../services/tokenStorage.js";

function AdminStubContent() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <div className="admin-stub-main">
      <p className="admin-stub-path" lang="en">
        {pathname}
      </p>
      <p className="admin-stub-hint">{t("adminLayout.stubHint")}</p>
    </div>
  );
}

/**
 * Vỏ route /admin — sidebar cố định, nội dung qua Outlet (các trang con sẽ thay thế stub).
 */
export default function AdminShell() {
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export { AdminStubContent };
