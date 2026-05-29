import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import StudyPageHeader from "../components/study/StudyPageHeader.jsx";
import { mockStreak } from "../data/dashboardHomeMock.js";
import { READING_JLPT_LEVELS } from "../data/readingMock.js";
import { STUDY_LIST_PAGE_SIZE } from "../constants/deckLessonList.js";
import {
  getReadingSummary,
  listReadingArticles,
} from "../services/readingService.js";
import StudyListPagination from "../components/study/StudyListPagination.jsx";
import {
  parseStudyListPage,
  studyListPath,
  studyListSearchParams,
} from "../utils/studyListNav.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { resolvePublicMediaUrl } from "../utils/resolveAvatarUrl.js";
import { useJlptAccess } from "../hooks/useJlptAccess.js";
import JlptLockedOverlay from "../components/study/JlptLockedOverlay.jsx";
import "../components/study/JlptLockGate.css";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./ReadingListPage.css";
import "./GrammarPages.css";

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
  const { isLocked } = useJlptAccess();
  const [searchParams, setSearchParams] = useSearchParams();

  const jlpt = (searchParams.get("jlpt") || "").trim();
  const mode = (searchParams.get("mode") || "all").trim();
  const safeMode = mode === "suggested" || mode === "review" ? mode : "all";
  const requestedPage = parseStudyListPage(searchParams);

  const [list, setList] = useState([]);
  const [jlptLevels] = useState(READING_JLPT_LEVELS);
  const [pagination, setPagination] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, goal: 60 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchList = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [listRes, summary] = await Promise.all([
        listReadingArticles({
          jlpt: jlpt || undefined,
          mode: safeMode,
          page: requestedPage,
          limit: STUDY_LIST_PAGE_SIZE,
        }),
        getReadingSummary(),
      ]);
      setList(listRes.items ?? []);
      setPagination(listRes.pagination);
      setProgress(summary);
      const serverPage = listRes.pagination?.page ?? requestedPage;
      if (serverPage !== requestedPage) {
        setSearchParams(
          studyListSearchParams({
            page: serverPage,
            jlpt,
            mode: safeMode,
          }),
          { replace: true },
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t));
      setList([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [user, jlpt, safeMode, requestedPage, setSearchParams, t]);

  useEffect(() => {
    if (!user) return;
    void fetchList();
  }, [fetchList, user]);

  const page = pagination?.page ?? requestedPage;
  const totalPages = Math.max(1, pagination?.pages ?? 1);
  const totalItems = pagination?.total ?? 0;

  const progressPct = useMemo(() => {
    const { completed, goal } = progress;
    if (!goal) return 0;
    return Math.round((completed / goal) * 100);
  }, [progress]);

  const setJlpt = (next) => {
    setSearchParams(
      studyListSearchParams({ page: 1, jlpt: next, mode: safeMode }),
      { replace: true },
    );
  };

  const setMode = (next) => {
    setSearchParams(
      studyListSearchParams({
        page: 1,
        jlpt,
        mode: next === "all" ? "" : next,
      }),
      { replace: true },
    );
  };

  const getPageHref = useCallback(
    (p) =>
      studyListPath("/reading", {
        page: p,
        jlpt,
        mode: safeMode,
      }),
    [jlpt, safeMode],
  );

  const reviewCount = progress.reviewCount ?? 0;

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  if (loading && !list.length) {
    return (
      <Layout
        userName={headerName}
        streakDays={mockStreak.days}
        pageClassName="vocab-dash"
      >
        <p className="vocab-empty">{t("common.loading")}</p>
      </Layout>
    );
  }

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
                {progress.completed} / {progress.goal}
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

        {error ? (
          <p className="vocab-empty" role="alert">
            {error}
          </p>
        ) : null}

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
          {jlptLevels.map((lv) => (
            <button
              key={lv}
              type="button"
              role="tab"
              aria-selected={jlpt === lv}
              className={`vocab-tab${jlpt === lv ? " vocab-tab--active" : ""}${isLocked(lv) ? " vocab-tab--jlpt-locked" : ""}`}
              onClick={() => setJlpt(lv)}
            >
              {isLocked(lv) ? t("jlptAccess.tabLocked", { level: lv }) : lv}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="vocab-empty">{t("common.loading")}</p>
        ) : list.length === 0 ? (
          <p className="vocab-empty" role="status">
            {t("readingPage.noResults")}
          </p>
        ) : (
          <ul className="vocab-lesson-list">
            {list.map((item) => {
              const thumbSrc = resolvePublicMediaUrl(item.imageUrl);
              const locked = item.locked || isLocked(item.jlpt);
              const rowInner = (
                <>
                  <span className="reading-card-bookmark-wrap" aria-hidden>
                    <ReadingIconBookmark />
                  </span>
                  <div className="reading-thumb-wrap">
                    <img
                      className="reading-thumb"
                      src={thumbSrc || item.imageUrl}
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
                  {!locked ? (
                    <span className="vocab-lesson-chevron" aria-hidden>
                      ›
                    </span>
                  ) : null}
                </>
              );
              if (locked) {
                return (
                  <li
                    key={item.id}
                    className="reading-card-wrap--locked vocab-lesson-card"
                  >
                    <div className="reading-row-link reading-card--jlpt-locked">
                      {rowInner}
                    </div>
                    <JlptLockedOverlay level={item.jlpt} />
                  </li>
                );
              }
              return (
                <li key={item.id} className="vocab-lesson-card">
                  <Link className="reading-row-link" to={`/reading/${item.id}`}>
                    {rowInner}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && !error && totalItems > 0 ? (
          <StudyListPagination
            i18nKey="readingPage"
            page={page}
            totalPages={totalPages}
            total={totalItems}
            pageSize={STUDY_LIST_PAGE_SIZE}
            getPageHref={getPageHref}
          />
        ) : null}

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
