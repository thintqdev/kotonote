import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "./GoalCard.css";

const GoalCard = ({
  examShort,
  levelBadge,
  examDateText,
  dayDelta = null,
}) => {
  const { t } = useTranslation();

  let artLine = null;
  if (dayDelta !== null) {
    const artClass =
      dayDelta < 0
        ? "goal-card-art-line goal-card-art-line--past"
        : "goal-card-art-line";
    let artText;
    if (dayDelta > 0) {
      artText = t("goal.artDaysRemaining", { count: dayDelta });
    } else if (dayDelta === 0) {
      artText = t("goal.artExamToday");
    } else {
      artText = t("goal.artDaysPast", { count: -dayDelta });
    }
    artLine = (
      <p className={artClass} aria-live="polite">
        <span className="goal-card-art-line-label">
          <span className="goal-card-art-line-text">{artText}</span>
        </span>
      </p>
    );
  }

  return (
    <aside className="goal-card">
      <div className="goal-card-head">
        <h2 className="goal-card-title">
          <span className="goal-card-title-line">
            {t("goal.title", { exam: examShort })}
          </span>
        </h2>
        <span className="goal-card-badge">{levelBadge}</span>
      </div>
      {artLine}
      <p className="goal-card-row">
        <span className="goal-card-label">{t("goal.examDate")}</span>{" "}
        <span className="goal-card-value">{examDateText}</span>
      </p>
      {dayDelta === null ? (
        <p className="goal-card-hint">{t("goal.countdownHint")}</p>
      ) : null}
    </aside>
  );
};

GoalCard.propTypes = {
  examShort: PropTypes.string.isRequired,
  levelBadge: PropTypes.string.isRequired,
  examDateText: PropTypes.string.isRequired,
  dayDelta: PropTypes.number,
};

export default GoalCard;
