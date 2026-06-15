import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { examChoiceNumber } from "../../utils/examTakeHelpers.js";

export default function GrammarPracticeQuiz({ questions, onRegenerate, t }) {
  const total = questions.length;
  const [step, setStep] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [picked, setPicked] = useState(null);
  const [finished, setFinished] = useState(false);

  const current = questions[step] ?? null;

  const resetRun = useCallback(() => {
    setStep(0);
    setWrongCount(0);
    setPicked(null);
    setFinished(false);
  }, []);

  const handleRegenerate = useCallback(() => {
    resetRun();
    onRegenerate();
  }, [onRegenerate, resetRun]);

  const summary = useMemo(() => {
    if (!finished || total === 0) return null;
    const correct = total - wrongCount;
    return { correct, perfect: wrongCount === 0 };
  }, [finished, total, wrongCount]);

  const pickOption = useCallback(
    (idx) => {
      if (picked !== null || !current || finished) return;
      setPicked(idx);
      if (idx !== current.answerIndex) setWrongCount((c) => c + 1);
    },
    [picked, current, finished],
  );

  const goNext = useCallback(() => {
    if (picked === null || !current) return;
    if (step >= total - 1) {
      setFinished(true);
      return;
    }
    setStep((s) => s + 1);
    setPicked(null);
  }, [picked, current, step, total]);

  if (!total) {
    return (
      <p className="vocab-empty" role="status">
        {t("grammarPracticePage.noQuestions")}
      </p>
    );
  }

  if (finished && summary) {
    return (
      <div className="grammar-practice-result">
        <h2 className="grammar-practice-result-title">
          {summary.perfect
            ? t("grammarPracticePage.resultPerfectTitle")
            : t("grammarPracticePage.resultPartialTitle")}
        </h2>
        <p className="grammar-practice-result-score">
          {t("grammarPracticePage.scoreLine", {
            correct: summary.correct,
            total,
          })}
        </p>
        <div className="grammar-practice-result-actions">
          <button
            type="button"
            className="vocab-cta-btn vocab-cta-btn--muted"
            onClick={handleRegenerate}
          >
            {t("grammarPracticePage.retryNew")}
          </button>
        </div>
      </div>
    );
  }

  const modeLabel =
    {
      grammar_form: t("grammarPracticePage.modeGrammarForm"),
      particle: t("grammarPracticePage.modeParticle"),
      conjugation: t("grammarPracticePage.modeConjugation"),
      usage: t("grammarPracticePage.modeUsage"),
    }[current?.type] ?? t("grammarPracticePage.modeGrammarForm");

  return (
    <div className="grammar-practice-quiz">
      <div className="grammar-practice-quiz-head">
        <p className="grammar-practice-quiz-meta">
          {t("grammarPracticePage.quizProgress", {
            current: step + 1,
            total,
          })}
        </p>
        <p className="grammar-practice-quiz-mode">{modeLabel}</p>
      </div>

      <div className="grammar-practice-q-prompt">
        <p className="grammar-practice-q-line" lang="ja">
          {current?.promptJa}
        </p>
      </div>

      {current?.promptVi ? (
        <p className="grammar-practice-q-vi" lang="vi">
          {current.promptVi}
        </p>
      ) : null}

      <div className="grammar-practice-q-choices" role="list">
        {current?.options.map((opt, idx) => {
          let state = "";
          if (picked !== null) {
            if (idx === current.answerIndex) state = " is-correct";
            else if (idx === picked) state = " is-wrong";
          }
          return (
            <button
              key={`${current.id}-${idx}`}
              type="button"
              className={`grammar-practice-q-choice vocab-cta-reset${state}`}
              onClick={() => pickOption(idx)}
              disabled={picked !== null}
            >
              <span className="grammar-practice-q-choice-num" aria-hidden="true">
                {examChoiceNumber(idx)}
              </span>
              <span className="grammar-practice-q-choice-text" lang="ja">
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {picked !== null && current?.explainVi ? (
        <p className="grammar-practice-explain" lang="vi" role="status">
          {current.explainVi}
        </p>
      ) : null}

      {picked !== null ? (
        <button
          type="button"
          className="grammar-practice-quiz-next vocab-cta-btn"
          onClick={goNext}
        >
          {step >= total - 1
            ? t("grammarPracticePage.seeResult")
            : t("grammarPracticePage.nextQ")}
        </button>
      ) : null}
    </div>
  );
}

GrammarPracticeQuiz.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string,
      promptJa: PropTypes.string.isRequired,
      promptVi: PropTypes.string,
      options: PropTypes.arrayOf(PropTypes.string).isRequired,
      answerIndex: PropTypes.number.isRequired,
      explainVi: PropTypes.string,
      pattern: PropTypes.string,
    }),
  ).isRequired,
  onRegenerate: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};
