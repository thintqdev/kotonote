import { useCallback, useEffect, useMemo, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { useAuth } from "../hooks/useAuth.jsx";

import Layout from "../layouts/Layout.jsx";

import { Breadcrumb } from "../components/common";

import { mockStreak } from "../data/dashboardHomeMock.js";

import {
  getLessonMilestoneLitCount,
  VOCAB_LESSON_GROWTH_MAX,
} from "../data/vocabularyMock.js";

import { DECK_LESSON_PAGE_SIZE } from "../constants/deckLessonList.js";

import { listVocabularyDecks } from "../services/vocabularyService.js";

import {
  getMyVocabularyProgress,
  vocabularyProgressToMap,
} from "../services/vocabularyProgressService.js";

import {
  buildDeckLessons,
  JLPT_ORDER,
  jlptToApiLevel,
  levelToJlpt,
  packFlowerProgressByDeckMap,
} from "../utils/deckStudy.js";

import {
  paginationPageNumbers,
  parseVocabListPage,
  vocabListPath,
  vocabListSearchParams,
} from "../utils/vocabularyListNav.js";

import { getApiErrorMessage } from "../utils/apiErrorMessage.js";

import { useJlptAccess } from "../hooks/useJlptAccess.js";

import LessonAccessBadge from "../components/study/LessonAccessBadge.jsx";

import "./DashboardHome.css";

import "./VocabularyPages.css";

import "./GrammarPages.css";

import "./ReadingListPage.css";

export default function VocabularyListPage() {
  const { t, i18n } = useTranslation();

  const lang = i18n.language || "ja";

  const showVi = String(lang).toLowerCase().startsWith("vi");

  const { user } = useAuth();

  const { isLocked } = useJlptAccess();

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedJlpt = (searchParams.get("jlpt") || "").trim();

  const requestedPage = parseVocabListPage(searchParams);

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
        params.level = jlptToApiLevel(selectedJlpt);
      }

      const [{ decks: pageDecks, pagination: pag }, progressList] =
        await Promise.all([
          listVocabularyDecks(params),

          getMyVocabularyProgress(),
        ]);

      setDecks(pageDecks);

      setPagination(pag);

      setProgressByDeckId(vocabularyProgressToMap(progressList));

      const serverPage = pag?.page ?? requestedPage;

      if (serverPage !== requestedPage) {
        setSearchParams(
          vocabListSearchParams({ page: serverPage, jlpt: selectedJlpt }),

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

  const totalWords = lessons.reduce((acc, lesson) => acc + lesson.total, 0);

  const displayJlpt = selectedJlpt || t("vocabPage.jlptAll");

  const setJlpt = (next) => {
    setSearchParams(
      vocabListSearchParams({ page: 1, jlpt: next }),

      { replace: true },
    );
  };

  const packProgress = useMemo(
    () =>
      packFlowerProgressByDeckMap(
        lessons,

        progressByDeckId,

        VOCAB_LESSON_GROWTH_MAX,
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

  const summaryText = t("vocabPage.pageSummary", {
    from: fromIndex,

    to: toIndex,

    total: totalLessons,
  });

  const positionText = t("vocabPage.pagePosition", {
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

          { label: t("breadcrumb.vocabulary") },
        ]}
      />

      <article
        className="vocab-sheet vocab-scope vocab-notebook vocab-lesson-scope"
        aria-labelledby="vocab-list-title"
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
              <h1 id="vocab-list-title" className="vocab-lesson-title">
                {t("vocabPage.lessonPageTitle")}
              </h1>

              <p className="vocab-lesson-sub">
                {totalLessons > 0 ? (
                  <>
                    {t("vocabPage.lessonPageSubtitle", {
                      jlpt: displayJlpt,

                      lessonCount: totalLessons,

                      totalWords,
                    })}{" "}
                    <span className="vocab-lesson-pack-pct">
                      {t("vocabPage.packCompleteLine", packProgress)}
                    </span>
                  </>
                ) : (
                  t("vocabPage.lessonPageSubtitleEmpty")
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
            {t("vocabPage.lessonPageSubtitleEmpty")}
          </p>
        ) : (
          <ul className="vocab-lesson-list">
            {lessons.map((lesson) => {
              const growth = getDeckGrowthStage(lesson.id);

              const progressPct =
                VOCAB_LESSON_GROWTH_MAX > 0
                  ? Math.round((growth / VOCAB_LESSON_GROWTH_MAX) * 100)
                  : 0;

              const milestoneLitCount = getLessonMilestoneLitCount(growth);

              const cardTitle = showVi
                ? lesson.title ||
                  t("vocabPage.lessonCardTitle", { n: lesson.lessonNo })
                : lesson.titleJa ||
                  lesson.title ||
                  t("vocabPage.lessonCardTitle", { n: lesson.lessonNo });

              const studyTo = lesson.id
                ? `/vocabulary/lesson/${lesson.lessonNo}?jlpt=${encodeURIComponent(lesson.jlpt)}&deckId=${encodeURIComponent(lesson.id)}`
                : "/vocabulary/browse";

              const jlptLocked = isLocked(lesson.jlpt);

              const canStudy = lesson.unlocked && !jlptLocked;

              const badgeVariant = canStudy
                ? "open"
                : jlptLocked
                  ? "jlptLocked"
                  : "growthLocked";

              const cardClass = canStudy
                ? "vocab-lesson-card vocab-lesson-card--open"
                : jlptLocked
                  ? "vocab-lesson-card vocab-lesson-card--jlpt-locked"
                  : "vocab-lesson-card vocab-lesson-card--growth-locked";

              const cardBody = (
                <>
                  <div className="vocab-lesson-book-wrap">
                    {lesson.thumbnail ? (
                      <img
                        className="vocab-lesson-book-icon vocab-lesson-deck-thumb"
                        src={lesson.thumbnail}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <img
                        className="vocab-lesson-book-icon"
                        src="/assets/vocabulary/list/book-open.png"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>

                  <div className="vocab-lesson-main">
                    <h2 className="vocab-lesson-card-title">
                      {!selectedJlpt ? (
                        <span className="vocab-lesson-jlpt-tag">
                          {lesson.jlpt}
                        </span>
                      ) : null}

                      {cardTitle}
                    </h2>

                    <p className="vocab-lesson-card-sub">
                      {!canStudy && !jlptLocked && lesson.unlockReasonKey
                        ? t(lesson.unlockReasonKey)
                        : lesson.description ||
                          t("vocabPage.lessonCardSubtitle")}
                    </p>

                    <p className="vocab-lesson-card-meta">
                      {t("vocabPage.lessonCardWordCount", {
                        count: lesson.total,
                      })}
                    </p>

                    <div className="vocab-lesson-progress">
                      <span className="vocab-lesson-progress-text">
                        {t("vocabPage.lessonCardGrowth", {
                          stageName: t(`vocabPage.growthStageName.${growth}`),

                          words: lesson.total,
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
                  ) : null}
                </>
              );

              if (!canStudy) {
                return (
                  <li key={lesson.id} className={cardClass}>
                    <LessonAccessBadge
                      variant={badgeVariant}
                      jlpt={lesson.jlpt}
                    />

                    <div
                      className="vocab-lesson-link vocab-lesson-link--locked"
                      aria-disabled="true"
                    >
                      {cardBody}
                    </div>
                  </li>
                );
              }

              return (
                <li key={lesson.id} className={cardClass}>
                  <LessonAccessBadge variant="open" />

                  <Link className="vocab-lesson-link" to={studyTo}>
                    {cardBody}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && !error && totalLessons > 0 ? (
          <nav
            className="grammar-pagination"
            aria-label={t("vocabPage.paginationLabel")}
          >
            <p className="grammar-pagination-meta">
              {summaryText}

              {" · "}

              {positionText}
            </p>

            <div className="grammar-pagination-nav">
              <Link
                className="grammar-page-btn"
                to={vocabListPath({ ...baseFilter, page: 1 })}
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : 0}
                style={
                  page <= 1
                    ? { pointerEvents: "none", opacity: 0.45 }
                    : undefined
                }
                title={t("vocabPage.firstPage")}
              >
                «
              </Link>

              <Link
                className="grammar-page-btn"
                to={vocabListPath({ ...baseFilter, page: page - 1 })}
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : 0}
                style={
                  page <= 1
                    ? { pointerEvents: "none", opacity: 0.45 }
                    : undefined
                }
              >
                {t("vocabPage.prevPage")}
              </Link>

              {pageNumbers.map((n) => (
                <Link
                  key={n}
                  to={vocabListPath({ ...baseFilter, page: n })}
                  className={`grammar-page-btn${n === page ? " grammar-page-btn--active" : ""}`}
                  aria-current={n === page ? "page" : undefined}
                  title={t("vocabPage.goToPage", { n })}
                >
                  {n}
                </Link>
              ))}

              <Link
                className="grammar-page-btn"
                to={vocabListPath({ ...baseFilter, page: page + 1 })}
                aria-disabled={page >= totalPages}
                tabIndex={page >= totalPages ? -1 : 0}
                style={
                  page >= totalPages
                    ? { pointerEvents: "none", opacity: 0.45 }
                    : undefined
                }
              >
                {t("vocabPage.nextPage")}
              </Link>

              <Link
                className="grammar-page-btn"
                to={vocabListPath({ ...baseFilter, page: totalPages })}
                aria-disabled={page >= totalPages}
                tabIndex={page >= totalPages ? -1 : 0}
                style={
                  page >= totalPages
                    ? { pointerEvents: "none", opacity: 0.45 }
                    : undefined
                }
                title={t("vocabPage.lastPage")}
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
