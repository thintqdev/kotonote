import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LeaderboardEntriesList from "../leaderboard/LeaderboardEntriesList.jsx";
import LeaderboardMyRankCallout from "../leaderboard/LeaderboardMyRankCallout.jsx";
import "./LeaderboardPreviewCard.css";
import "../leaderboard/leaderboardShared.css";

export default function LeaderboardPreviewCard({
  jlpt,
  streakEntries,
  lessonEntries,
  meStreak = null,
  meLessons = null,
  loading,
  error,
  myId = "",
}) {
  const { t } = useTranslation();
  const boardLink = `/leaderboard?jlpt=${encodeURIComponent(jlpt)}`;

  return (
    <section
      className="dash-lb-preview"
      aria-labelledby="dash-lb-preview-title"
    >
      <div className="dash-lb-preview-head">
        <div>
          <h2 id="dash-lb-preview-title" className="dash-lb-preview-title">
            {t("dashboard.leaderboardPreview.title")}
          </h2>
          <p className="dash-lb-preview-sub">
            {t("dashboard.leaderboardPreview.subtitle", { jlpt })}
          </p>
        </div>
        <Link className="dash-lb-preview-link" to={boardLink}>
          {t("dashboard.leaderboardPreview.viewAll")}
        </Link>
      </div>

      {error ? (
        <p className="dash-lb-preview-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="dash-lb-preview-grid">
        <div className="dash-lb-preview-col">
          <h3 className="dash-lb-preview-col-title">
            {t("dashboard.leaderboardPreview.streakTitle")}
          </h3>
          <LeaderboardEntriesList
            entries={streakEntries}
            myId={myId}
            compact
            loading={loading}
            loadingMessage={t("common.loading")}
            emptyMessage={t("dashboard.leaderboardPreview.streakEmpty")}
            renderValue={(entry) =>
              t("leaderboardPage.streakDays", { count: entry.currentStreak })
            }
          />
          {!loading ? (
            <LeaderboardMyRankCallout
              rankInfo={meStreak}
              entries={streakEntries}
              myId={myId}
              compact
            >
              {(me) =>
                t("leaderboardPage.yourRankShort", {
                  rank: me.rank,
                  value: t("leaderboardPage.streakDays", {
                    count: me.currentStreak,
                  }),
                })
              }
            </LeaderboardMyRankCallout>
          ) : null}
        </div>

        <div className="dash-lb-preview-col">
          <h3 className="dash-lb-preview-col-title">
            {t("dashboard.leaderboardPreview.lessonTitle")}
          </h3>
          <LeaderboardEntriesList
            entries={lessonEntries}
            myId={myId}
            compact
            loading={loading}
            loadingMessage={t("common.loading")}
            emptyMessage={t("dashboard.leaderboardPreview.lessonEmpty")}
            renderValue={(entry) =>
              t("leaderboardPage.lessonCount", {
                count: entry.completedLessons,
              })
            }
          />
          {!loading ? (
            <LeaderboardMyRankCallout
              rankInfo={meLessons}
              entries={lessonEntries}
              myId={myId}
              compact
            >
              {(me) =>
                t("leaderboardPage.yourRankShort", {
                  rank: me.rank,
                  value: t("leaderboardPage.lessonCount", {
                    count: me.completedLessons,
                  }),
                })
              }
            </LeaderboardMyRankCallout>
          ) : null}
        </div>
      </div>
    </section>
  );
}

LeaderboardPreviewCard.propTypes = {
  error: PropTypes.string,
  jlpt: PropTypes.string.isRequired,
  lessonEntries: PropTypes.array,
  meLessons: PropTypes.shape({
    rank: PropTypes.number,
    completedLessons: PropTypes.number,
  }),
  meStreak: PropTypes.shape({
    rank: PropTypes.number,
    currentStreak: PropTypes.number,
  }),
  loading: PropTypes.bool,
  myId: PropTypes.string,
  streakEntries: PropTypes.array,
};
