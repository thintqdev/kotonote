import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Sidebar, Header, Footer, Breadcrumb } from "../components/common";
import { mockStreak, mockNotifications } from "../data/dashboardHomeMock.js";
import {
  VOCAB_ITEMS,
  STUDY_SESSION_SIZE,
  buildStudyQueue,
  mergeVocabMarks,
  vocabMeaningLine,
} from "../data/vocabularyMock.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./VocabularyStudyPage.css";

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

export default function VocabularyStudyPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language || "ja";
  const showViGloss = String(lang).toLowerCase().startsWith("vi");

  const jlptLevels = useMemo(() => {
    const order = ["N5", "N4", "N3", "N2", "N1"];
    const seen = new Set(VOCAB_ITEMS.map((x) => x.jlpt));
    return order.filter((lv) => seen.has(lv));
  }, []);

  const [marks] = useState(() => ({}));
  const merged = useMemo(() => mergeVocabMarks(VOCAB_ITEMS, marks), [marks]);

  const [deckJlpt, setDeckJlpt] = useState("");
  const [sessionKey, setSessionKey] = useState(0);
  const [studyQueue, setStudyQueue] = useState(() =>
    buildStudyQueue(mergeVocabMarks(VOCAB_ITEMS, {}), {
      jlpt: "",
      limit: STUDY_SESSION_SIZE,
    }),
  );
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setStudyQueue(
      buildStudyQueue(merged, { jlpt: deckJlpt, limit: STUDY_SESSION_SIZE }),
    );
    setIndex(0);
    setRevealed(false);
  }, [merged, deckJlpt, sessionKey]);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const total = studyQueue.length;
  const done = total > 0 && index >= total;
  const current = !done ? studyQueue[index] : null;
  const meaning = current ? vocabMeaningLine(current, lang) : "";

  const progressPct =
    total === 0 ? 0 : done ? 100 : Math.round((index / total) * 100);

  const restartSession = useCallback(() => {
    setSessionKey((k) => k + 1);
  }, []);

  const toggleReveal = useCallback(() => {
    setRevealed((r) => !r);
  }, []);

  const handleKnow = useCallback(() => {
    setRevealed(false);
    setIndex((i) => i + 1);
  }, []);

  const handleReviewAgain = useCallback(() => {
    setStudyQueue((q) => {
      if (index >= q.length) return q;
      const item = q[index];
      return [...q.slice(0, index), ...q.slice(index + 1), item];
    });
    setRevealed(false);
  }, [index]);

  /** Trả thẻ về trong hàng chờ (không đẩy tận đuôi) — ô “hơi nhớ”. */
  const handleReviewSoon = useCallback(() => {
    setStudyQueue((q) => {
      if (index >= q.length) return q;
      const item = q[index];
      const rest = [...q.slice(0, index), ...q.slice(index + 1)];
      const offset = Math.min(
        Math.max(2, Math.floor(rest.length / 4)),
        Math.max(rest.length - 1, 0),
      );
      const insertAt = Math.min(index + offset, rest.length);
      return [...rest.slice(0, insertAt), item, ...rest.slice(insertAt)];
    });
    setRevealed(false);
  }, [index]);

  const goPrevWord = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    setRevealed(false);
  }, []);

  const goNextWord = useCallback(() => {
    setRevealed(false);
    setIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  return (
    <Layout>
      <div className="dash-page vocab-dash">
        <Sidebar streakDays={mockStreak.days} />
        <div className="dash-main">
          <Header userName={headerName} notificationCount={mockNotifications} />
          <div className="dash-main-inner">
            <div className="vocab-study-breadcrumb-row">
              <Breadcrumb
                items={[
                  { label: t("breadcrumb.home"), to: "/", end: true },
                  { label: t("breadcrumb.vocabulary") },
                ]}
              />
              <Link className="vocab-study-link-browse" to="/vocabulary/browse">
                {t("vocabStudyPage.linkBrowse")}
              </Link>
            </div>

            <article
              className="vocab-sheet vocab-scope vocab-notebook vocab-study-scope vocab-study-scrap-scope"
              aria-labelledby="vocab-study-title"
            >
              {current ? (
                <>
                  <div className="vocab-study-scrap-board">
                    <div className="vocab-scrap-hole-rail" aria-hidden />

                    <header className="vocab-study-scrap-head">
                      <div className="scrap-jlpt-sticky" lang="ja">
                        {t("vocabDetailPage.jlptWordTag", {
                          level: current.jlpt,
                        })}
                      </div>
                      <div className="scrap-head-center">
                        <h1
                          id="vocab-study-title"
                          className="scrap-flash-title"
                        >
                          <span>{t("vocabStudyPage.scrapTitle")}</span>
                        </h1>
                      </div>
                      <aside className="scrap-progress-box" aria-live="polite">
                        <div className="scrap-progress-label">
                          {t("vocabStudyPage.progressLabel")}
                        </div>
                        <div className="scrap-progress-value">
                          {t("vocabStudyPage.progressNums", {
                            current: index + 1,
                            total,
                          })}
                        </div>
                        <div className="scrap-progress-track">
                          <div
                            className="scrap-progress-fill"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </aside>

                      <div className="scrap-deck-row">
                        <div className="vocab-study-deck-controls">
                          <label htmlFor="vocab-study-deck">
                            {t("vocabStudyPage.deckLabel")}
                            <select
                              id="vocab-study-deck"
                              className="vocab-study-select"
                              value={deckJlpt}
                              onChange={(e) => setDeckJlpt(e.target.value)}
                            >
                              <option value="">
                                {t("vocabStudyPage.deckMixed")}
                              </option>
                              {jlptLevels.map((lv) => (
                                <option key={lv} value={lv}>
                                  {lv}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    </header>

                    <div className="vocab-study-card-wrap">
                      <div className="vocab-study-stack-paper" aria-hidden />

                      <div
                        className={`vocab-study-card vocab-study-card--scrap${revealed ? " vocab-study-card--back" : " vocab-study-card--front"}`}
                      >
                        {!revealed ? (
                          <>
                            <p className="vocab-study-card-flag">
                              {t("vocabStudyPage.reviewBadge")}
                            </p>
                            <button
                              type="button"
                              className="vocab-study-card-tap-zone"
                              onClick={toggleReveal}
                              aria-expanded={false}
                              aria-label={t("vocabStudyPage.revealLabel")}
                            >
                              <p
                                className="vocab-study-card-word vocab-study-card-word--kanji-only"
                                lang="ja"
                              >
                                {current.surface}
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
                              onClick={toggleReveal}
                              aria-expanded={true}
                              aria-label={t("vocabStudyPage.flipBackAria")}
                            >
                              <div className="vocab-study-reveal-zone vocab-study-reveal-zone--back">
                                <section
                                  className="vocab-study-meaning-sheet"
                                  aria-labelledby={`vocab-flash-mean-${current.id}`}
                                >
                                  <p
                                    id={`vocab-flash-mean-${current.id}`}
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
                                        {current.meaningJa}
                                      </p>
                                      <p
                                        className="vocab-study-meaning-vi-below"
                                        lang="vi"
                                      >
                                        {current.meaningVi}
                                      </p>
                                    </div>
                                  ) : (
                                    <p
                                      className="vocab-study-meaning-single"
                                      lang="ja"
                                    >
                                      {meaning}
                                    </p>
                                  )}
                                </section>

                                <section
                                  className="vocab-study-example-sheet"
                                  aria-labelledby={`vocab-flash-ex-${current.id}`}
                                >
                                  <p
                                    id={`vocab-flash-ex-${current.id}`}
                                    className="vocab-study-sheet-label"
                                  >
                                    {t("vocabPage.exampleLabel")}
                                  </p>
                                  <div
                                    className="vocab-study-example-ja-block"
                                    lang="ja"
                                    dangerouslySetInnerHTML={{
                                      __html: current.exampleJaHtml,
                                    }}
                                  />
                                  {showViGloss ? (
                                    <p
                                      className="vocab-study-example-vi-below"
                                      lang="vi"
                                    >
                                      {current.exampleVi}
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

                    {revealed ? (
                      <div className="vocab-study-rate-strip">
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
                            onClick={handleReviewAgain}
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
                            onClick={handleReviewSoon}
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
                            onClick={handleKnow}
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
                        onClick={goPrevWord}
                        disabled={index <= 0}
                      >
                        ← {t("vocabStudyPage.navPrev")}
                      </button>
                      <p className="vocab-study-foot-count" aria-live="polite">
                        {t("vocabStudyPage.progressNums", {
                          current: index + 1,
                          total,
                        })}
                      </p>
                      <button
                        type="button"
                        className="vocab-study-nav-pill vocab-cta-reset"
                        onClick={goNextWord}
                        disabled={index >= total - 1 || total === 0}
                      >
                        {t("vocabStudyPage.navNext")} →
                      </button>
                    </div>
                  </div>
                </>
              ) : done ? (
                <div className="vocab-study-done">
                  <div className="vocab-study-done-ico" aria-hidden>
                    ✿
                  </div>
                  <h2>{t("vocabStudyPage.doneTitle")}</h2>
                  <div className="vocab-study-done-actions">
                    <button
                      type="button"
                      className="vocab-cta-btn"
                      onClick={restartSession}
                    >
                      {t("vocabStudyPage.btnAgainSession")}
                    </button>
                    <Link
                      className="vocab-cta-btn vocab-cta-btn--muted"
                      to="/vocabulary/browse"
                    >
                      {t("vocabStudyPage.btnToBrowse")}
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="vocab-empty" role="status">
                  {t("vocabStudyPage.emptyDeck")}
                </p>
              )}
            </article>

            <Footer quote={t("vocabStudyPage.motivateFooter")} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
