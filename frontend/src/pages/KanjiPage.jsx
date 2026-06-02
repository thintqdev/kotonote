import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  buildKanjiLessonQuizQuestions,
  mergeKanjiMarks,
  kanjiMeaningLine,
  KANJI_LESSON_GROWTH_MAX,
  KANJI_QUIZ_PER_STAGE,
} from "../data/kanjiMock.js";
import {
  advanceKanjiDeckProgress,
  getKanjiDeckProgress,
} from "../services/kanjiProgressService.js";
import { getDeckWithKanji, loadKanjiPack } from "../services/kanjiService.js";
import {
  getDeckLessonItems,
  isDeckLessonUnlocked,
  mapKanjiRecord,
  sortDeckItemsByDisplayOrder,
} from "../utils/deckStudy.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { useJlptAccess } from "../hooks/useJlptAccess.js";
import { isJlptLockedError } from "../utils/jlptAccess.js";
import JlptLockGate from "../components/study/JlptLockGate.jsx";
import { shuffleVocabStudy, getLessonMilestoneLitCount } from "../data/vocabularyMock.js";
import VocabularyLessonQuiz from "./VocabularyLessonQuiz.jsx";
import AlphaPracticePad from "../components/alphabet/AlphaPracticePad.jsx";
import KanjiStrokeAnimation from "../components/kanji/KanjiStrokeAnimation.jsx";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./VocabularyPage.css";

function KanjiSpeakerIcon() {
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

export default function KanjiPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isLocked } = useJlptAccess();
  const lang = i18n.language || "ja";
  const [marks] = useState(() => ({}));
  const [packItems, setPackItems] = useState([]);
  const [sortedDecks, setSortedDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  const deckId = useMemo(
    () => (searchParams.get("deckId") || "").trim(),
    [searchParams],
  );
  const isUserDeck = searchParams.get("userDeck") === "1";
  const isLessonMode = Boolean(
    lessonNoFromQuery != null && lessonJlpt.length > 0,
  );

  useEffect(() => {
    if (!user || !lessonJlpt || !isLessonMode) {
      setLoading(false);
      return;
    }
    if (isLocked(lessonJlpt)) {
      setLoading(false);
      setError("");
      setSortedDecks([]);
      setPackItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        if (deckId) {
          const { deck, kanji } = await getDeckWithKanji(deckId);
          const jlpt = lessonJlpt || deck.jlpt;
          const items = sortDeckItemsByDisplayOrder(
            kanji.map((k) => mapKanjiRecord(k, jlpt, deckId)),
          );
          if (!cancelled) {
            setSortedDecks([deck]);
            setPackItems(items);
          }
        } else {
          const pack = await loadKanjiPack(lessonJlpt);
          if (!cancelled) {
            setSortedDecks(pack.decks);
            setPackItems(pack.items);
          }
        }
      } catch (err) {
        if (!cancelled && !isJlptLockedError(err)) {
          setError(getApiErrorMessage(err, t));
          setSortedDecks([]);
          setPackItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, lessonJlpt, deckId, isLessonMode, isLocked, t]);

  const merged = useMemo(
    () => mergeKanjiMarks(packItems, marks),
    [packItems, marks],
  );

  const lessonUnlocked = useMemo(
    () => {
      if (isUserDeck) return true;
      return isLessonMode && lessonNoFromQuery
        ? isDeckLessonUnlocked(sortedDecks, merged, lessonNoFromQuery)
        : false;
    },
    [isUserDeck, merged, sortedDecks, isLessonMode, lessonNoFromQuery],
  );

  const lessonItemsStable = useMemo(() => {
    if (!isLessonMode || !lessonNoFromQuery) return [];
    if (deckId) {
      return sortDeckItemsByDisplayOrder(
        merged.filter((x) => String(x.deckId) === String(deckId)),
      );
    }
    return getDeckLessonItems(merged, sortedDecks, lessonNoFromQuery);
  }, [merged, sortedDecks, deckId, isLessonMode, lessonNoFromQuery]);

  const effectiveDeckId = useMemo(() => {
    if (deckId) return deckId;
    if (!lessonNoFromQuery || !sortedDecks.length) return "";
    const deck = sortedDecks[lessonNoFromQuery - 1];
    return deck?._id ? String(deck._id) : "";
  }, [deckId, lessonNoFromQuery, sortedDecks]);

  const [growthStage, setGrowthStage] = useState(0);
  useEffect(() => {
    if (!user || !isLessonMode || !effectiveDeckId) {
      setGrowthStage(0);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const row = await getKanjiDeckProgress(effectiveDeckId);
        if (!cancelled) {
          setGrowthStage(
            typeof row.growthStage === "number" ? row.growthStage : 0,
          );
        }
      } catch {
        if (!cancelled) setGrowthStage(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isLessonMode, effectiveDeckId]);

  const [lessonTab, setLessonTab] = useState("detail");
  useEffect(() => {
    if (isLessonMode) setLessonTab("detail");
  }, [isLessonMode, lessonJlpt, lessonNoFromQuery]);

  const [quizGenKey, setQuizGenKey] = useState(0);
  const quizQuestions = useMemo(
    () =>
      buildKanjiLessonQuizQuestions(merged, lessonItemsStable, {
        lang,
        count: KANJI_QUIZ_PER_STAGE,
      }),
    [merged, lessonItemsStable, lang, quizGenKey],
  );

  const handleQuizPerfect = useCallback(async () => {
    if (!effectiveDeckId) return;
    try {
      const row = await advanceKanjiDeckProgress(effectiveDeckId);
      if (typeof row.growthStage === "number") {
        setGrowthStage(row.growthStage);
      }
      setQuizGenKey((k) => k + 1);
    } catch {
      // giữ stage hiện tại nếu API lỗi
    }
  }, [effectiveDeckId]);

  const handleQuizRegenerate = useCallback(() => {
    setQuizGenKey((k) => k + 1);
  }, []);

  const getQuizModeLabel = useCallback(
    (mode) => {
      if (mode === "char_from_meaning")
        return t("kanjiStudyPage.quizModePickCharFromMeaning");
      if (mode === "reading_from_char")
        return t("kanjiStudyPage.quizModePickReadingFromChar");
      return t("kanjiStudyPage.quizModePickMeaningFromChar");
    },
    [t],
  );

  const [studyQueue, setStudyQueue] = useState([]);
  const [flashSessionKey, setFlashSessionKey] = useState(0);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashRevealed, setFlashRevealed] = useState(false);
  const [writeIndex, setWriteIndex] = useState(0);
  const [writeReplayTick, setWriteReplayTick] = useState(0);
  const [writeClearTick, setWriteClearTick] = useState(0);

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
  const flashMeaning = flashCurrent ? kanjiMeaningLine(flashCurrent, lang) : "";
  const flashProgressPct =
    flashTotal === 0
      ? 0
      : flashDone
        ? 100
        : Math.round((flashIndex / flashTotal) * 100);

  useEffect(() => {
    if (lessonTab !== "write") return;
    setWriteIndex(0);
    setWriteReplayTick(0);
    setWriteClearTick(0);
  }, [lessonTab, lessonNoFromQuery, lessonJlpt]);

  const writeTotal = lessonItemsStable.length;
  const writeCurrent =
    writeIndex >= 0 && writeIndex < writeTotal ? lessonItemsStable[writeIndex] : null;

  const goWritePrev = useCallback(() => {
    setWriteIndex((i) => Math.max(0, i - 1));
  }, []);

  const goWriteNext = useCallback(() => {
    setWriteIndex((i) => Math.min(writeTotal - 1, i + 1));
  }, [writeTotal]);

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
    return <Navigate to="/kanji/browse" replace />;
  }

  if (loading) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days}>
        <p className="vocab-empty">{t("common.loading")}</p>
      </Layout>
    );
  }

  if (isLocked(lessonJlpt)) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days}>
        <JlptLockGate jlpt={lessonJlpt} forceLocked>
          <span />
        </JlptLockGate>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days}>
        <p className="vocab-empty grammar-empty--error" role="alert">
          {error}
        </p>
      </Layout>
    );
  }

  if (!lessonUnlocked && !isUserDeck) {
    return <Navigate to="/kanji/browse" replace />;
  }

  if (lessonItemsStable.length === 0 && !isUserDeck) {
    return <Navigate to="/kanji/browse" replace />;
  }

  if (isUserDeck && lessonItemsStable.length === 0 && !loading) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days}>
        <p className="vocab-empty">{t("kanjiPage.userDeckStudyEmpty")}</p>
        <p>
          <Link
            to={`/kanji/mine/${encodeURIComponent(deckId || effectiveDeckId)}/edit`}
            className="admin-grammar-btn admin-grammar-btn--primary"
          >
            {t("kanjiPage.userDeckEdit")}
          </Link>
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
      <div className="vocab-study-breadcrumb-row vocab-study-breadcrumb-row--solo">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), to: "/", end: true },
            {
              label: t("breadcrumb.kanji"),
              to: isUserDeck ? "/kanji/mine" : "/kanji/browse",
            },
            isUserDeck
              ? {
                  label:
                    sortedDecks[0]?.titleVi ?? t("kanjiPage.userDeckStudyBreadcrumb"),
                }
              : {
                  label: t("kanjiStudyPage.lessonBreadcrumb", {
                    n: lessonNoFromQuery,
                    jlpt: lessonJlpt,
                  }),
                },
          ]}
        />
      </div>

      <div className="vocab-study-lesson-ribbon" role="status">
        <p className="vocab-study-lesson-ribbon-main">
          {t("kanjiStudyPage.lessonRibbon", {
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
          {t("kanjiStudyPage.growthCaption", {
            stageName: t(`kanjiPage.growthStageName.${growthStage}`),
          })}
        </p>
      </div>

      <div
        className="vocab-study-lesson-tabs"
        role="tablist"
        aria-label={t("kanjiStudyPage.lessonTabsAria")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={lessonTab === "detail"}
          className={`vocab-study-tab${lessonTab === "detail" ? " is-active" : ""}`}
          onClick={() => setLessonTab("detail")}
        >
          {t("kanjiStudyPage.tabDetail")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={lessonTab === "flash"}
          className={`vocab-study-tab${lessonTab === "flash" ? " is-active" : ""}`}
          onClick={() => setLessonTab("flash")}
        >
          {t("kanjiStudyPage.tabFlash")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={lessonTab === "quiz"}
          className={`vocab-study-tab${lessonTab === "quiz" ? " is-active" : ""}`}
          onClick={() => setLessonTab("quiz")}
        >
          {t("kanjiStudyPage.tabQuiz")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={lessonTab === "write"}
          className={`vocab-study-tab${lessonTab === "write" ? " is-active" : ""}`}
          onClick={() => setLessonTab("write")}
        >
          {t("kanjiStudyPage.tabWrite")}
        </button>
      </div>

      <article
        className="vocab-sheet vocab-scope vocab-notebook vocab-study-scope vocab-study-scrap-scope"
        aria-labelledby="kanji-study-title"
      >
        {lessonTab === "detail" ? (
          <div className="vocab-lesson-detail-board kanji-detail-board">
            <h1
              id="kanji-study-title"
              className="scrap-flash-title vocab-lesson-panel-title"
            >
              {t("kanjiStudyPage.lessonDetailTitle", {
                n: lessonNoFromQuery,
                jlpt: lessonJlpt,
              })}
            </h1>
            {lessonItemsStable.length === 0 ? (
              <p className="vocab-empty" role="status">
                {t("kanjiStudyPage.emptyLesson")}
              </p>
            ) : (
              <ul className="vocab-lesson-detail-list kanji-detail-list">
                {lessonItemsStable.map((row) => (
                  <li key={row.id} className="kanji-detail-item">
                    <div className="kanji-detail-char-wrap">
                      <span className="kanji-detail-char" lang="ja">
                        {row.char}
                      </span>
                      <p className="kanji-underglyph-hv" lang="vi">
                        {row.hanViet}
                      </p>
                    </div>

                    <div
                      className="kanji-flash-onkun"
                      role="group"
                      aria-label={t("kanjiStudyPage.flashOnKunAria")}
                    >
                      <div className="kanji-flash-cell kanji-flash-cell--on">
                        <span className="kanji-flash-cell-label">
                          {t("kanjiStudyPage.flashLabelOn")}
                        </span>
                        <p className="kanji-flash-cell-value" lang="ja">
                          {row.onYomi}
                        </p>
                      </div>
                      <div className="kanji-flash-onkun-rule" aria-hidden />
                      <div className="kanji-flash-cell kanji-flash-cell--kun">
                        <span className="kanji-flash-cell-label">
                          {t("kanjiStudyPage.flashLabelKun")}
                        </span>
                        <p className="kanji-flash-cell-value" lang="ja">
                          {row.kunYomi}
                        </p>
                      </div>
                    </div>

                    <p className="kanji-flash-mean kanji-detail-mean" lang="vi">
                      {kanjiMeaningLine(row, lang)}
                    </p>

                    <p className="kanji-flash-vocab kanji-detail-vocab" lang="ja">
                      {row.vocabJa}
                    </p>

                    <div className="kanji-flash-examples kanji-detail-examples">
                      <p lang="ja">{row.exampleJa}</p>
                      <p lang="vi">{row.exampleVi}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : lessonTab === "flash" ? (
          <>
            {flashCurrent ? (
              <div className="vocab-study-scrap-board vocab-study-scrap-board--kanji">
                <div className="vocab-scrap-hole-rail" aria-hidden />

                <header className="vocab-study-scrap-head">
                  <div className="scrap-jlpt-sticky" lang="ja">
                    {t("kanjiStudyPage.jlptTag", { level: flashCurrent.jlpt })}
                  </div>
                  <div className="scrap-head-center">
                    <h1 id="kanji-study-title" className="scrap-flash-title">
                      <span>
                        {t("kanjiStudyPage.lessonScrapTitle", {
                          n: lessonNoFromQuery,
                          jlpt: lessonJlpt,
                        })}
                      </span>
                    </h1>
                  </div>
                  <aside className="scrap-progress-box" aria-live="polite">
                    <div className="scrap-progress-label">
                      {t("kanjiStudyPage.progressLabel")}
                    </div>
                    <div className="scrap-progress-value">
                      {t("kanjiStudyPage.progressNums", {
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
                    className={`vocab-study-card vocab-study-card--scrap vocab-study-card--kanji-flash${flashRevealed ? " vocab-study-card--back" : " vocab-study-card--front"}`}
                  >
                    {!flashRevealed ? (
                      <>
                        <button
                          type="button"
                          className="vocab-study-card-tap-zone"
                          onClick={toggleFlashReveal}
                          aria-expanded={false}
                          aria-label={t("kanjiStudyPage.revealLabel")}
                        >
                          <p
                            className="vocab-study-card-word vocab-study-card-word--kanji-only"
                            lang="ja"
                          >
                            {flashCurrent.char}
                          </p>
                          <div className="vocab-study-front-prompt">
                            <span className="vocab-study-front-prompt-line1">
                              {t("kanjiStudyPage.tapPromptLine1")}
                            </span>
                            <span className="vocab-study-front-prompt-line2">
                              {t("kanjiStudyPage.tapPromptLine2")}
                            </span>
                          </div>
                        </button>
                        <div className="vocab-study-card-tools">
                          <button
                            type="button"
                            className="vocab-icon-btn vocab-icon-btn--scrap"
                            aria-label={t("kanjiStudyPage.playAudioAria")}
                          >
                            <KanjiSpeakerIcon />
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
                          aria-label={t("kanjiStudyPage.flipBackAria")}
                        >
                          <div className="vocab-study-reveal-zone vocab-study-reveal-zone--back kanji-flash-back">
                            <div className="kanji-flash-headglyph">
                              <span
                                className="kanji-flash-headglyph-char"
                                lang="ja"
                              >
                                {flashCurrent.char}
                              </span>
                              <p className="kanji-underglyph-hv" lang="vi">
                                {flashCurrent.hanViet}
                              </p>
                            </div>

                            <div
                              className="kanji-flash-onkun"
                              role="group"
                              aria-label={t("kanjiStudyPage.flashOnKunAria")}
                            >
                              <div className="kanji-flash-cell kanji-flash-cell--on">
                                <span className="kanji-flash-cell-label">
                                  {t("kanjiStudyPage.flashLabelOn")}
                                </span>
                                <p
                                  className="kanji-flash-cell-value"
                                  lang="ja"
                                >
                                  {flashCurrent.onYomi}
                                </p>
                              </div>
                              <div
                                className="kanji-flash-onkun-rule"
                                aria-hidden
                              />
                              <div className="kanji-flash-cell kanji-flash-cell--kun">
                                <span className="kanji-flash-cell-label">
                                  {t("kanjiStudyPage.flashLabelKun")}
                                </span>
                                <p
                                  className="kanji-flash-cell-value"
                                  lang="ja"
                                >
                                  {flashCurrent.kunYomi}
                                </p>
                              </div>
                            </div>

                            <p className="kanji-flash-mean" lang="vi">
                              {flashMeaning}
                            </p>

                            <p className="kanji-flash-vocab" lang="ja">
                              {flashCurrent.vocabJa}
                            </p>

                            <div className="kanji-flash-examples">
                              <p lang="ja">{flashCurrent.exampleJa}</p>
                              <p lang="vi">{flashCurrent.exampleVi}</p>
                            </div>
                          </div>
                        </button>
                        <div className="vocab-study-card-tools">
                          <button
                            type="button"
                            className="vocab-icon-btn vocab-icon-btn--scrap"
                            aria-label={t("kanjiStudyPage.playAudioAria")}
                          >
                            <KanjiSpeakerIcon />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {flashRevealed ? (
                  <div className="vocab-study-rate-strip vocab-study-rate-strip--lesson">
                    <p className="vocab-study-rate-hint">
                      {t("kanjiStudyPage.rateHint")}
                    </p>
                    <div
                      className="vocab-study-rate-row"
                      role="group"
                      aria-label={t("kanjiStudyPage.rateHint")}
                    >
                      <button
                        type="button"
                        className="vocab-study-rate-tile vocab-study-rate-tile--rose vocab-cta-reset"
                        onClick={handleFlashReviewAgain}
                      >
                        <span className="vocab-study-rate-tile-title">
                          {t("kanjiStudyPage.rateForgotTitle")}
                        </span>
                        <span className="vocab-study-rate-tile-sub">
                          {t("kanjiStudyPage.rateForgotSub")}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="vocab-study-rate-tile vocab-study-rate-tile--honey vocab-cta-reset"
                        onClick={handleFlashReviewSoon}
                      >
                        <span className="vocab-study-rate-tile-title">
                          {t("kanjiStudyPage.rateSoonTitle")}
                        </span>
                        <span className="vocab-study-rate-tile-sub">
                          {t("kanjiStudyPage.rateSoonSub")}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="vocab-study-rate-tile vocab-study-rate-tile--mint vocab-cta-reset"
                        onClick={handleFlashKnow}
                      >
                        <span className="vocab-study-rate-tile-title">
                          {t("kanjiStudyPage.rateKnowTitle")}
                        </span>
                        <span className="vocab-study-rate-tile-sub">
                          {t("kanjiStudyPage.rateKnowSub")}
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
                    ← {t("kanjiStudyPage.navPrev")}
                  </button>
                  <p className="vocab-study-foot-count" aria-live="polite">
                    {t("kanjiStudyPage.progressNums", {
                      current: flashIndex + 1,
                      total: flashTotal,
                    })}
                  </p>
                  <button
                    type="button"
                    className="vocab-study-nav-pill vocab-cta-reset"
                    onClick={goFlashNext}
                    disabled={flashIndex >= flashTotal - 1 || flashTotal === 0}
                  >
                    {t("kanjiStudyPage.navNext")} →
                  </button>
                </div>
              </div>
            ) : flashDone ? (
              <div className="vocab-study-done">
                <div className="vocab-study-done-ico" aria-hidden>
                  ✿
                </div>
                <h1
                  id="kanji-study-title"
                  className="scrap-flash-title vocab-lesson-panel-title"
                >
                  {t("kanjiStudyPage.doneTitle")}
                </h1>
                <div className="vocab-study-done-actions">
                  <button
                    type="button"
                    className="vocab-cta-btn"
                    onClick={restartFlashSession}
                  >
                    {t("kanjiStudyPage.btnAgainSession")}
                  </button>
                  {growthStage < KANJI_LESSON_GROWTH_MAX ? (
                    <button
                      type="button"
                      className="vocab-cta-btn"
                      onClick={() => setLessonTab("quiz")}
                    >
                      {t("kanjiStudyPage.doneGoQuiz")}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="vocab-empty" role="status">
                {t("kanjiStudyPage.emptyLesson")}
              </p>
            )}
          </>
        ) : lessonTab === "quiz" ? (
          <div className="vocab-lesson-quiz-board kanji-lesson-quiz-board">
            <h1
              id="kanji-study-title"
              className="scrap-flash-title vocab-lesson-panel-title"
            >
              {t("kanjiStudyPage.quizBoardTitle")}
            </h1>
            <p className="vocab-lesson-quiz-intro">
              {t("kanjiStudyPage.quizIntro", { n: KANJI_QUIZ_PER_STAGE })}
            </p>
            <VocabularyLessonQuiz
              key={quizGenKey}
              questions={quizQuestions}
              growthStage={growthStage}
              growthMax={KANJI_LESSON_GROWTH_MAX}
              scoreTotal={KANJI_QUIZ_PER_STAGE}
              getQuizModeLabel={getQuizModeLabel}
              resultPerfectTitle={t("kanjiStudyPage.quizResultPerfectTitle", {
                n: KANJI_QUIZ_PER_STAGE,
              })}
              needPerfectHint={t("kanjiStudyPage.quizNeedPerfect", {
                n: KANJI_QUIZ_PER_STAGE,
              })}
              quizFlowerDoneText={t("kanjiStudyPage.quizFlowerDone")}
              quizNoWordsText={t("kanjiStudyPage.quizNoWords")}
              onPerfect={handleQuizPerfect}
              onRegenerate={handleQuizRegenerate}
              t={t}
            />
          </div>
        ) : (
          <div className="vocab-lesson-quiz-board kanji-write-board">
            <h1
              id="kanji-study-title"
              className="scrap-flash-title vocab-lesson-panel-title"
            >
              {t("kanjiStudyPage.writeBoardTitle")}
            </h1>
            <p className="vocab-lesson-quiz-intro">
              {t("kanjiStudyPage.writeIntro")}
            </p>
            {writeCurrent ? (
              <div className="kanji-write-wrap">
                <div className="kanji-write-status">
                  <span className="kanji-write-char" lang="ja">
                    {writeCurrent.char}
                  </span>
                  <span className="kanji-write-progress">
                    {t("kanjiStudyPage.writeProgress", {
                      current: writeIndex + 1,
                      total: writeTotal,
                    })}
                  </span>
                </div>

                <div className="kanji-write-stroke-stage">
                  <KanjiStrokeAnimation
                    char={writeCurrent.char}
                    replayTick={writeReplayTick}
                    fallbackHint={t("kanjiStudyPage.strokeFallback")}
                  />
                </div>

                <div className="kanji-write-actions">
                  <button
                    type="button"
                    className="vocab-study-nav-pill vocab-cta-reset"
                    onClick={() => setWriteReplayTick((v) => v + 1)}
                  >
                    {t("kanjiStudyPage.replayStroke")}
                  </button>
                  <button
                    type="button"
                    className="vocab-study-nav-pill vocab-cta-reset"
                    onClick={() => setWriteClearTick((v) => v + 1)}
                  >
                    {t("kanjiStudyPage.clearPractice")}
                  </button>
                </div>

                <div className="kanji-write-grid" role="group" aria-label={t("kanjiStudyPage.writePadsAria")}>
                  <div className="kanji-write-sample-wrap">
                    <span
                      className="kanji-write-sample"
                      lang="ja"
                      aria-label={t("kanjiStudyPage.writeSampleAria", {
                        char: writeCurrent.char,
                      })}
                    >
                      {writeCurrent.char}
                    </span>
                  </div>
                  {[0, 1, 2].map((i) => (
                    <AlphaPracticePad
                      key={`${writeCurrent.char}-${i}`}
                      guideText={writeCurrent.char}
                      variant={i === 0 ? "bold" : "trace"}
                      clearTick={writeClearTick}
                      padIndex={i}
                      ariaLabel={t("kanjiStudyPage.writePadAria", {
                        n: i + 1,
                        char: writeCurrent.char,
                      })}
                      showGuide
                    />
                  ))}
                </div>

                <div className="vocab-study-foot-nav">
                  <button
                    type="button"
                    className="vocab-study-nav-pill vocab-cta-reset"
                    onClick={goWritePrev}
                    disabled={writeIndex <= 0}
                  >
                    ← {t("kanjiStudyPage.navPrev")}
                  </button>
                  <p className="vocab-study-foot-count" aria-live="polite">
                    {t("kanjiStudyPage.writeProgress", {
                      current: writeIndex + 1,
                      total: writeTotal,
                    })}
                  </p>
                  <button
                    type="button"
                    className="vocab-study-nav-pill vocab-cta-reset"
                    onClick={goWriteNext}
                    disabled={writeIndex >= writeTotal - 1}
                  >
                    {t("kanjiStudyPage.navNext")} →
                  </button>
                </div>
              </div>
            ) : (
              <p className="vocab-empty" role="status">
                {t("kanjiStudyPage.emptyLesson")}
              </p>
            )}
          </div>
        )}
      </article>
    </Layout>
  );
}

/** `/kanji` — chuyển query cũ `?lesson=&jlpt=` hoặc về danh sách bài. */
export function KanjiIndexRedirect() {
  const [searchParams] = useSearchParams();
  const lesson = searchParams.get("lesson");
  const jlpt = (searchParams.get("jlpt") || "").trim();
  const n = parseInt(lesson || "", 10);
  if (Number.isFinite(n) && n >= 1 && jlpt) {
    return (
      <Navigate
        to={`/kanji/lesson/${n}?jlpt=${encodeURIComponent(jlpt)}`}
        replace
      />
    );
  }
  return <Navigate to="/kanji/browse" replace />;
}
