import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  READING_ITEMS,
  READING_JLPT_LEVELS,
  READING_PROGRESS_DEMO,
  getReadingListFiltered,
} from "../data/readingMock.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./ReadingListPage.css";

function ReadingIconBook() {
  return (
    <svg
      className="reading-ico"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 5.5A2.5 2.5 0 016.5 3H12v18H6.5A2.5 2.5 0 014 18.5v-13zM12 3h5.5A2.5 2.5 0 0120 5.5v13a2.5 2.5 0 01-2.5 2.5H12V3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReadingIconClock() {
  return (
    <svg
      className="reading-ico"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 8v5l3 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReadingIconStar() {
  return (
    <svg
      className="reading-ico reading-ico--star"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M12 3.5l2.2 5.5h5.8l-4.7 3.6 1.8 5.6L12 16.9 7.9 18.2l1.8-5.6L5 9h5.8L12 3.5z" />
    </svg>
  );
}

function ReadingIconBookmark() {
  return (
    <svg
      className="reading-card-bookmark"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 3h10v18l-5-3.5L7 21V3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ReadingListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const jlpt = (searchParams.get("jlpt") || "").trim();
  const mode = (searchParams.get("mode") || "all").trim();
  const safeMode = mode === "suggested" || mode === "review" ? mode : "all";

  const list = useMemo(
    () => getReadingListFiltered(jlpt, safeMode),
    [jlpt, safeMode],
  );

  const progressPct = useMemo(() => {
    const { completed, goal } = READING_PROGRESS_DEMO;
    if (!goal) return 0;
    return Math.round((completed / goal) * 100);
  }, []);

  const setJlpt = (next) => {
    const p = new URLSearchParams(searchParams);
    if (next) p.set("jlpt", next);
    else p.delete("jlpt");
    if (safeMode !== "all") p.set("mode", safeMode);
    else p.delete("mode");
    setSearchParams(p, { replace: true });
  };

  const setMode = (next) => {
    const p = new URLSearchParams(searchParams);
    if (jlpt) p.set("jlpt", jlpt);
    else p.delete("jlpt");
    if (next === "all") p.delete("mode");
    else p.set("mode", next);
    setSearchParams(p, { replace: true });
  };

  const reviewCount = useMemo(
    () =>
      READING_ITEMS.filter(
        (x) => x.status === "in_progress" || x.status === "done",
      ).length,
    [],
  );

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      pageClassName="vocab-dash"
    >
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.reading") },
        ]}
      />

      <article
        className="vocab-sheet vocab-scope vocab-notebook vocab-lesson-scope"
        aria-labelledby="reading-list-title"
      >
        <header className="vocab-lesson-head">
          <div className="vocab-lesson-head-main">
            <img
              className="vocab-lesson-head-deco"
              src="/assets/vocabulary/list/header-leaf.png"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div>
              <h1 id="reading-list-title" className="vocab-lesson-title">
                {t("readingPage.listTitle")}
              </h1>
              <p className="vocab-lesson-sub">
                <span className="reading-sub-kicker" lang="ja">
                  {t("readingPage.kickerJa")}
                </span>
                <span className="reading-sub-sep"> · </span>
                <span>{t("readingPage.kicker")}</span>
                <span className="reading-sub-sep"> — </span>
                {t("readingPage.listSubtitle")}
              </p>
            </div>
          </div>

          <div
            className="vocab-lesson-goal-box reading-goal-box"
            aria-labelledby="reading-progress-label"
          >
            <div className="reading-goal-box-inner">
              <span
                id="reading-progress-label"
                className="vocab-lesson-goal-label"
              >
                {t("readingPage.progressLabel")}
              </span>
              <strong className="vocab-lesson-goal-value">
                {READING_PROGRESS_DEMO.completed} / {READING_PROGRESS_DEMO.goal}
              </strong>
            </div>
            <div className="vocab-lesson-progress-track reading-goal-track">
              <div
                className="vocab-lesson-progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </header>

        <div
          className="vocab-tabs reading-jlpt-tabs"
          role="tablist"
          aria-label={t("readingPage.filterAria")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={!jlpt}
            className={`vocab-tab${!jlpt ? " vocab-tab--active" : ""}`}
            onClick={() => setJlpt("")}
          >
            {t("readingPage.filterAll")}
          </button>
          {READING_JLPT_LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              role="tab"
              aria-selected={jlpt === lv}
              className={`vocab-tab${jlpt === lv ? " vocab-tab--active" : ""}`}
              onClick={() => setJlpt(lv)}
            >
              {lv}
            </button>
          ))}
          <button
            type="button"
            className="vocab-tab reading-tab-muted"
            title={t("readingPage.filterMoreTitle")}
          >
            {t("readingPage.filterMore")}
          </button>
        </div>

        {list.length === 0 ? (
          <p className="vocab-empty" role="status">
            {t("readingPage.noResults")}
          </p>
        ) : (
          <ul className="vocab-lesson-list">
            {list.map((item) => (
              <li key={item.id} className="vocab-lesson-card">
                <Link className="reading-row-link" to={`/reading/${item.id}`}>
                  <span className="reading-card-bookmark-wrap" aria-hidden>
                    <ReadingIconBookmark />
                  </span>
                  <div className="reading-thumb-wrap">
                    <img
                      className="reading-thumb"
                      src={item.imageUrl}
                      alt=""
                      width={200}
                      height={140}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="vocab-lesson-main reading-row-main">
                    <div className="reading-row-titleline">
                      <span
                        className={`reading-badge reading-badge--${item.jlpt.toLowerCase()}`}
                        lang="ja"
                      >
                        {item.jlpt}
                      </span>
                      <h2
                        className="vocab-lesson-card-title reading-row-title"
                        lang="ja"
                      >
                        {item.titleJa}
                      </h2>
                    </div>
                    <p
                      className="vocab-lesson-card-sub reading-row-snippet"
                      lang="ja"
                    >
                      {item.snippetJa}
                    </p>
                    <div className="reading-row-meta">
                      <span className="reading-meta-item">
                        <ReadingIconBook />
                        {t("readingPage.metaWords", { n: item.wordCount })}
                      </span>
                      <span className="reading-meta-item">
                        <ReadingIconClock />
                        {t("readingPage.metaMinutes", {
                          n: item.readingMinutes,
                        })}
                      </span>
                      <span className="reading-meta-item">
                        <ReadingIconStar />
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                    <span
                      className={`reading-row-cta vocab-cta-btn reading-cta--${item.status}`}
                    >
                      {item.status === "not_started"
                        ? t("readingPage.ctaStart")
                        : t("readingPage.ctaContinue")}
                    </span>
                  </div>
                  <span className="vocab-lesson-chevron" aria-hidden>
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <nav
          className="reading-foot-nav"
          aria-label={t("readingPage.footNavAria")}
        >
          <button
            type="button"
            className={`vocab-tab reading-foot-tab${safeMode === "suggested" ? " vocab-tab--active" : ""}`}
            onClick={() => setMode("suggested")}
          >
            <span className="reading-foot-ico" aria-hidden>
              ✿
            </span>
            {t("readingPage.footSuggested")}
          </button>
          <button
            type="button"
            className={`vocab-tab reading-foot-tab${safeMode === "review" ? " vocab-tab--active" : ""}`}
            onClick={() => setMode("review")}
          >
            <ReadingIconBook />
            {t("readingPage.footReview")}
            {reviewCount > 0 ? (
              <span className="reading-foot-badge">{reviewCount}</span>
            ) : null}
          </button>
        </nav>
      </article>
    </Layout>
  );
}
