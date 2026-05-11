import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak, mockNotifications } from "../data/dashboardHomeMock.js";
import "./DashboardHome.css";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pathname } = useLocation();

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  return (
    <Layout
      userName={headerName}
      notificationCount={mockNotifications}
      footerQuote={t("dashboard.quotes.footer")}
      streakDays={mockStreak.days}
      pageClassName="not-found-dash"
    >
      <article className="not-found-sheet" aria-labelledby="not-found-title">
        <p className="not-found-code" aria-hidden>
          404
        </p>
        <h1 id="not-found-title" className="not-found-title">
          {t("notFoundPage.title")}
        </h1>
        <p className="not-found-desc">{t("notFoundPage.description")}</p>
        <p className="not-found-path" lang="en">
          <span className="not-found-path-label">
            {t("notFoundPage.pathLabel")}
          </span>
          <code className="not-found-path-value">{pathname}</code>
        </p>
        <div className="not-found-actions">
          <Link className="not-found-btn" to="/">
            {t("notFoundPage.backHome")}
          </Link>
        </div>
      </article>
    </Layout>
  );
}
