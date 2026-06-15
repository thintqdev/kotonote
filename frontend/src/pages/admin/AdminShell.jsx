import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../layouts/AdminLayout.jsx";

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

/** Vỏ route /admin — xác thực phiên trong AdminLayout. */
export default function AdminShell() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export { AdminStubContent };
