import { memo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useRandomQuoteLine } from "../../hooks/useRandomQuoteLine.js";
import "./WelcomeBanner.css";

const WelcomeBanner = ({ userName }) => {
  const { t } = useTranslation();
  const subtitleQuote = useRandomQuoteLine({
    fallbackI18nKey: "welcome.subtitle",
  });
  return (
    <section className="welcome-banner" aria-labelledby="welcome-heading">
      <div className="welcome-banner-deco" aria-hidden="true">
        <img
          className="welcome-banner-deco-img"
          src="/assets/decorates/leaf.png"
          alt=""
          width={100}
          height={100}
          decoding="async"
        />
      </div>
      <div className="welcome-banner-text">
        <h1 id="welcome-heading" className="welcome-banner-title">
          {t("welcome.title", { name: userName })}
        </h1>
        <p className="welcome-banner-quote">{subtitleQuote}</p>
      </div>
    </section>
  );
};

WelcomeBanner.propTypes = {
  userName: PropTypes.string.isRequired,
};

export default memo(WelcomeBanner);
