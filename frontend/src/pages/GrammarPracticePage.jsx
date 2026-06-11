import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import StudyPageHeader from "../components/study/StudyPageHeader.jsx";
import GrammarPracticeQuiz from "../components/grammar/GrammarPracticeQuiz.jsx";
import { mockStreak } from "../data/dashboardHomeMock.js";
import { GRAMMAR_JLPT_LEVELS } from "../constants/grammarFieldMeta.js";
import { getGrammarPracticeQuiz } from "../services/grammarService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { useJlptAccess } from "../hooks/useJlptAccess.js";
import JlptLockedOverlay from "../components/study/JlptLockedOverlay.jsx";
import "../components/study/JlptLockGate.css";
import "./DashboardHome.css";
import "./GrammarPages.css";
import "./GrammarPracticePage.css";
import "./VocabularyPages.css";
import "./VocabularyPage.css";

const COUNT_PRESETS = [5, 10, 15, 20, 25];

export default function GrammarPracticePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isLocked } = useJlptAccess();

  const initialJlpt = useMemo(() => {
    const raw = (searchParams.get("jlpt") || "N5").trim().toUpperCase();
    return GRAMMAR_JLPT_LEVELS.includes(raw) ? raw : "N5";
  }, [searchParams]);

  const [jlpt, setJlpt] = useState(initialJlpt);
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  const headerName =
    user?.profile?.readingName?.trim() ||
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const handleJlpt = useCallback(
    (level) => {
      if (isLocked(level)) {
        navigate("/membership");
        return;
      }
      setJlpt(level);
    },
    [isLocked, navigate],
  );

  const runQuiz = useCallback(async () => {
    if (isLocked(jlpt)) {
      navigate("/membership");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getGrammarPracticeQuiz({ jlpt, count });
      setQuestions(data.questions ?? []);
      setMeta(data.meta ?? null);
      setStarted(true);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
      setQuestions([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [jlpt, count, isLocked, navigate, t]);

  const handleRetry = useCallback(() => {
    runQuiz();
  }, [runQuiz]);

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      pageClassName="vocab-dash"
    >
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.grammar"), to: "/grammar" },
          { label: t("grammarPracticePage.breadcrumb") },
        ]}
      />

      <article
        className="vocab-sheet vocab-scope vocab-notebook grammar-sheet grammar-scope grammar-practice-page"
        aria-labelledby="grammar-practice-title"
      >
        <StudyPageHeader
          titleId="grammar-practice-title"
          title={t("grammarPracticePage.title")}
          subtitle={t("grammarPracticePage.subtitle")}
          aside={
            <Link to="/grammar" className="grammar-practice-back">
              {t("grammarPage.backToList")}
            </Link>
          }
        />

        {!started ? (
          <section
            className="grammar-practice-setup"
            aria-label={t("grammarPracticePage.setupAria")}
          >
            <div
              className="vocab-tabs reading-jlpt-tabs grammar-jlpt-tabs"
              role="tablist"
              aria-label={t("grammarPracticePage.levelTabsAria")}
            >
              {GRAMMAR_JLPT_LEVELS.map((lv) => (
                <button
                  key={`gp-jlpt-${lv}`}
                  type="button"
                  role="tab"
                  aria-selected={jlpt === lv}
                  className={`vocab-tab${jlpt === lv ? " vocab-tab--active" : ""}${isLocked(lv) ? " vocab-tab--jlpt-locked" : ""}`}
                  onClick={() => handleJlpt(lv)}
                >
                  {isLocked(lv)
                    ? t("jlptAccess.tabLocked", { level: lv })
                    : lv}
                </button>
              ))}
            </div>

            {isLocked(jlpt) ? (
              <JlptLockedOverlay jlpt={jlpt} />
            ) : (
              <>
                <fieldset className="grammar-practice-count-field">
                  <legend>{t("grammarPracticePage.countLabel")}</legend>
                  <div className="grammar-practice-count-row" role="group">
                    {COUNT_PRESETS.map((n) => (
                      <button
                        key={`gp-count-${n}`}
                        type="button"
                        className={`grammar-practice-count-chip${count === n ? " is-active" : ""}`}
                        aria-pressed={count === n}
                        onClick={() => setCount(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <p className="grammar-practice-level-hint">
                  {t(`grammarPracticePage.levelHint.${jlpt}`)}
                </p>

                {error ? (
                  <p className="vocab-empty grammar-empty--error" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="button"
                  className="vocab-cta-btn grammar-practice-start"
                  disabled={loading}
                  onClick={runQuiz}
                >
                  {loading
                    ? t("grammarPracticePage.loading")
                    : t("grammarPracticePage.startBtn")}
                </button>
              </>
            )}
          </section>
        ) : (
          <section className="grammar-practice-session">
            <div className="grammar-practice-session-head">
              <p className="grammar-practice-session-meta" role="status">
                {t("grammarPracticePage.sessionMeta", {
                  jlpt: meta?.jlpt ?? jlpt,
                  count: meta?.actualCount ?? questions.length,
                })}
              </p>
              <button
                type="button"
                className="vocab-study-nav-pill vocab-cta-reset"
                disabled={loading}
                onClick={() => {
                  setStarted(false);
                  setQuestions([]);
                }}
              >
                {t("grammarPracticePage.changeSettings")}
              </button>
            </div>

            {error ? (
              <p className="vocab-empty grammar-empty--error" role="alert">
                {error}
              </p>
            ) : null}

            <GrammarPracticeQuiz
              questions={questions}
              onRegenerate={handleRetry}
              t={t}
            />
          </section>
        )}
      </article>
    </Layout>
  );
}
