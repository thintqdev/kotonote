import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import { useMergedProfile } from "../hooks/useMergedProfile.js";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import LeaderboardEntriesList from "../components/leaderboard/LeaderboardEntriesList.jsx";
import LeaderboardMyRankCallout from "../components/leaderboard/LeaderboardMyRankCallout.jsx";
import { mockStreak } from "../data/dashboardHomeMock.js";
import { JLPT_ORDER } from "../utils/deckStudy.js";
import { jlptLevelFromProfile } from "../utils/profileJlptLevel.js";
import { getLeaderboards } from "../services/leaderboardService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "../components/leaderboard/leaderboardShared.css";

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const profile = useMergedProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const profileJlpt = useMemo(() => jlptLevelFromProfile(profile), [profile]);

  const urlJlpt = (searchParams.get("jlpt") || "").trim().toUpperCase();
  const safeJlpt = JLPT_ORDER.includes(urlJlpt) ? urlJlpt : profileJlpt;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const myId = user?._id ? String(user._id) : "";

  useEffect(() => {
    if (urlJlpt || !profileJlpt) return;
    setSearchParams({ jlpt: profileJlpt }, { replace: true });
  }, [urlJlpt, profileJlpt, setSearchParams]);

  const fetchBoards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await getLeaderboards({ jlpt: safeJlpt });
      setData(res);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user, safeJlpt, t]);

  useEffect(() => {
    void fetchBoards();
  }, [fetchBoards]);

  const setJlpt = (jlpt) => {
    setSearchParams({ jlpt }, { replace: true });
  };

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const streakEntries = data?.streak ?? [];
  const lessonEntries = data?.lessons?.entries ?? [];
  const meStreak = data?.me?.streak ?? null;
  const meLessons = data?.me?.lessons ?? null;

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      pageClassName="vocab-dash"
    >
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("leaderboardPage.title") },
        ]}
      />

      <article
        className="vocab-sheet vocab-scope vocab-notebook leaderboard-scope"
        aria-labelledby="leaderboard-title"
      >
        <header className="vocab-lesson-head">
          <div className="vocab-lesson-head-main">
            <div>
              <h1 id="leaderboard-title" className="vocab-lesson-title">
                {t("leaderboardPage.title")}
              </h1>
              <p className="vocab-lesson-sub">{t("leaderboardPage.subtitle")}</p>
            </div>
          </div>
        </header>

        {error ? (
          <p className="vocab-empty grammar-empty--error" role="alert">
            {error}
          </p>
        ) : null}

        <section className="leaderboard-panel" aria-labelledby="lb-streak-title">
          <h2 id="lb-streak-title" className="leaderboard-panel-title">
            {t("leaderboardPage.streakTitle")}
          </h2>
          <p className="leaderboard-panel-hint">
            {t("leaderboardPage.streakHint")}
          </p>
          <LeaderboardEntriesList
            entries={streakEntries}
            myId={myId}
            loading={loading}
            loadingMessage={t("common.loading")}
            emptyMessage={t("leaderboardPage.streakEmpty")}
            renderValue={(entry) => (
              <>
                {t("leaderboardPage.streakDays", {
                  count: entry.currentStreak,
                })}
                <span className="leaderboard-value-sub">
                  {t("leaderboardPage.streakBest", {
                    count: entry.longestStreak,
                  })}
                </span>
              </>
            )}
          />
          {!loading ? (
            <LeaderboardMyRankCallout
              rankInfo={meStreak}
              entries={streakEntries}
              myId={myId}
            >
              {(me) => (
                <>
                  {t("leaderboardPage.yourRank", { rank: me.rank })}
                  <span className="leaderboard-my-rank-sub">
                    {t("leaderboardPage.yourRankStreak", {
                      count: me.currentStreak,
                      best: me.longestStreak,
                    })}
                  </span>
                </>
              )}
            </LeaderboardMyRankCallout>
          ) : null}
        </section>

        <section className="leaderboard-panel" aria-labelledby="lb-lesson-title">
          <h2 id="lb-lesson-title" className="leaderboard-panel-title">
            {t("leaderboardPage.lessonTitle")}
          </h2>
          <p className="leaderboard-panel-hint">
            {t("leaderboardPage.lessonHint")}
          </p>

          <div
            className="vocab-tabs reading-jlpt-tabs leaderboard-tabs vocab-tabs--scroll-mobile"
            role="tablist"
            aria-label={t("leaderboardPage.jlptTabsAria")}
          >
            {JLPT_ORDER.map((lv) => (
              <button
                key={`lb-jlpt-${lv}`}
                type="button"
                role="tab"
                aria-selected={safeJlpt === lv}
                className={`vocab-tab${safeJlpt === lv ? " vocab-tab--active" : ""}`}
                onClick={() => setJlpt(lv)}
              >
                {lv}
              </button>
            ))}
          </div>

          <LeaderboardEntriesList
            entries={lessonEntries}
            myId={myId}
            loading={loading}
            loadingMessage={t("common.loading")}
            emptyMessage={t("leaderboardPage.lessonEmpty")}
            renderValue={(entry) => (
              <>
                {t("leaderboardPage.lessonCount", {
                  count: entry.completedLessons,
                })}
                <span className="leaderboard-value-sub">
                  {t("leaderboardPage.lessonBreakdown", {
                    vocab: entry.vocabCompleted,
                    kanji: entry.kanjiCompleted,
                  })}
                </span>
              </>
            )}
          />
          {!loading ? (
            <LeaderboardMyRankCallout
              rankInfo={meLessons}
              entries={lessonEntries}
              myId={myId}
            >
              {(me) => (
                <>
                  {t("leaderboardPage.yourRank", { rank: me.rank })}
                  <span className="leaderboard-my-rank-sub">
                    {t("leaderboardPage.yourRankLesson", {
                      count: me.completedLessons,
                      vocab: me.vocabCompleted,
                      kanji: me.kanjiCompleted,
                    })}
                  </span>
                </>
              )}
            </LeaderboardMyRankCallout>
          ) : null}
        </section>
      </article>
    </Layout>
  );
}
