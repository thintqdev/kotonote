import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useStreakCard } from "../../hooks/useStreakCard.js";
import StreakWeekGrid from "./StreakWeekGrid.jsx";
import "./StreakCard.css";

/** Thẻ streak đầy đủ (legacy — ưu tiên HeaderStreak trên topbar). */
const StreakCard = ({ days = 0 }) => {
  const { t } = useTranslation();
  const {
    user,
    todayStr,
    weekDates,
    checkInSet,
    displayCount,
    loading,
    checkingIn,
    onTodayCheckIn,
  } = useStreakCard(days);

  return (
    <div
      className={`streak-card${loading ? " streak-card--loading" : ""}`}
      aria-busy={loading || checkingIn}
    >
      <img
        className="streak-card-pin"
        src="/assets/decorates/pin2.png"
        alt=""
        width="80"
        height="80"
        decoding="async"
      />
      <div className="streak-card-body">
        <p className="streak-card-headline">{t("streak.headline")}</p>

        <div className="streak-card-num-wrap">
          <span className="streak-card-num" aria-live="polite">
            {displayCount}
          </span>
        </div>

        <p className="streak-card-subline">{t("streak.subline")}</p>

        <StreakWeekGrid
          weekDates={weekDates}
          todayStr={todayStr}
          checkInSet={checkInSet}
          onTodayCheckIn={onTodayCheckIn}
          checkingIn={checkingIn}
          user={user}
        />
      </div>
    </div>
  );
};

StreakCard.propTypes = {
  days: PropTypes.number,
};

export default StreakCard;
