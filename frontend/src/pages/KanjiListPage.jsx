import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import { KANJI_LESSON_GROWTH_MAX } from "../data/kanjiMock.js";
import { getLessonMilestoneLitCount } from "../data/vocabularyMock.js";
import { DECK_LESSON_PAGE_SIZE } from "../constants/deckLessonList.js";
import { listKanjiDecks } from "../services/kanjiService.js";
import {
  getMyKanjiProgress,
  kanjiProgressToMap,
} from "../services/kanjiProgressService.js";
import {
  buildDeckLessons,
  JLPT_ORDER,
  packFlowerProgressByDeckMap,
} from "../utils/deckStudy.js";
import {
  kanjiListPath,
  kanjiListSearchParams,
  paginationPageNumbers,
  parseKanjiListPage,
} from "../utils/kanjiListNav.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { useJlptAccess } from "../hooks/useJlptAccess.js";
import JlptLockedOverlay from "../components/study/JlptLockedOverlay.jsx";
import "../components/study/JlptLockGate.css";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./GrammarPages.css";
import "./ReadingListPage.css";

export default function KanjiListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isLocked } = useJlptAccess();

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJlpt = (searchParams.get("jlpt") || "").trim();
  const requestedPage = parseKanjiListPage(searchParams);

  const [decks, setDecks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressByDeckId, setProgressByDeckId] = useState({});

  const fetchList = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const params = {
        isActive: true,
        page: requestedPage,
        limit: DECK_LESSON_PAGE_SIZE,
      };
      if (selectedJlpt) {
        params.jlpt = selectedJlpt;
      }

      const [{ decks: pageDecks, pagination: pag }, progressList] =
        await Promise.all([
          listKanjiDecks(params),
          getMyKanjiProgress(selectedJlpt ? { jlpt: selectedJlpt } : undefined),
        ]);

      setDecks(pageDecks);
      setPagination(pag);
      setProgressByDeckId(kanjiProgressToMap(progressList));

      const serverPage = pag?.page ?? requestedPage;
      if (serverPage !== requestedPage) {
        setSearchParams(
          kanjiListSearchParams({ page: serverPage, jlpt: selectedJlpt }),
          { replace: true },
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t));
      setDecks([]);
      setPagination(null);
      setProgressByDeckId({});
    } finally {
      setLoading(false);
    }
  }, [user, requestedPage, selectedJlpt, setSearchParams, t]);

  useEffect(() => {
    if (!user) return;
    void fetchList();
  }, [fetchList, user]);

  const lessons = useMemo(
    () => buildDeckLessons(decks, [], progressByDeckId),
    [decks, progressByDeckId],
  );

  const page = pagination?.page ?? requestedPage;
  const totalPages = Math.max(1, pagination?.pages ?? 1);
  const totalLessons = pagination?.total ?? 0;
  const fromIndex =
    totalLessons === 0 ? 0 : (page - 1) * DECK_LESSON_PAGE_SIZE + 1;
  const toIndex =
    totalLessons === 0
      ? 0
      : Math.min(page * DECK_LESSON_PAGE_SIZE, totalLessons);

  const totalKanji = lessons.reduce((acc, lesson) => acc + lesson.total, 0);
  const displayJlpt = selectedJlpt || t("kanjiPage.jlptAll");

  const setJlpt = (next) => {
    setSearchParams(
      kanjiListSearchParams({ page: 1, jlpt: next }),
      { replace: true },
    );
  };

  const packProgress = useMemo(
    () =>
      packFlowerProgressByDeckMap(
        lessons,
        progressByDeckId,
        KANJI_LESSON_GROWTH_MAX,
      ),
    [lessons, progressByDeckId],
  );

  const getDeckGrowthStage = useCallback(
    (deckId) => progressByDeckId[String(deckId)] ?? 0,
    [progressByDeckId],
  );

  const baseFilter = useMemo(
    () => ({ jlpt: selectedJlpt }),
    [selectedJlpt],
  );

  const pageNumbers = useMemo(
    () => paginationPageNumbers(page, totalPages),
    [page, totalPages],
  );

  const summaryText = t("kanjiPage.pageSummary", {
    from: fromIndex,
    to: toIndex,
    total: totalLessons,
  });
  const positionText = t("kanjiPage.pagePosition", {
    current: page,
    totalPages,
  });

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  if (loading && !decks.length) {
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

  if (error && !decks.length) {
    return (
      <Layout
        userName={headerName}
        streakDays={mockStreak.days}
        pageClassName="vocab-dash"
      >
        <p className="vocab-empty grammar-empty--error" role="alert">
          {error}
        </p>
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
          { label: t("breadcrumb.kanji") },
        ]}
      />

      <article
        className="vocab-sheet vocab-scope vocab-notebook vocab-lesson-scope"
        aria-labelledby="kanji-list-title"
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
              <h1 id="kanji-list-title" className="vocab-lesson-title">
                {t("kanjiPage.lessonPageTitle")}
              </h1>
              <p className="vocab-lesson-sub">
                {totalLessons > 0 ? (
                  <>
                    {t("kanjiPage.lessonPageSubtitle", {
                      jlpt: displayJlpt,
                      lessonCount: totalLessons,
                      totalKanji,
                    })}{" "}
                    <span className="vocab-lesson-pack-pct">
                      {t("kanjiPage.packCompleteLine", packProgress)}
                    </span>
                  </>
                ) : (
                  t("kanjiPage.lessonPageSubtitleEmpty")
                )}
              </p>
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
            aria-selected={!selectedJlpt}
            className={`vocab-tab${!selectedJlpt ? " vocab-tab--active" : ""}`}
            onClick={() => setJlpt("")}
          >
            {t("readingPage.filterAll")}
          </button>
          {JLPT_ORDER.map((lv) => (
            <button
              key={`jlpt-tab-${lv}`}
              type="button"
              role="tab"
              aria-selected={selectedJlpt === lv}
              className={`vocab-tab${selectedJlpt === lv ? " vocab-tab--active" : ""}${isLocked(lv) ? " vocab-tab--jlpt-locked" : ""}`}
              onClick={() => setJlpt(lv)}
            >
              {isLocked(lv) ? t("jlptAccess.tabLocked", { level: lv }) : lv}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="vocab-empty">{t("common.loading")}</p>
        ) : lessons.length === 0 ? (
          <p className="vocab-empty" role="status">
            {t("kanjiPage.noResults")}
          </p>
        ) : (
          <ul className="vocab-lesson-list">
            {lessons.map((lesson) => {
              const growth = getDeckGrowthStage(lesson.id);
              const progressPct =
                KANJI_LESSON_GROWTH_MAX > 0
                  ? Math.round((growth / KANJI_LESSON_GROWTH_MAX) * 100)
                  : 0;
              const milestoneLitCount = getLessonMilestoneLitCount(growth);
              const studyTo = lesson.id
                ? `/kanji/lesson/${lesson.lessonNo}?jlpt=${encodeURIComponent(lesson.jlpt)}&deckId=${encodeURIComponent(lesson.id)}`
                : "/kanji/browse";
              const jlptLocked = isLocked(lesson.jlpt);
              const canStudy = lesson.unlocked && !jlptLocked;

              const cardInner = (
                <>
                  <div className="vocab-lesson-book-wrap">
                    <img
                      className="vocab-lesson-book-icon"
                      src="/assets/vocabulary/list/book-open.png"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="vocab-lesson-main">
                    <h2 className="vocab-lesson-card-title">
                      {!selectedJlpt ? (
                        <span className="vocab-lesson-jlpt-tag">
                          {lesson.jlpt}
                        </span>
                      ) : null}
                      {t("kanjiPage.lessonCardTitle", { n: lesson.lessonNo })}
                      {!canStudy ? (
                        <span className="vocab-lesson-lock-badge" aria-hidden>
                          {" "}
                          🔒
                        </span>
                      ) : null}
                    </h2>
                    <p className="vocab-lesson-card-sub">
                      {lesson.unlocked
                        ? t("kanjiPage.lessonCardSubtitle")
                        : t("kanjiPage.lessonLockedSubtitle")}
                    </p>
                    <p className="vocab-lesson-card-meta">
                      {t("kanjiPage.lessonCardProgress", {
                        learned: lesson.learned,
                        total: lesson.total,
                      })}
                    </p>
                    <div className="vocab-lesson-progress">
                      <span className="vocab-lesson-progress-text">
                        {t("kanjiPage.lessonCardGrowth", {
                          stageName: t(`kanjiPage.growthStageName.${growth}`),
                          kanji: lesson.total,
                        })}
                      </span>
                      <div className="vocab-lesson-progress-track">
                        <div
                          className="vocab-lesson-progress-fill"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="vocab-lesson-milestones" aria-hidden>
                    <img
                      className={`vocab-lesson-milestone ${milestoneLitCount >= 1 ? "is-active" : "is-inactive"}`}
                      src="/assets/vocabulary/list/plant-seed.png"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <img
                      className={`vocab-lesson-milestone ${milestoneLitCount >= 2 ? "is-active" : "is-inactive"}`}
                      src="/assets/vocabulary/list/plant-sprout.png"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <img
                      className={`vocab-lesson-milestone ${milestoneLitCount >= 3 ? "is-active" : "is-inactive"}`}
                      src="/assets/vocabulary/list/plant-bud.png"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <img
                      className={`vocab-lesson-milestone ${milestoneLitCount >= 4 ? "is-active" : "is-inactive"}`}
                      src="/assets/vocabulary/list/plant-flower.png"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {canStudy ? (
                    <span className="vocab-lesson-chevron" aria-hidden>
                      ›
                    </span>
                  ) : (
                    <span
                      className="vocab-lesson-chevron vocab-lesson-chevron--muted"
                      aria-hidden
                    >
                      —
                    </span>
                  )}
                </>
              );

              return (
                <li
                  key={lesson.id}
                  className={`vocab-lesson-card${canStudy ? "" : " vocab-lesson-card--locked"}${jlptLocked ? " vocab-lesson-card-wrap--locked" : ""}`}
                >
                  {canStudy ? (
                    <Link className="vocab-lesson-link" to={studyTo}>
                      {cardInner}
                    </Link>
                  ) : (
                    <div
                      className="vocab-lesson-link vocab-lesson-link--locked"
                      role="group"
                      aria-label={t("kanjiPage.lessonLockedAria", {
                        n: lesson.lessonNo,
                      })}
                    >
                      {cardInner}
                    </div>
                  )}
                  {jlptLocked ? (
                    <JlptLockedOverlay level={lesson.jlpt} />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        {!loading && !error && totalLessons > 0 ? (
          <nav
            className="grammar-pagination"
            aria-label={t("kanjiPage.paginationLabel")}
          >
            <p className="grammar-pagination-meta">
              {summaryText}
              {" · "}
              {positionText}
            </p>
            <div className="grammar-pagination-nav">
              <Link
                className="grammar-page-btn"
                to={kanjiListPath({ ...baseFilter, page: 1 })}
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : 0}
                style={
                  page <= 1
                    ? { pointerEvents: "none", opacity: 0.45 }
                    : undefined
                }
                title={t("kanjiPage.firstPage")}
              >
                «
              </Link>
              <Link
                className="grammar-page-btn"
                to={kanjiListPath({ ...baseFilter, page: page - 1 })}
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : 0}
                style={
                  page <= 1
                    ? { pointerEvents: "none", opacity: 0.45 }
                    : undefined
                }
              >
                {t("kanjiPage.prevPage")}
              </Link>

              {pageNumbers.map((n) => (
                <Link
                  key={n}
                  to={kanjiListPath({ ...baseFilter, page: n })}
                  className={`grammar-page-btn${n === page ? " grammar-page-btn--active" : ""}`}
                  aria-current={n === page ? "page" : undefined}
                  title={t("kanjiPage.goToPage", { n })}
                >
                  {n}
                </Link>
              ))}

              <Link
                className="grammar-page-btn"
                to={kanjiListPath({ ...baseFilter, page: page + 1 })}
                aria-disabled={page >= totalPages}
                tabIndex={page >= totalPages ? -1 : 0}
                style={
                  page >= totalPages
                    ? { pointerEvents: "none", opacity: 0.45 }
                    : undefined
                }
              >
                {t("kanjiPage.nextPage")}
              </Link>
              <Link
                className="grammar-page-btn"
                to={kanjiListPath({ ...baseFilter, page: totalPages })}
                aria-disabled={page >= totalPages}
                tabIndex={page >= totalPages ? -1 : 0}
                style={
                  page >= totalPages
                    ? { pointerEvents: "none", opacity: 0.45 }
                    : undefined
                }
                title={t("kanjiPage.lastPage")}
              >
                »
              </Link>
            </div>
          </nav>
        ) : null}
      </article>
    </Layout>
  );
}
