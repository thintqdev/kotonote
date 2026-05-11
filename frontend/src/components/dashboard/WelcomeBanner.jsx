import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "./WelcomeBanner.css";

const WelcomeBanner = ({ userName }) => {
  const { t } = useTranslation();
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
        <p className="welcome-banner-quote">{t("welcome.subtitle")}</p>
      </div>
    </section>
  );
};

WelcomeBanner.propTypes = {
  userName: PropTypes.string.isRequired,
};

export default WelcomeBanner;
