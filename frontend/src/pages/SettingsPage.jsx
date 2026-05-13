import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import "./AuthPage.css";
import "./Profile.css";
import "./DashboardHome.css";
import "./Settings.css";

const DAILY_GOAL_VALUES = ["15", "30", "45", "60"];

function SettingsToggle({ id, checked, onChange, disabled = false }) {
  return (
    <label className="settings-toggle" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="settings-toggle-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="settings-toggle-track" aria-hidden="true">
        <span className="settings-toggle-thumb" />
      </span>
    </label>
  );
}

SettingsToggle.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifStudy, setNotifStudy] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [dailyGoal, setDailyGoal] = useState("30");
  const [privacyAnalytics, setPrivacyAnalytics] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const handleSave = async (e) => {
    e.preventDefault();
    setSavedBanner(false);
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 650));
      setSavedBanner(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout
      userName={headerName}
      footerQuote={t("dashboard.quotes.footer")}
      streakDays={mockStreak.days}
      mainInnerClassName="profile-main settings-page"
    >
      <Breadcrumb
              items={[
                { label: t("breadcrumb.home"), to: "/", end: true },
                { label: t("breadcrumb.settings") },
              ]}
            />

            {savedBanner ? (
              <div className="settings-saved-banner" role="status">
                {t("settingsPage.savedShort")}
              </div>
            ) : null}

            <div className="settings-layout">
              <section className="settings-card profile-card settings-card--pinned">
                <span className="profile-card-tape" aria-hidden />
                <h1 className="settings-page-title profile-section-title">
                  {t("settingsPage.title")}
                </h1>
                <h2 className="settings-section-title profile-section-title profile-section-title--flush">
                  {t("settingsPage.sectionNotif")}
                </h2>
                <ul className="settings-rows">
                  <li className="settings-row">
                    <div className="settings-row-text">
                      <span className="settings-row-label">
                        {t("settingsPage.notifEmail")}
                      </span>
                      <span className="settings-row-desc">
                        {t("settingsPage.notifEmailDesc")}
                      </span>
                    </div>
                    <SettingsToggle
                      id="set-notif-email"
                      checked={notifEmail}
                      onChange={setNotifEmail}
                      disabled={saving}
                    />
                  </li>
                  <li className="settings-row">
                    <div className="settings-row-text">
                      <span className="settings-row-label">
                        {t("settingsPage.notifStudy")}
                      </span>
                      <span className="settings-row-desc">
                        {t("settingsPage.notifStudyDesc")}
                      </span>
                    </div>
                    <SettingsToggle
                      id="set-notif-study"
                      checked={notifStudy}
                      onChange={setNotifStudy}
                      disabled={saving}
                    />
                  </li>
                  <li className="settings-row settings-row--last">
                    <div className="settings-row-text">
                      <span className="settings-row-label">
                        {t("settingsPage.notifWeekly")}
                      </span>
                      <span className="settings-row-desc">
                        {t("settingsPage.notifWeeklyDesc")}
                      </span>
                    </div>
                    <SettingsToggle
                      id="set-notif-weekly"
                      checked={notifWeekly}
                      onChange={setNotifWeekly}
                      disabled={saving}
                    />
                  </li>
                </ul>
              </section>

              <section className="settings-card profile-card settings-card--taped">
                <span className="profile-card-tape" aria-hidden />
                <h2 className="settings-section-title profile-section-title profile-section-title--flush">
                  {t("settingsPage.sectionStudy")}
                </h2>
                <div className="settings-field-block">
                  <label
                    className="settings-select-label"
                    htmlFor="settings-daily-goal"
                  >
                    {t("settingsPage.dailyGoal")}
                  </label>
                  <select
                    id="settings-daily-goal"
                    className="settings-select sketch-input"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    disabled={saving}
                  >
                    {DAILY_GOAL_VALUES.map((v) => (
                      <option key={v} value={v}>
                        {t(`settingsPage.dailyOptions.${v}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="settings-card profile-card settings-card--taped">
                <span className="profile-card-tape" aria-hidden />
                <h2 className="settings-section-title profile-section-title profile-section-title--flush">
                  {t("settingsPage.sectionPrivacy")}
                </h2>
                <div className="settings-row settings-row--stack">
                  <div className="settings-row-text">
                    <span className="settings-row-label">
                      {t("settingsPage.privacyAnalytics")}
                    </span>
                    <span className="settings-row-desc">
                      {t("settingsPage.privacyDesc")}
                    </span>
                  </div>
                  <SettingsToggle
                    id="set-privacy"
                    checked={privacyAnalytics}
                    onChange={setPrivacyAnalytics}
                    disabled={saving}
                  />
                </div>
              </section>

              <section className="settings-card profile-card settings-card--account">
                <h2 className="settings-section-title profile-section-title profile-section-title--flush">
                  {t("settingsPage.sectionAccount")}
                </h2>
                <nav
                  className="settings-quick-links"
                  aria-label={t("settingsPage.sectionAccount")}
                >
                  <Link className="settings-quick-link" to="/profile">
                    {t("settingsPage.linkProfile")}
                  </Link>
                  <Link
                    className="settings-quick-link"
                    to="/change-password"
                  >
                    {t("settingsPage.linkPassword")}
                  </Link>
                </nav>
              </section>

              <form className="settings-save-form" onSubmit={handleSave}>
                <button
                  type="submit"
                  className="btn-primary btn-login settings-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="btn-loading">...</span>
                  ) : (
                    <span className="btn-primary-line1">
                      <span className="btn-primary-main">
                        {t("settingsPage.save")}
                      </span>
                      <span className="btn-arrow">→</span>
                    </span>
                  )}
                </button>
              </form>
            </div>
    </Layout>
  );
};

export default SettingsPage;
