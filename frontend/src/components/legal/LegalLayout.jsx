import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth.jsx";
import LanguageSwitcher from "../common/LanguageSwitcher.jsx";
import "../../pages/LegalPage.css";

/** Vỏ tối giản cho Terms / Privacy — không dùng Layout app hay AuthLayout đăng nhập. */
export default function LegalLayout({ children }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const appName = import.meta.env.VITE_APP_NAME || "Kotonote";
  const homeTo = user ? "/" : "/login";

  return (
    <div className="legal-page">
      <header className="legal-page-header">
        <Link to={homeTo} className="legal-page-brand">
          <img
            className="legal-page-logo"
            src="/assets/logo.png"
            alt=""
            aria-hidden="true"
            decoding="async"
          />
          <span>{appName}</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="legal-page-main">{children}</main>

      <footer className="legal-page-footer">
        <p>{t("authLayout.copyright", { app: appName })}</p>
      </footer>
    </div>
  );
}

LegalLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
