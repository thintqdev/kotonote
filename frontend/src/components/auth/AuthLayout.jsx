import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../common/LanguageSwitcher.jsx";
import { useRandomQuoteLine } from "../../hooks/useRandomQuoteLine.js";
import "../../pages/AuthPage.css";

const AuthLayoutBody = ({ children, formLayout = "narrow" }) => {
  const isSurvey = formLayout === "survey";
  const { t } = useTranslation();
  const appName = import.meta.env.VITE_APP_NAME;
  const authFooterQuote = useRandomQuoteLine({
    fallbackI18nKey: "authLayout.footerQuote",
  });

  return (
    <div className="auth-page">
      <div className="auth-lang-floating">
        <LanguageSwitcher />
      </div>
      <div className="auth-bg" />

      <div className="auth-header">
        <div className="header-tape header-tape--left">
          <div className="sticky-note">
            <span className="sticky-line">{t("authLayout.sticky1")}</span>
            <span className="sticky-line">{t("authLayout.sticky2")}</span>
          </div>
        </div>

        <div className="header-center">
          <div className="header-banner">
            <span className="banner-main">{t("authLayout.banner")}</span>
            <span className="banner-star">☆</span>
          </div>

          <h1 className="auth-brand">
            <div className="auth-logo-crop">
              <img
                className="auth-logo"
                src="/assets/logo.png"
                alt=""
                aria-hidden="true"
                decoding="async"
              />
            </div>
            <span className="visually-hidden">{import.meta.env.VITE_APP_NAME}</span>
          </h1>
        </div>

        <div className="header-tape header-tape--right">
          <div className="header-right-deco">
            <p className="deco-text">{t("authLayout.deco1")}</p>
            <p className="deco-text">{t("authLayout.deco2")}</p>
          </div>
        </div>
      </div>

      <div
        className={`auth-forms-wrapper auth-forms-wrapper--single${
          isSurvey ? " auth-forms-wrapper--survey" : ""
        }`}
      >
        <div
          className={`auth-forms-container auth-forms-container--single${
            isSurvey ? " auth-forms-container--survey" : ""
          }`}
        >
          {children}
        </div>
      </div>

      <div className="auth-footer">
        <div className="footer-quote">
          <p className="footer-quote-text">
            {authFooterQuote}
          </p>
        </div>
        <p className="footer-copy">
          {t("authLayout.copyright", { app: appName || "Kotonote" })}
        </p>
      </div>
    </div>
  );
};

const AuthLayout = ({ children, formLayout = "narrow" }) => (
  <AuthLayoutBody formLayout={formLayout}>{children}</AuthLayoutBody>
);

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  formLayout: PropTypes.oneOf(["narrow", "survey"]),
};

export default AuthLayout;
