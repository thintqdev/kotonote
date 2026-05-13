import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  VOCAB_ITEMS,
  buildLessonQuizQuestions,
  advanceLessonGrowthStage,
  getLessonGrowthStage,
  getLessonMilestoneLitCount,
  getVocabLessonItems,
  mergeVocabMarks,
  shuffleVocabStudy,
  vocabMeaningLine,
  VOCAB_LESSON_GROWTH_MAX,
  VOCAB_QUIZ_PER_STAGE,
} from "../data/vocabularyMock.js";
import VocabularyLessonQuiz from "./VocabularyLessonQuiz.jsx";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./VocabularyPage.css";

function VocabSpeakerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M11 5L6 9H3v6h3l5 4V5z" opacity="0.95" />
      <path
        d="M15.5 9.5a3.5 3.5 0 010 5M17.5 7a7 7 0 010 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

export default function VocabularyPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language || "ja";
  const showViGloss = String(lang).toLowerCase().startsWith("vi");

  const [marks] = useState(() => ({}));
  const merged = useMemo(() => mergeVocabMarks(VOCAB_ITEMS, marks), [marks]);

  const params = useParams();
  const [searchParams] = useSearchParams();
  const lessonNoFromQuery = useMemo(() => {
    const fromPath =
      params.lessonNo != null && params.lessonNo !== ""
        ? parseInt(String(params.lessonNo), 10)
        : NaN;
    if (Number.isFinite(fromPath) && fromPath >= 1) return fromPath;
    const raw = searchParams.get("lesson");
    const n = parseInt(raw || "", 10);
    if (!Number.isFinite(n) || n < 1) return null;
    return n;
  }, [params.lessonNo, searchParams]);
  const lessonJlpt = useMemo(
    () => (searchParams.get("jlpt") || "").trim(),
    [searchParams],
  );
  const isLessonMode = Boolean(
    lessonNoFromQuery != null && lessonJlpt.length > 0,
  );

  const lessonItemsStable = useMemo(() => {
    if (!isLessonMode || !lessonJlpt || !lessonNoFromQuery) return [];
    return getVocabLessonItems(merged, {
      jlpt: lessonJlpt,
      lessonNo: lessonNoFromQuery,
    });
  }, [merged, isLessonMode, lessonJlpt, lessonNoFromQuery]);

  const [growthStage, setGrowthStage] = useState(0);
  useEffect(() => {
    if (!isLessonMode || !lessonJlpt || !lessonNoFromQuery) {
      setGrowthStage(0);
      return;
    }
    setGrowthStage(getLessonGrowthStage(lessonJlpt, lessonNoFromQuery));
  }, [isLessonMode, lessonJlpt, lessonNoFromQuery]);

  const [lessonTab, setLessonTab] = useState("detail");
  useEffect(() => {
    if (isLessonMode) setLessonTab("detail");
  }, [isLessonMode, lessonJlpt, lessonNoFromQuery]);

  const [quizGenKey, setQuizGenKey] = useState(0);
  const quizQuestions = useMemo(
    () =>
      buildLessonQuizQuestions(merged, lessonItemsStable, {
        lang,
        count: VOCAB_QUIZ_PER_STAGE,
      }),
    [merged, lessonItemsStable, lang, quizGenKey],
  );

  const handleQuizPerfect = useCallback(() => {
    if (!lessonJlpt || !lessonNoFromQuery) return;
    advanceLessonGrowthStage(lessonJlpt, lessonNoFromQuery);
    setGrowthStage(getLessonGrowthStage(lessonJlpt, lessonNoFromQuery));
    setQuizGenKey((k) => k + 1);
  }, [lessonJlpt, lessonNoFromQuery]);

  const handleQuizRegenerate = useCallback(() => {
    setQuizGenKey((k) => k + 1);
  }, []);

  const [studyQueue, setStudyQueue] = useState([]);
  const [flashSessionKey, setFlashSessionKey] = useState(0);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashRevealed, setFlashRevealed] = useState(false);

  useEffect(() => {
    if (lessonTab !== "flash") return;
    if (!lessonItemsStable.length) {
      setStudyQueue([]);
      setFlashIndex(0);
      setFlashRevealed(false);
      return;
    }
    setStudyQueue(shuffleVocabStudy([...lessonItemsStable]));
    setFlashIndex(0);
    setFlashRevealed(false);
  }, [
    lessonTab,
    lessonItemsStable,
    flashSessionKey,
    lessonNoFromQuery,
    lessonJlpt,
  ]);

  const flashTotal = studyQueue.length;
  const flashDone = flashTotal > 0 && flashIndex >= flashTotal;
  const flashCurrent = !flashDone ? studyQueue[flashIndex] : null;
  const flashMeaning = flashCurrent ? vocabMeaningLine(flashCurrent, lang) : "";
  const flashProgressPct =
    flashTotal === 0
      ? 0
      : flashDone
        ? 100
        : Math.round((flashIndex / flashTotal) * 100);

  const restartFlashSession = useCallback(() => {
    setFlashSessionKey((k) => k + 1);
  }, []);

  const toggleFlashReveal = useCallback(() => {
    setFlashRevealed((r) => !r);
  }, []);

  const handleFlashKnow = useCallback(() => {
    setFlashRevealed(false);
    setFlashIndex((i) => i + 1);
  }, []);

  const handleFlashReviewAgain = useCallback(() => {
    setStudyQueue((q) => {
      if (flashIndex >= q.length) return q;
      const item = q[flashIndex];
      return [...q.slice(0, flashIndex), ...q.slice(flashIndex + 1), item];
    });
    setFlashRevealed(false);
  }, [flashIndex]);

  const handleFlashReviewSoon = useCallback(() => {
    setStudyQueue((q) => {
      if (flashIndex >= q.length) return q;
      const item = q[flashIndex];
      const rest = [...q.slice(0, flashIndex), ...q.slice(flashIndex + 1)];
      const offset = Math.min(
        Math.max(2, Math.floor(rest.length / 4)),
        Math.max(rest.length - 1, 0),
      );
      const insertAt = Math.min(flashIndex + offset, rest.length);
      return [...rest.slice(0, insertAt), item, ...rest.slice(insertAt)];
    });
    setFlashRevealed(false);
  }, [flashIndex]);

  const goFlashPrev = useCallback(() => {
    setFlashIndex((i) => Math.max(0, i - 1));
    setFlashRevealed(false);
  }, []);

  const goFlashNext = useCallback(() => {
    setFlashRevealed(false);
    setFlashIndex((i) => Math.min(flashTotal - 1, i + 1));
  }, [flashTotal]);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const milestoneLitCount = useMemo(
    () => getLessonMilestoneLitCount(growthStage),
    [growthStage],
  );

  if (!isLessonMode) {
    return <Navigate to="/vocabulary/browse" replace />;
  }

  return (
    <Layout
      userName={headerName}
      footerQuote={t("vocabStudyPage.motivateFooter")}
      streakDays={mockStreak.days}
      pageClassName="vocab-dash"
    >
      <div className="vocab-study-breadcrumb-row vocab-study-breadcrumb-row--solo">
              <Breadcrumb
                items={[
                  { label: t("breadcrumb.home"), to: "/", end: true },
                  {
                    label: t("breadcrumb.vocabulary"),
                    to: "/vocabulary/browse",
                  },
                  {
                    label: t("vocabStudyPage.lessonBreadcrumb", {
                      n: lessonNoFromQuery,
                      jlpt: lessonJlpt,
                    }),
                  },
                ]}
              />
            </div>

            <div className="vocab-study-lesson-ribbon" role="status">
              <p className="vocab-study-lesson-ribbon-main">
                {t("vocabStudyPage.lessonRibbon", {
                  n: lessonNoFromQuery,
                  jlpt: lessonJlpt,
                })}
              </p>
              <div className="vocab-study-growth-strip" aria-hidden>
                {[
                  "plant-seed.png",
                  "plant-sprout.png",
                  "plant-bud.png",
                  "plant-flower.png",
                ].map((file, i) => (
                  <img
                    key={file}
                    className={`vocab-study-growth-ico${i < milestoneLitCount ? " is-lit" : ""}`}
                    src={`/assets/vocabulary/list/${file}`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
              <p className="vocab-study-growth-caption">
                {t("vocabStudyPage.growthCaption", {
                  stageName: t(`vocabPage.growthStageName.${growthStage}`),
                })}
              </p>
            </div>

            <div
              className="vocab-study-lesson-tabs"
              role="tablist"
              aria-label={t("vocabStudyPage.lessonTabsAria")}
            >
              <button
                type="button"
                role="tab"
                aria-selected={lessonTab === "detail"}
                className={`vocab-study-tab${lessonTab === "detail" ? " is-active" : ""}`}
                onClick={() => setLessonTab("detail")}
              >
                {t("vocabStudyPage.tabDetail")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={lessonTab === "flash"}
                className={`vocab-study-tab${lessonTab === "flash" ? " is-active" : ""}`}
                onClick={() => setLessonTab("flash")}
              >
                {t("vocabStudyPage.tabFlash")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={lessonTab === "quiz"}
                className={`vocab-study-tab${lessonTab === "quiz" ? " is-active" : ""}`}
                onClick={() => setLessonTab("quiz")}
              >
                {t("vocabStudyPage.tabQuiz")}
              </button>
            </div>

            <article
              className="vocab-sheet vocab-scope vocab-notebook vocab-study-scope vocab-study-scrap-scope"
              aria-labelledby="vocab-study-title"
            >
              {lessonTab === "detail" ? (
                <div className="vocab-lesson-detail-board">
                  <h1
                    id="vocab-study-title"
                    className="scrap-flash-title vocab-lesson-panel-title"
                  >
                    {t("vocabStudyPage.lessonDetailTitle", {
                      n: lessonNoFromQuery,
                      jlpt: lessonJlpt,
                    })}
                  </h1>
                  {lessonItemsStable.length === 0 ? (
                    <p className="vocab-empty" role="status">
                      {t("vocabStudyPage.emptyLesson")}
                    </p>
                  ) : (
                    <ul className="vocab-lesson-detail-list">
                      {lessonItemsStable.map((row) => {
                        const rowMean = vocabMeaningLine(row, lang);
                        return (
                          <li key={row.id} className="vocab-lesson-detail-card">
                            <div className="vocab-lesson-detail-top" lang="ja">
                              <span className="vocab-lesson-detail-word">
                                {row.surface}
                              </span>
                              <span className="vocab-lesson-detail-read">
                                {row.reading}
                              </span>
                            </div>
                            <p className="vocab-lesson-detail-mean">
                              {rowMean}
                            </p>
                            <div
                              className="vocab-lesson-detail-ex"
                              lang="ja"
                              dangerouslySetInnerHTML={{
                                __html: row.exampleJaHtml,
                              }}
                            />
                            {showViGloss ? (
                              <p className="vocab-lesson-detail-exvi" lang="vi">
                                {row.exampleVi}
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : lessonTab === "flash" ? (
                <>
                  {flashCurrent ? (
                    <div className="vocab-study-scrap-board">
                      <div className="vocab-scrap-hole-rail" aria-hidden />

                      <header className="vocab-study-scrap-head">
                        <div className="scrap-jlpt-sticky" lang="ja">
                          {t("vocabDetailPage.jlptWordTag", {
                            level: flashCurrent.jlpt,
                          })}
                        </div>
                        <div className="scrap-head-center">
                          <h1
                            id="vocab-study-title"
                            className="scrap-flash-title"
                          >
                            <span>
                              {t("vocabStudyPage.lessonScrapTitle", {
                                n: lessonNoFromQuery,
                                jlpt: lessonJlpt,
                              })}
                            </span>
                          </h1>
                        </div>
                        <aside
                          className="scrap-progress-box"
                          aria-live="polite"
                        >
                          <div className="scrap-progress-label">
                            {t("vocabStudyPage.progressLabel")}
                          </div>
                          <div className="scrap-progress-value">
                            {t("vocabStudyPage.progressNums", {
                              current: flashIndex + 1,
                              total: flashTotal,
                            })}
                          </div>
                          <div className="scrap-progress-track">
                            <div
                              className="scrap-progress-fill"
                              style={{ width: `${flashProgressPct}%` }}
                            />
                          </div>
                        </aside>
                      </header>

                      <div className="vocab-study-card-wrap">
                        <div className="vocab-study-stack-paper" aria-hidden />

                        <div
                          className={`vocab-study-card vocab-study-card--scrap${flashRevealed ? " vocab-study-card--back" : " vocab-study-card--front"}`}
                        >
                          {!flashRevealed ? (
                            <>
                              <p className="vocab-study-card-flag">
                                {t("vocabStudyPage.reviewBadge")}
                              </p>
                              <button
                                type="button"
                                className="vocab-study-card-tap-zone"
                                onClick={toggleFlashReveal}
                                aria-expanded={false}
                                aria-label={t("vocabStudyPage.revealLabel")}
                              >
                                <p
                                  className="vocab-study-card-word vocab-study-card-word--kanji-only"
                                  lang="ja"
                                >
                                  {flashCurrent.surface}
                                </p>
                                <div className="vocab-study-front-prompt">
                                  <span className="vocab-study-front-prompt-line1">
                                    {t("vocabStudyPage.tapPromptLine1")}
                                  </span>
                                  <span className="vocab-study-front-prompt-line2">
                                    {t("vocabStudyPage.tapPromptLine2")}
                                  </span>
                                </div>
                              </button>
                              <div className="vocab-study-card-tools">
                                <button
                                  type="button"
                                  className="vocab-icon-btn vocab-icon-btn--scrap"
                                  aria-label={t("vocabPage.playAudioAria")}
                                >
                                  <VocabSpeakerIcon />
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="vocab-study-card-tap-zone vocab-study-card-tap-zone--back"
                                onClick={toggleFlashReveal}
                                aria-expanded={true}
                                aria-label={t("vocabStudyPage.flipBackAria")}
                              >
                                <div className="vocab-study-reveal-zone vocab-study-reveal-zone--back">
                                  <section
                                    className="vocab-study-meaning-sheet"
                                    aria-labelledby={`vocab-flash-mean-${flashCurrent.id}`}
                                  >
                                    <p
                                      id={`vocab-flash-mean-${flashCurrent.id}`}
                                      className="vocab-study-sheet-label"
                                    >
                                      {t("vocabPage.meaningLabel")}
                                    </p>
                                    {showViGloss ? (
                                      <div className="vocab-study-meaning-stack">
                                        <p
                                          className="vocab-study-meaning-ja"
                                          lang="ja"
                                        >
                                          {flashCurrent.meaningJa}
                                        </p>
                                        <p
                                          className="vocab-study-meaning-vi-below"
                                          lang="vi"
                                        >
                                          {flashCurrent.meaningVi}
                                        </p>
                                      </div>
                                    ) : (
                                      <p
                                        className="vocab-study-meaning-single"
                                        lang="ja"
                                      >
                                        {flashMeaning}
                                      </p>
                                    )}
                                  </section>

                                  <section
                                    className="vocab-study-example-sheet"
                                    aria-labelledby={`vocab-flash-ex-${flashCurrent.id}`}
                                  >
                                    <p
                                      id={`vocab-flash-ex-${flashCurrent.id}`}
                                      className="vocab-study-sheet-label"
                                    >
                                      {t("vocabPage.exampleLabel")}
                                    </p>
                                    <div
                                      className="vocab-study-example-ja-block"
                                      lang="ja"
                                      dangerouslySetInnerHTML={{
                                        __html: flashCurrent.exampleJaHtml,
                                      }}
                                    />
                                    {showViGloss ? (
                                      <p
                                        className="vocab-study-example-vi-below"
                                        lang="vi"
                                      >
                                        {flashCurrent.exampleVi}
                                      </p>
                                    ) : null}
                                  </section>
                                </div>
                              </button>
                              <div className="vocab-study-card-tools">
                                <button
                                  type="button"
                                  className="vocab-icon-btn vocab-icon-btn--scrap"
                                  aria-label={t("vocabPage.playAudioAria")}
                                >
                                  <VocabSpeakerIcon />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {flashRevealed ? (
                        <div className="vocab-study-rate-strip vocab-study-rate-strip--lesson">
                          <p className="vocab-study-rate-hint">
                            <span
                              className="vocab-study-rate-hint-icon"
                              aria-hidden
                            >
                              💡
                            </span>
                            {t("vocabStudyPage.rateHint")}
                          </p>
                          <div
                            className="vocab-study-rate-row"
                            role="group"
                            aria-label={t("vocabStudyPage.rateHint")}
                          >
                            <button
                              type="button"
                              className="vocab-study-rate-tile vocab-study-rate-tile--rose vocab-cta-reset"
                              onClick={handleFlashReviewAgain}
                            >
                              <span
                                className="vocab-study-rate-emoji"
                                aria-hidden
                              >
                                😢
                              </span>
                              <span className="vocab-study-rate-tile-title">
                                {t("vocabStudyPage.rateForgotTitle")}
                              </span>
                              <span className="vocab-study-rate-tile-sub">
                                {t("vocabStudyPage.rateForgotSub")}
                              </span>
                            </button>
                            <button
                              type="button"
                              className="vocab-study-rate-tile vocab-study-rate-tile--honey vocab-cta-reset"
                              onClick={handleFlashReviewSoon}
                            >
                              <span
                                className="vocab-study-rate-emoji"
                                aria-hidden
                              >
                                🤔
                              </span>
                              <span className="vocab-study-rate-tile-title">
                                {t("vocabStudyPage.rateSoonTitle")}
                              </span>
                              <span className="vocab-study-rate-tile-sub">
                                {t("vocabStudyPage.rateSoonSub")}
                              </span>
                            </button>
                            <button
                              type="button"
                              className="vocab-study-rate-tile vocab-study-rate-tile--mint vocab-cta-reset"
                              onClick={handleFlashKnow}
                            >
                              <span
                                className="vocab-study-rate-emoji"
                                aria-hidden
                              >
                                😎
                              </span>
                              <span className="vocab-study-rate-tile-title">
                                {t("vocabStudyPage.rateKnowTitle")}
                              </span>
                              <span className="vocab-study-rate-tile-sub">
                                {t("vocabStudyPage.rateKnowSub")}
                              </span>
                            </button>
                          </div>
                        </div>
                      ) : null}

                      <div className="vocab-study-foot-nav">
                        <button
                          type="button"
                          className="vocab-study-nav-pill vocab-cta-reset"
                          onClick={goFlashPrev}
                          disabled={flashIndex <= 0}
                        >
                          ← {t("vocabStudyPage.navPrev")}
                        </button>
                        <p
                          className="vocab-study-foot-count"
                          aria-live="polite"
                        >
                          {t("vocabStudyPage.progressNums", {
                            current: flashIndex + 1,
                            total: flashTotal,
                          })}
                        </p>
                        <button
                          type="button"
                          className="vocab-study-nav-pill vocab-cta-reset"
                          onClick={goFlashNext}
                          disabled={
                            flashIndex >= flashTotal - 1 || flashTotal === 0
                          }
                        >
                          {t("vocabStudyPage.navNext")} →
                        </button>
                      </div>
                    </div>
                  ) : flashDone ? (
                    <div className="vocab-study-done">
                      <div className="vocab-study-done-ico" aria-hidden>
                        ✿
                      </div>
                      <h1
                        id="vocab-study-title"
                        className="scrap-flash-title vocab-lesson-panel-title"
                      >
                        {t("vocabStudyPage.doneTitle")}
                      </h1>
                      <div className="vocab-study-done-actions">
                        <button
                          type="button"
                          className="vocab-cta-btn"
                          onClick={restartFlashSession}
                        >
                          {t("vocabStudyPage.btnAgainSession")}
                        </button>
                        {growthStage < VOCAB_LESSON_GROWTH_MAX ? (
                          <button
                            type="button"
                            className="vocab-cta-btn"
                            onClick={() => setLessonTab("quiz")}
                          >
                            {t("vocabStudyPage.doneGoQuiz")}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <p className="vocab-empty" role="status">
                      {t("vocabStudyPage.emptyLesson")}
                    </p>
                  )}
                </>
              ) : (
                <div className="vocab-lesson-quiz-board">
                  <h1
                    id="vocab-study-title"
                    className="scrap-flash-title vocab-lesson-panel-title"
                  >
                    {t("vocabStudyPage.quizBoardTitle")}
                  </h1>
                  <p className="vocab-lesson-quiz-intro">
                    {t("vocabStudyPage.quizIntro", { n: VOCAB_QUIZ_PER_STAGE })}
                  </p>
                  <VocabularyLessonQuiz
                    key={quizGenKey}
                    questions={quizQuestions}
                    growthStage={growthStage}
                    onPerfect={handleQuizPerfect}
                    onRegenerate={handleQuizRegenerate}
                    t={t}
                  />
                </div>
              )}
            </article>
    </Layout>
  );
}

/** `/vocabulary` — chuyển query cũ `?lesson=&jlpt=` hoặc về danh sách bài. */
export function VocabularyIndexRedirect() {
  const [searchParams] = useSearchParams();
  const lesson = searchParams.get("lesson");
  const jlpt = (searchParams.get("jlpt") || "").trim();
  const n = parseInt(lesson || "", 10);
  if (Number.isFinite(n) && n >= 1 && jlpt) {
    return (
      <Navigate
        to={`/vocabulary/lesson/${n}?jlpt=${encodeURIComponent(jlpt)}`}
        replace
      />
    );
  }
  return <Navigate to="/vocabulary/browse" replace />;
}
