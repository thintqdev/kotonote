import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

/** Đổi ngôn ngữ UI (vi / ja) — một ngôn tại một thời điểm */
const LanguageSwitcher = ({ className = "" }) => {
  const { i18n, t } = useTranslation();

  const setLang = (code) => {
    if (code !== i18n.language) {
      void i18n.changeLanguage(code);
    }
  };

  return (
    <div
      className={`lang-switch${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={t("common.language")}
    >
      <button
        type="button"
        className={`lang-switch-btn${
          i18n.language === "vi" ? " lang-switch-btn--active" : ""
        }`}
        onClick={() => setLang("vi")}
        lang="vi"
      >
        VI
      </button>
      <button
        type="button"
        className={`lang-switch-btn${
          i18n.language === "ja" ? " lang-switch-btn--active" : ""
        }`}
        onClick={() => setLang("ja")}
        lang="ja"
      >
        日本語
      </button>
    </div>
  );
};

LanguageSwitcher.propTypes = {
  className: PropTypes.string,
};

export default LanguageSwitcher;
