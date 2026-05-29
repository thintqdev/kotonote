import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NAV_MENU_ICON_BY_ID } from "../../constants/dashboardNav.js";
import "./ContinueLearningCard.css";

function ProgressRing({ percent }) {
  const p = Math.min(100, Math.max(0, Number(percent) || 0));
  return (
    <div
      className="continue-ring"
      style={{ "--continue-pct": String(p) }}
      role="img"
      aria-label={`${p}%`}
    >
      <span className="continue-ring-pct">{p}%</span>
    </div>
  );
}

ProgressRing.propTypes = {
  percent: PropTypes.number.isRequired,
};

function detailLine(t, item) {
  const meta = item.meta || {};
  if (item.subjectId === "reading" || item.subjectId === "listening") {
    const answered = meta.answered ?? 0;
    const total = meta.totalQuestions ?? 0;
    if (total > 0) {
      return t("continueLearning.detailQuestions", { answered, total });
    }
  }
  if (item.subjectId === "vocab" || item.subjectId === "kanji") {
    const stage = meta.growthStage ?? 0;
    const max = meta.growthMax ?? 3;
    if (stage > 0 && max > 0) {
      return t("continueLearning.detailGrowth", { stage, max });
    }
  }
  if (item.subjectId === "kaiwa" && meta.turnCount > 0) {
    return t("continueLearning.detailKaiwa", { count: meta.turnCount });
  }
  return null;
}

export default function ContinueLearningCard({
  continueData,
  loading = false,
  compact = false,
}) {
  const { t } = useTranslation();
  const primary = continueData?.primary;
  const items = continueData?.items ?? [];
  const others = primary
    ? items.filter(
        (it) =>
          it.path !== primary.path ||
          it.subjectId !== primary.subjectId,
      )
    : items;

  if (loading && !primary) {
    return (
      <section className="continue-card continue-card--loading" aria-live="polite">
        <p className="continue-card-loading">{t("common.loading")}</p>
      </section>
    );
  }

  if (!primary) {
    return null;
  }

  const subjectLabel = t(`subjects.${primary.subjectId}.label`);
  const iconSrc =
    NAV_MENU_ICON_BY_ID[primary.subjectId] || NAV_MENU_ICON_BY_ID.vocab;
  const detail = detailLine(t, primary);
  const kindLabel =
    primary.kind === "suggested"
      ? t("continueLearning.kindSuggested")
      : t("continueLearning.kindInProgress");

  return (
    <section
      className={`continue-card${compact ? " continue-card--compact" : ""}`}
      aria-labelledby="continue-card-title"
    >
      <div className="continue-card-head">
        <h2 id="continue-card-title" className="continue-card-title">
          {t("continueLearning.title")}
        </h2>
        <span className="continue-card-kind">{kindLabel}</span>
      </div>

      <Link className="continue-card-primary" to={primary.path}>
        <img
          className="continue-card-icon"
          src={iconSrc}
          alt=""
          width={40}
          height={40}
          loading="lazy"
        />
        <div className="continue-card-main">
          <span className="continue-card-subject">{subjectLabel}</span>
          <span className="continue-card-lesson">{primary.title}</span>
          {primary.subtitle ? (
            <span className="continue-card-meta">{primary.subtitle}</span>
          ) : null}
          {detail ? (
            <span className="continue-card-detail">{detail}</span>
          ) : null}
        </div>
        {(primary.subjectId === "vocab" ||
          primary.subjectId === "kanji" ||
          primary.subjectId === "reading" ||
          primary.subjectId === "listening") &&
        primary.percent > 0 ? (
          <ProgressRing percent={primary.percent} />
        ) : null}
        <span className="continue-card-cta">{t("continueLearning.cta")}</span>
      </Link>

      {others.length > 0 ? (
        <ul className="continue-card-more">
          {others.slice(0, compact ? 2 : 4).map((item) => {
            const line = detailLine(t, item);
            return (
              <li key={`${item.subjectId}-${item.path}`}>
                <Link className="continue-card-more-link" to={item.path}>
                  <span className="continue-card-more-subject">
                    {t(`subjects.${item.subjectId}.label`)}
                  </span>
                  <span className="continue-card-more-title">{item.title}</span>
                  {line ? (
                    <span className="continue-card-more-detail">{line}</span>
                  ) : null}
                  {item.percent > 0 ? (
                    <span className="continue-card-more-pct">{item.percent}%</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

ContinueLearningCard.propTypes = {
  compact: PropTypes.bool,
  continueData: PropTypes.shape({
    primary: PropTypes.object,
    items: PropTypes.array,
  }),
  loading: PropTypes.bool,
};
