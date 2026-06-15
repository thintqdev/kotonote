import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  getMySettings,
  updateMySettings,
} from "../services/settingsService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import {
  REMINDER_TIME_OPTIONS,
  snapReminderTimeToSlot,
} from "../constants/reminderTime.js";
import {
  DAILY_SUBJECT_GOAL_IDS,
  DAILY_SUBJECT_GOAL_LIMITS,
  normalizeDailySubjectGoals,
} from "../constants/dailySubjectGoals.js";
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

function buildSettingsPayload(state) {
  return {
    notifications: {
      emailDigest: state.notifEmail,
      dailyStudyReminder: state.notifStudy,
      streakCheckInReminder: state.notifStreak,
      dailyGoalNudge: state.notifGoalNudge,
      examCountdownReminder: state.notifExam,
      weeklyReport: state.notifWeekly,
    },
    study: {
      dailyGoalMinutes: Number(state.dailyGoal),
      dailySubjectGoals: state.dailySubjectGoals,
      reminderEnabled: state.reminderEnabled,
      reminderTime: state.reminderTime,
      reminderWeekends: state.reminderWeekends,
    },
    privacy: {
      analyticsOptIn: state.privacyAnalytics,
    },
  };
}

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifStudy, setNotifStudy] = useState(true);
  const [notifStreak, setNotifStreak] = useState(true);
  const [notifGoalNudge, setNotifGoalNudge] = useState(true);
  const [notifExam, setNotifExam] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [dailyGoal, setDailyGoal] = useState("30");
  const [dailySubjectGoals, setDailySubjectGoals] = useState(() =>
    normalizeDailySubjectGoals(),
  );
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [reminderWeekends, setReminderWeekends] = useState(true);
  const [privacyAnalytics, setPrivacyAnalytics] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  const applySettings = useCallback((settings) => {
    if (!settings) return;
    setNotifEmail(settings.notifications?.emailDigest ?? true);
    setNotifStudy(settings.notifications?.dailyStudyReminder ?? true);
    setNotifStreak(settings.notifications?.streakCheckInReminder ?? true);
    setNotifGoalNudge(settings.notifications?.dailyGoalNudge ?? true);
    setNotifExam(settings.notifications?.examCountdownReminder ?? true);
    setNotifWeekly(settings.notifications?.weeklyReport ?? false);
    setDailyGoal(String(settings.study?.dailyGoalMinutes ?? 30));
    setDailySubjectGoals(
      normalizeDailySubjectGoals(settings.study?.dailySubjectGoals),
    );
    setReminderEnabled(settings.study?.reminderEnabled ?? true);
    setReminderTime(
      snapReminderTimeToSlot(settings.study?.reminderTime ?? "20:00"),
    );
    setReminderWeekends(settings.study?.reminderWeekends ?? true);
    setPrivacyAnalytics(settings.privacy?.analyticsOptIn ?? false);
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const settings = await getMySettings();
        if (!cancelled) applySettings(settings);
      } catch (err) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(err, t));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, t, applySettings]);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const handleSave = async (e) => {
    e.preventDefault();
    setSavedBanner(false);
    setSaving(true);
    try {
      const payload = buildSettingsPayload({
        notifEmail,
        notifStudy,
        notifWeekly,
        dailyGoal,
        dailySubjectGoals,
        reminderEnabled,
        reminderTime,
        reminderWeekends,
        privacyAnalytics,
      });
      const updated = await updateMySettings(payload);
      applySettings(updated);
      setSavedBanner(true);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };

  const formDisabled = loading || saving;

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      mainInnerClassName="settings-page"
    >
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.settings") },
        ]}
      />

      {loadError ? (
        <p className="vocab-empty" role="alert">
          {loadError}
        </p>
      ) : null}

      {savedBanner ? (
        <div className="settings-saved-banner" role="status">
          {t("settingsPage.savedShort")}
        </div>
      ) : null}

      {loading ? (
        <p className="vocab-empty">{t("common.loading")}</p>
      ) : (
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
                  disabled={formDisabled}
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
                  disabled={formDisabled}
                />
              </li>
              <li className="settings-row">
                <div className="settings-row-text">
                  <span className="settings-row-label">
                    {t("settingsPage.notifStreak")}
                  </span>
                  <span className="settings-row-desc">
                    {t("settingsPage.notifStreakDesc")}
                  </span>
                </div>
                <SettingsToggle
                  id="set-notif-streak"
                  checked={notifStreak}
                  onChange={setNotifStreak}
                  disabled={formDisabled || !notifStudy}
                />
              </li>
              <li className="settings-row">
                <div className="settings-row-text">
                  <span className="settings-row-label">
                    {t("settingsPage.notifGoalNudge")}
                  </span>
                  <span className="settings-row-desc">
                    {t("settingsPage.notifGoalNudgeDesc")}
                  </span>
                </div>
                <SettingsToggle
                  id="set-notif-goal"
                  checked={notifGoalNudge}
                  onChange={setNotifGoalNudge}
                  disabled={formDisabled || !notifStudy}
                />
              </li>
              <li className="settings-row">
                <div className="settings-row-text">
                  <span className="settings-row-label">
                    {t("settingsPage.notifExam")}
                  </span>
                  <span className="settings-row-desc">
                    {t("settingsPage.notifExamDesc")}
                  </span>
                </div>
                <SettingsToggle
                  id="set-notif-exam"
                  checked={notifExam}
                  onChange={setNotifExam}
                  disabled={formDisabled || !notifStudy}
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
                  disabled={formDisabled}
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
                disabled={formDisabled}
              >
                {DAILY_GOAL_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {t(`settingsPage.dailyOptions.${v}`)}
                  </option>
                ))}
              </select>
            </div>

            <h3 className="settings-subsection-title">
              {t("settingsPage.sectionDailyProgress")}
            </h3>
            <p className="settings-daily-progress-desc">
              {t("settingsPage.dailyProgressDesc")}
            </p>
            <div className="settings-daily-goals-grid">
              {DAILY_SUBJECT_GOAL_IDS.map((subjectId) => {
                const { min, max } = DAILY_SUBJECT_GOAL_LIMITS[subjectId];
                return (
                  <div key={subjectId} className="settings-field-block">
                    <label
                      className="settings-select-label"
                      htmlFor={`settings-daily-goal-${subjectId}`}
                    >
                      {t(`subjects.${subjectId}.label`)}
                    </label>
                    <input
                      id={`settings-daily-goal-${subjectId}`}
                      type="number"
                      className="settings-number-input sketch-input"
                      min={min}
                      max={max}
                      step={1}
                      value={dailySubjectGoals[subjectId]}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setDailySubjectGoals((prev) =>
                          normalizeDailySubjectGoals({
                            ...prev,
                            [subjectId]: Number.isFinite(next)
                              ? next
                              : prev[subjectId],
                          }),
                        );
                      }}
                      disabled={formDisabled}
                    />
                    <span className="settings-daily-goal-unit">
                      {t(`settingsPage.dailyGoalUnits.${subjectId}`)}
                    </span>
                  </div>
                );
              })}
            </div>

            <h3 className="settings-subsection-title">
              {t("settingsPage.sectionReminder")}
            </h3>
            <ul className="settings-rows">
              <li className="settings-row">
                <div className="settings-row-text">
                  <span className="settings-row-label">
                    {t("settingsPage.reminderEnabled")}
                  </span>
                  <span className="settings-row-desc">
                    {t("settingsPage.reminderEnabledDesc")}
                  </span>
                </div>
                <SettingsToggle
                  id="set-reminder-enabled"
                  checked={reminderEnabled}
                  onChange={setReminderEnabled}
                  disabled={formDisabled}
                />
              </li>
              {reminderEnabled ? (
                <>
                  <li className="settings-reminder-time">
                    <label
                      className="settings-select-label"
                      htmlFor="settings-reminder-time"
                    >
                      {t("settingsPage.reminderTime")}
                    </label>
                    <p className="settings-reminder-time-hint">
                      {t("settingsPage.reminderTimeDesc")}
                    </p>
                    <select
                      id="settings-reminder-time"
                      className="settings-select sketch-input"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      disabled={formDisabled}
                    >
                      {REMINDER_TIME_OPTIONS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </li>
                  <li className="settings-row settings-row--last">
                    <div className="settings-row-text">
                      <span className="settings-row-label">
                        {t("settingsPage.reminderWeekends")}
                      </span>
                      <span className="settings-row-desc">
                        {t("settingsPage.reminderWeekendsDesc")}
                      </span>
                    </div>
                    <SettingsToggle
                      id="set-reminder-weekends"
                      checked={reminderWeekends}
                      onChange={setReminderWeekends}
                      disabled={formDisabled}
                    />
                  </li>
                </>
              ) : null}
            </ul>
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
                disabled={formDisabled}
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
              <Link className="settings-quick-link" to="/change-password">
                {t("settingsPage.linkPassword")}
              </Link>
              <Link className="settings-quick-link" to="/feedback">
                {t("settingsPage.linkFeedback")}
              </Link>
            </nav>
          </section>

          <form className="settings-save-form" onSubmit={handleSave}>
            <button
              type="submit"
              className="btn-primary btn-login settings-save-btn"
              disabled={formDisabled}
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
      )}
    </Layout>
  );
};

export default SettingsPage;
