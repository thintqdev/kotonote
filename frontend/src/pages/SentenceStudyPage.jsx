import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  getSentenceQuiz,
  getSentenceStudyPack,
  updateSentenceProgress,
} from "../services/sentenceTemplateService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./VocabularyPage.css";
import "./SentencePages.css";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function statusLabelKey(status) {
  if (status === "mastered") return "mastered";
  if (status === "learning") return "learning";
  if (status === "review") return "review";
  return "notStarted";
}

export default function SentenceStudyPage() {
  const { code } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language?.startsWith("ja") ? "ja" : "vi";

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("detail");

  const [flashQueue, setFlashQueue] = useState([]);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashRevealed, setFlashRevealed] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [quizDone, setQuizDone] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  const specialty = pack?.specialty ?? null;
  const templates = pack?.templates ?? [];
  const stats = pack?.stats ?? { total: 0, mastered: 0, reviewDue: 0 };

  const specialtyName = useMemo(() => {
    if (!specialty) return code ?? "";
    return lang === "ja" ? specialty.nameJa : specialty.nameVi;
  }, [specialty, lang, code]);

  const loadPack = useCallback(async () => {
    if (!user || !code) return;
    setLoading(true);
    setError("");
    try {
      const data = await getSentenceStudyPack(code);
      setPack(data);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, [user, code, t]);

  useEffect(() => {
    void loadPack();
  }, [loadPack]);

  useEffect(() => {
    if (tab !== "flash" || !templates.length) {
      setFlashQueue([]);
      setFlashIndex(0);
      setFlashRevealed(false);
      return;
    }
    setFlashQueue(shuffleArray(templates));
    setFlashIndex(0);
    setFlashRevealed(false);
  }, [tab, templates, flashKey]);

  const flashCurrent = flashQueue[flashIndex] ?? null;
  const flashTotal = flashQueue.length;
  const flashDone = flashTotal > 0 && flashIndex >= flashTotal;

  const handleFlashReveal = () => setFlashRevealed(true);

  const handleFlashKnow = async () => {
    if (!flashCurrent) return;
    try {
      await updateSentenceProgress(String(flashCurrent._id), "flash_seen");
    } catch {
      /* giữ luồng học */
    }
    setFlashRevealed(false);
    setFlashIndex((i) => i + 1);
  };

  const handleFlashAgain = () => {
    if (!flashCurrent) return;
    setFlashQueue((q) => {
      const item = q[flashIndex];
      const rest = [...q.slice(0, flashIndex), ...q.slice(flashIndex + 1)];
      return [...rest, item];
    });
    setFlashRevealed(false);
  };

  const startQuiz = useCallback(async () => {
    if (!code) return;
    setQuizLoading(true);
    setQuizDone(false);
    setQuizIndex(0);
    setQuizSelected(null);
    setQuizFeedback(null);
    setQuizScore({ correct: 0, total: 0 });
    try {
      const data = await getSentenceQuiz(code, {
        count: Math.min(templates.length || 5, 8),
      });
      setQuizQuestions(data.questions ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
      setQuizQuestions([]);
    } finally {
      setQuizLoading(false);
    }
  }, [code, templates.length, t]);

  useEffect(() => {
    if (tab === "quiz" && !quizQuestions.length && !quizLoading && templates.length) {
      void startQuiz();
    }
  }, [tab, quizQuestions.length, quizLoading, templates.length, startQuiz]);

  const quizCurrent = quizQuestions[quizIndex] ?? null;

  const handleQuizChoice = async (choiceIndex) => {
    if (!quizCurrent || quizFeedback) return;
    const isCorrect = choiceIndex === quizCurrent.correctIndex;
    setQuizSelected(choiceIndex);
    setQuizFeedback(isCorrect ? "correct" : "wrong");
    setQuizScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    try {
      await updateSentenceProgress(
        String(quizCurrent.templateId),
        isCorrect ? "quiz_correct" : "quiz_wrong",
      );
    } catch {
      /* giữ luồng học */
    }
  };

  const handleQuizNext = () => {
    if (quizIndex + 1 >= quizQuestions.length) {
      setQuizDone(true);
      void loadPack();
      return;
    }
    setQuizIndex((i) => i + 1);
    setQuizSelected(null);
    setQuizFeedback(null);
  };

  const handleMarkMastered = async (templateId) => {
    try {
      await updateSentenceProgress(String(templateId), "mark_mastered");
      await loadPack();
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <Layout pageClassName="vocab-dash" mockStreak={mockStreak}>
        <p className="vocab-empty">{t("common.loading")}</p>
      </Layout>
    );
  }

  if (error && !pack) {
    return (
      <Layout pageClassName="vocab-dash" mockStreak={mockStreak}>
        <p className="vocab-empty sentence-error" role="alert">
          {error}
        </p>
        <Link to="/sentences" className="sentence-back-link">
          {t("sentencePage.backToList")}
        </Link>
      </Layout>
    );
  }

  return (
    <Layout pageClassName="vocab-dash" mockStreak={mockStreak}>
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/" },
          { label: t("breadcrumb.sentences"), to: "/sentences" },
          { label: specialtyName },
        ]}
      />

      <div className="vocab-study-wrap sentence-study-wrap">
        <header className="vocab-lesson-head sentence-study-head">
          <div>
            <p className="sentence-kicker">{t("sentencePage.kicker")}</p>
            <h1 className="vocab-lesson-title">{specialtyName}</h1>
            <p className="vocab-lesson-sub">
              {t("sentencePage.statsSummary", {
                mastered: stats.mastered ?? 0,
                total: stats.total ?? 0,
              })}
            </p>
          </div>
        </header>

        <div
          className="vocab-study-lesson-tabs"
          role="tablist"
          aria-label={t("sentencePage.tabsAria")}
        >
          {["detail", "flash", "quiz"].map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`vocab-study-tab${tab === id ? " is-active" : ""}`}
              onClick={() => setTab(id)}
            >
              {t(`sentencePage.tab${id.charAt(0).toUpperCase()}${id.slice(1)}`)}
            </button>
          ))}
        </div>

        <article className="vocab-sheet vocab-scope vocab-notebook vocab-study-scope sentence-study-board">
          {tab === "detail" ? (
            <div className="sentence-detail-panel">
              <h2 className="scrap-flash-title">{t("sentencePage.detailTitle")}</h2>
              {templates.length === 0 ? (
                <p className="vocab-empty">{t("sentencePage.noTemplates")}</p>
              ) : (
                <ul className="sentence-template-list">
                  {templates.map((tpl) => {
                    const situation =
                      lang === "ja" && tpl.situationJa
                        ? tpl.situationJa
                        : tpl.situationVi;
                    const status = tpl.progress?.status ?? "not_started";
                    return (
                      <li key={tpl._id} className="sentence-template-card">
                        <div className="sentence-template-top">
                          <span
                            className={`sentence-status-badge sentence-status-badge--${status}`}
                          >
                            {t(`sentencePage.status.${statusLabelKey(status)}`)}
                          </span>
                          <span className="sentence-politeness">
                            {t(`sentencePage.politeness.${tpl.politenessLevel}`)}
                          </span>
                        </div>
                        <p className="sentence-situation">{situation}</p>
                        <p className="sentence-ja" lang="ja">
                          {tpl.sentenceJa}
                        </p>
                        {tpl.reading ? (
                          <p className="sentence-reading" lang="ja">
                            {tpl.reading}
                          </p>
                        ) : null}
                        <p className="sentence-vi" lang="vi">
                          {tpl.sentenceVi}
                        </p>
                        {(lang === "ja" ? tpl.noteJa : tpl.noteVi) ? (
                          <p className="sentence-note">
                            {lang === "ja" ? tpl.noteJa : tpl.noteVi}
                          </p>
                        ) : null}
                        {status !== "mastered" ? (
                          <button
                            type="button"
                            className="sentence-mark-btn"
                            onClick={() => handleMarkMastered(tpl._id)}
                          >
                            {t("sentencePage.markMastered")}
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}

          {tab === "flash" ? (
            <div className="sentence-flash-panel">
              {flashDone ? (
                <div className="sentence-flash-done">
                  <p>{t("sentencePage.flashDone")}</p>
                  <button
                    type="button"
                    className="sentence-action-btn"
                    onClick={() => setFlashKey((k) => k + 1)}
                  >
                    {t("sentencePage.flashRestart")}
                  </button>
                </div>
              ) : flashCurrent ? (
                <>
                  <p className="sentence-flash-progress">
                    {t("sentencePage.flashProgress", {
                      current: flashIndex + 1,
                      total: flashTotal,
                    })}
                  </p>
                  <div className="sentence-flash-card">
                    <p className="sentence-flash-label">
                      {t("sentencePage.flashSituation")}
                    </p>
                    <p className="sentence-flash-situation">
                      {lang === "ja" && flashCurrent.situationJa
                        ? flashCurrent.situationJa
                        : flashCurrent.situationVi}
                    </p>
                    {flashRevealed ? (
                      <>
                        <p className="sentence-flash-label">
                          {t("sentencePage.flashAnswer")}
                        </p>
                        <p className="sentence-ja sentence-flash-answer" lang="ja">
                          {flashCurrent.sentenceJa}
                        </p>
                        <p className="sentence-vi" lang="vi">
                          {flashCurrent.sentenceVi}
                        </p>
                        <div className="sentence-flash-actions">
                          <button
                            type="button"
                            className="sentence-action-btn sentence-action-btn--ghost"
                            onClick={handleFlashAgain}
                          >
                            {t("sentencePage.flashAgain")}
                          </button>
                          <button
                            type="button"
                            className="sentence-action-btn"
                            onClick={handleFlashKnow}
                          >
                            {t("sentencePage.flashKnow")}
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="sentence-action-btn"
                        onClick={handleFlashReveal}
                      >
                        {t("sentencePage.flashReveal")}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="vocab-empty">{t("sentencePage.noTemplates")}</p>
              )}
            </div>
          ) : null}

          {tab === "quiz" ? (
            <div className="sentence-quiz-panel">
              {quizLoading ? (
                <p className="vocab-empty">{t("common.loading")}</p>
              ) : quizDone ? (
                <div className="sentence-quiz-done">
                  <h2>{t("sentencePage.quizDoneTitle")}</h2>
                  <p>
                    {t("sentencePage.quizScore", {
                      correct: quizScore.correct,
                      total: quizScore.total,
                    })}
                  </p>
                  <button
                    type="button"
                    className="sentence-action-btn"
                    onClick={() => {
                      setQuizQuestions([]);
                      void startQuiz();
                    }}
                  >
                    {t("sentencePage.quizRetry")}
                  </button>
                </div>
              ) : quizCurrent ? (
                <>
                  <p className="sentence-quiz-progress">
                    {t("sentencePage.quizProgress", {
                      current: quizIndex + 1,
                      total: quizQuestions.length,
                    })}
                  </p>
                  <p className="sentence-situation">{quizCurrent.situationVi}</p>
                  <p className="sentence-cloze" lang="ja">
                    {quizCurrent.clozeJa}
                  </p>
                  <ul className="sentence-quiz-choices">
                    {quizCurrent.choices.map((choice, idx) => {
                      let cls = "sentence-quiz-choice";
                      if (quizFeedback && idx === quizCurrent.correctIndex) {
                        cls += " is-correct";
                      } else if (
                        quizFeedback &&
                        idx === quizSelected &&
                        idx !== quizCurrent.correctIndex
                      ) {
                        cls += " is-wrong";
                      }
                      return (
                        <li key={`${quizCurrent.templateId}-${choice}`}>
                          <button
                            type="button"
                            className={cls}
                            disabled={Boolean(quizFeedback)}
                            onClick={() => handleQuizChoice(idx)}
                          >
                            {choice}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {quizFeedback ? (
                    <div className="sentence-quiz-feedback">
                      <p>
                        {quizFeedback === "correct"
                          ? t("sentencePage.quizCorrect")
                          : t("sentencePage.quizWrong")}
                      </p>
                      <button
                        type="button"
                        className="sentence-action-btn"
                        onClick={handleQuizNext}
                      >
                        {quizIndex + 1 >= quizQuestions.length
                          ? t("sentencePage.quizFinish")
                          : t("sentencePage.quizNext")}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="vocab-empty">{t("sentencePage.noTemplates")}</p>
              )}
            </div>
          ) : null}
        </article>
      </div>
    </Layout>
  );
}
