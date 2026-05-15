import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import * as authService from "../services/authService.js";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import "./AuthPage.css";
import "./Profile.css";
import "./DashboardHome.css";
import "./ChangePassword.css";

const ChangePasswordPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const validate = () => {
    setFormError("");
    const next = {};
    if (!currentPassword.trim()) {
      next.current = t("changePasswordPage.errors.currentRequired");
    }
    if (!newPassword) {
      next.new = t("changePasswordPage.errors.newRequired");
    } else if (newPassword.length < 6) {
      next.new = t("changePasswordPage.errors.newShort");
    }
    if (!confirmPassword) {
      next.confirm = t("changePasswordPage.errors.confirmRequired");
    } else if (newPassword !== confirmPassword) {
      next.confirm = t("changePasswordPage.errors.confirmMismatch");
    }
    if (
      currentPassword &&
      newPassword &&
      currentPassword === newPassword
    ) {
      next.new = t("changePasswordPage.errors.sameAsCurrent");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSuccess(false);
    setFormError("");
    setIsSubmitting(true);
    try {
      await authService.changePassword({
        currentPassword: currentPassword.trim(),
        newPassword,
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err) {
      const code =
        err && typeof err === "object" && "messageCode" in err
          ? /** @type {{ messageCode?: string }} */ (err).messageCode
          : undefined;
      if (code === "MSG_108") {
        setErrors((o) => ({ ...o, current: t("message.MSG_108") }));
      } else if (code === "MSG_118") {
        setFormError(t("message.MSG_118"));
      } else {
        setFormError(
          err instanceof Error ? err.message : t("changePasswordPage.apiError"),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      mainInnerClassName="profile-main change-password-page"
    >
      <Breadcrumb
              items={[
                { label: t("breadcrumb.home"), to: "/", end: true },
                { label: t("breadcrumb.changePassword") },
              ]}
            />

            <section className="change-password-card profile-card">
              <span className="profile-card-tape" aria-hidden />
              <h1 className="change-password-title profile-section-title">
                {t("changePasswordPage.title")}
              </h1>

              {success ? (
                <div className="change-password-success" role="status">
                  <p className="change-password-success-text">
                    {t("changePasswordPage.successShort")}
                  </p>
                  <div className="change-password-success-actions">
                    <Link
                      to="/profile"
                      className="change-password-link-profile"
                    >
                      {t("changePasswordPage.backToProfile")}
                    </Link>
                    <button
                      type="button"
                      className="change-password-again"
                      onClick={() => setSuccess(false)}
                    >
                      {t("changePasswordPage.again")}
                    </button>
                  </div>
                </div>
              ) : (
              <form
                className="auth-form change-password-form"
                onSubmit={handleSubmit}
                noValidate
              >
                {formError ? (
                  <p className="change-password-form-error" role="alert">
                    {formError}
                  </p>
                ) : null}
                <div className="field-group">
                  <label className="field-label" htmlFor="cp-current">
                    <span className="auth-label-text">
                      {t("changePasswordPage.currentPassword")}
                    </span>
                  </label>
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      id="cp-current"
                      type={showCurrent ? "text" : "password"}
                      className={`sketch-input ${
                        errors.current ? "input-error" : ""
                      }`}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setFormError("");
                        if (errors.current) {
                          setErrors((o) => ({ ...o, current: undefined }));
                        }
                      }}
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      placeholder={t(
                        "changePasswordPage.placeholders.current",
                      )}
                    />
                    <button
                      type="button"
                      className="toggle-pw"
                      onClick={() => setShowCurrent((v) => !v)}
                      aria-label={t("login.showPassword")}
                    >
                      {showCurrent ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.current ? (
                    <span className="error-msg">{errors.current}</span>
                  ) : null}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="cp-new">
                    <span className="auth-label-text">
                      {t("changePasswordPage.newPassword")}
                    </span>
                  </label>
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      id="cp-new"
                      type={showNew ? "text" : "password"}
                      className={`sketch-input ${
                        errors.new ? "input-error" : ""
                      }`}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setFormError("");
                        if (errors.new) {
                          setErrors((o) => ({ ...o, new: undefined }));
                        }
                      }}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      placeholder={t("changePasswordPage.placeholders.new")}
                    />
                    <button
                      type="button"
                      className="toggle-pw"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={t("login.showPassword")}
                    >
                      {showNew ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.new ? (
                    <span className="error-msg">{errors.new}</span>
                  ) : null}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="cp-confirm">
                    <span className="auth-label-text">
                      {t("changePasswordPage.confirmPassword")}
                    </span>
                  </label>
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      id="cp-confirm"
                      type={showConfirm ? "text" : "password"}
                      className={`sketch-input ${
                        errors.confirm ? "input-error" : ""
                      }`}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setFormError("");
                        if (errors.confirm) {
                          setErrors((o) => ({ ...o, confirm: undefined }));
                        }
                      }}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      placeholder={t(
                        "changePasswordPage.placeholders.confirm",
                      )}
                    />
                    <button
                      type="button"
                      className="toggle-pw"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={t("login.showPassword")}
                    >
                      {showConfirm ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.confirm ? (
                    <span className="error-msg">{errors.confirm}</span>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-login change-password-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="btn-loading">...</span>
                  ) : (
                    <span className="btn-primary-line1">
                      <span className="btn-primary-main">
                        {t("changePasswordPage.submit")}
                      </span>
                      <span className="btn-arrow">→</span>
                    </span>
                  )}
                </button>
              </form>
              )}

              {!success ? (
                <Link
                  to="/profile"
                  className="change-password-cancel-link"
                >
                  {t("changePasswordPage.backToProfile")}
                </Link>
              ) : null}
            </section>
    </Layout>
  );
};

export default ChangePasswordPage;
