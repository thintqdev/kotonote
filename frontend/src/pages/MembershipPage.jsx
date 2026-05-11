import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Sidebar, Header, Footer, Breadcrumb } from "../components/common";
import {
  mockStreak,
  mockNotifications,
} from "../data/dashboardHomeMock.js";
import "./AuthPage.css";
import "./Profile.css";
import "./DashboardHome.css";
import "./Membership.css";

const FREE_BULLET_KEYS = ["freeB1", "freeB2", "freeB3"];
const PRO_BULLET_KEYS = ["proB1", "proB2", "proB3", "proB4"];

const MembershipPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  return (
    <Layout>
      <div className="dash-page">
        <Sidebar streakDays={mockStreak.days} />
        <div className="dash-main">
          <Header
            userName={headerName}
            notificationCount={mockNotifications}
          />
          <div className="dash-main-inner profile-main membership-page">
            <Breadcrumb
              items={[
                { label: t("breadcrumb.home"), to: "/", end: true },
                { label: t("breadcrumb.membership") },
              ]}
            />

            <section className="membership-intro profile-card profile-card--hero">
              <span className="profile-card-tape" aria-hidden />
              <h1 className="membership-title profile-section-title">
                {t("membershipPage.title")}
              </h1>
              <p className="membership-subtitle">{t("membershipPage.subtitle")}</p>
            </section>

            <div className="membership-tiers">
              <article className="membership-tier profile-card membership-tier--current">
                <div className="membership-tier-head">
                  <span className="membership-tier-badge">
                    {t("membershipPage.badgeCurrent")}
                  </span>
                  <h2 className="membership-tier-name">{t("membershipPage.planFree")}</h2>
                  <p className="membership-tier-price">
                    {t("membershipPage.priceFree")}
                  </p>
                </div>
                <ul className="membership-tier-list">
                  {FREE_BULLET_KEYS.map((key) => (
                    <li key={key} className="membership-tier-item">
                      {t(`membershipPage.${key}`)}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="membership-tier profile-card membership-tier--pro">
                <div className="membership-tier-head">
                  <h2 className="membership-tier-name membership-tier-name--pro">
                    {t("membershipPage.planPro")}
                  </h2>
                  <p className="membership-tier-price">
                    {t("membershipPage.pricePro")}
                  </p>
                </div>
                <ul className="membership-tier-list">
                  {PRO_BULLET_KEYS.map((key) => (
                    <li key={key} className="membership-tier-item">
                      {t(`membershipPage.${key}`)}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="btn-primary btn-login membership-tier-cta"
                >
                  <span className="btn-primary-line1">
                    <span className="btn-primary-main">
                      {t("membershipPage.ctaPro")}
                    </span>
                    <span className="btn-arrow">→</span>
                  </span>
                </button>
              </article>
            </div>

            <Footer quote={t("dashboard.quotes.footer")} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MembershipPage;
