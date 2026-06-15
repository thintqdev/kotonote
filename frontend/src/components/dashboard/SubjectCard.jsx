import { memo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DASHBOARD_PIN_IMG_SRC,
  SUBJECT_ROUTE_BY_ID,
} from "../../constants/dashboardNav.js";
import "./SubjectCard.css";

const tintClass = {
  cream: "subject-card--cream",
  yellow: "subject-card--yellow",
  pink: "subject-card--pink",
  blue: "subject-card--blue",
  green: "subject-card--green",
};

const SubjectCard = ({
  subjectId,
  label,
  countLabel,
  iconSrc,
  progress,
  tint,
  variant = "default",
  showPin = false,
  to: toProp,
}) => {
  const { t } = useTranslation();
  const pinVisible = showPin || variant === "binder";
  const to = toProp || SUBJECT_ROUTE_BY_ID[subjectId] || "/";

  return (
    <Link
      to={to}
      className={`subject-card-link ${tintClass[tint] || ""} ${
        variant === "binder" ? "subject-card-link--binder" : ""
      }`}
      data-subject={subjectId}
    >
    <article
      className={`subject-card ${tintClass[tint] || ""} ${
        variant === "binder" ? "subject-card--binder" : ""
      }`}
    >
      {pinVisible ? (
        <img
          src={DASHBOARD_PIN_IMG_SRC}
          alt=""
          className="subject-card-pin"
          width={48}
          height={48}
          decoding="async"
          aria-hidden={true}
        />
      ) : null}
      <div className="subject-card-icon" aria-hidden="true">
        <img
          className="subject-card-icon-img"
          src={iconSrc}
          alt=""
          width={56}
          height={56}
          decoding="async"
        />
      </div>
      <h3 className="subject-card-name">
        <span className="subject-card-name-text">{label}</span>
      </h3>
      <p className="subject-card-count">
        <span className="subject-card-count-text">{countLabel}</span>
      </p>
      <div className="subject-card-bar-wrap">
        <div
          className="subject-card-bar"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="subject-card-pct">
        {t("subjectCard.progress", { pct: progress })}
      </p>
      <span className="subject-card-cta">
        {t("subjectCard.cta")} <span aria-hidden="true">→</span>
      </span>
    </article>
    </Link>
  );
};

SubjectCard.propTypes = {
  subjectId: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  countLabel: PropTypes.string.isRequired,
  iconSrc: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  tint: PropTypes.oneOf(["cream", "yellow", "pink", "blue", "green"])
    .isRequired,
  variant: PropTypes.oneOf(["default", "binder"]),
  showPin: PropTypes.bool,
  to: PropTypes.string,
};

export default memo(SubjectCard);
