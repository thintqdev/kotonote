import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  VOCAB_LESSON_GROWTH_MAX,
  VOCAB_QUIZ_PER_STAGE,
} from "../data/vocabularyMock.js";

/** Bài trắc nghiệm theo stage — chỉ khi đúng cả bộ câu mới gọi onPerfect (lên giai đoạn cây). */
export default function VocabularyLessonQuiz({
  questions,
  growthStage,
  onPerfect,
  onRegenerate,
  t,
  growthMax = VOCAB_LESSON_GROWTH_MAX,
  scoreTotal = VOCAB_QUIZ_PER_STAGE,
  getQuizModeLabel,
  resultPerfectTitle,
  needPerfectHint,
  quizFlowerDoneText,
  quizNoWordsText,
}) {
  const total = questions.length;
  const scoreLineTotal = scoreTotal;
  const atFlower = growthStage >= growthMax;

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
      const isWrong = idx !== current.answerIndex;
      if (isWrong) setWrongCount((c) => c + 1);
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

  if (atFlower) {
    return (
      <div className="vocab-lesson-quiz vocab-lesson-quiz--done-pack">
        <p className="vocab-lesson-quiz-lead">
          {quizFlowerDoneText ?? t("vocabStudyPage.quizFlowerDone")}
        </p>
      </div>
    );
  }

  if (!total) {
    return (
      <p className="vocab-empty" role="status">
        {quizNoWordsText ?? t("vocabStudyPage.quizNoWords")}
      </p>
    );
  }

  if (finished && summary) {
    return (
      <div className="vocab-lesson-quiz vocab-lesson-quiz--result">
        <h2 className="vocab-lesson-quiz-result-title">
          {summary.perfect
            ? resultPerfectTitle ?? t("vocabStudyPage.quizResultPerfectTitle")
            : t("vocabStudyPage.quizResultPartialTitle")}
        </h2>
        <p className="vocab-lesson-quiz-score">
          {t("vocabStudyPage.quizScoreLine", {
            correct: summary.correct,
            total: scoreLineTotal,
          })}
        </p>
        {!summary.perfect ? (
          <p className="vocab-lesson-quiz-hint">
            {needPerfectHint ?? t("vocabStudyPage.quizNeedPerfect")}
          </p>
        ) : null}
        <div className="vocab-lesson-quiz-result-actions">
          {summary.perfect ? (
            <button type="button" className="vocab-cta-btn" onClick={onPerfect}>
              {t("vocabStudyPage.quizAdvanceGrowth")}
            </button>
          ) : null}
          <button
            type="button"
            className="vocab-cta-btn vocab-cta-btn--muted"
            onClick={handleRegenerate}
          >
            {t("vocabStudyPage.quizRetryNew")}
          </button>
        </div>
      </div>
    );
  }

  const showNext = picked !== null;

  return (
    <div className="vocab-lesson-quiz">
      <p className="vocab-lesson-quiz-meta">
        {t("vocabStudyPage.quizProgress", { current: step + 1, total })}
      </p>
      <p className="vocab-lesson-quiz-mode" lang="ja">
        {getQuizModeLabel
          ? getQuizModeLabel(current?.mode)
          : current?.mode === "surface_from_meaning"
            ? t("vocabStudyPage.quizModePickKanji")
            : current?.mode === "reading_from_surface"
              ? t("vocabStudyPage.quizModePickReading")
              : t("vocabStudyPage.quizModePickMeaning")}
      </p>
      <p
        className="vocab-lesson-quiz-prompt"
        lang={
          current?.promptLang ??
          (current?.mode === "surface_from_meaning" ? "vi" : "ja")
        }
      >
        {current?.prompt}
      </p>
      <div className="vocab-lesson-quiz-options" role="list">
        {current?.options.map((opt, idx) => {
          let state = "";
          if (picked !== null) {
            if (idx === current.answerIndex) state = " is-correct";
            else if (idx === picked && idx !== current.answerIndex)
              state = " is-wrong";
          }
          return (
            <button
              key={`${current.key}-${idx}`}
              type="button"
              className={`vocab-lesson-quiz-opt vocab-cta-reset${state}`}
              onClick={() => pickOption(idx)}
              disabled={picked !== null}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {showNext ? (
        <button
          type="button"
          className="vocab-lesson-quiz-next vocab-cta-btn"
          onClick={goNext}
        >
          {step >= total - 1
            ? t("vocabStudyPage.quizSeeResult")
            : t("vocabStudyPage.quizNextQ")}
        </button>
      ) : null}
    </div>
  );
}

VocabularyLessonQuiz.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      wordId: PropTypes.string.isRequired,
      mode: PropTypes.string.isRequired,
      prompt: PropTypes.string.isRequired,
      promptLang: PropTypes.string,
      options: PropTypes.arrayOf(PropTypes.string).isRequired,
      answerIndex: PropTypes.number.isRequired,
    }),
  ).isRequired,
  growthStage: PropTypes.number.isRequired,
  onPerfect: PropTypes.func.isRequired,
  onRegenerate: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  growthMax: PropTypes.number,
  scoreTotal: PropTypes.number,
  getQuizModeLabel: PropTypes.func,
  resultPerfectTitle: PropTypes.string,
  needPerfectHint: PropTypes.string,
  quizFlowerDoneText: PropTypes.string,
  quizNoWordsText: PropTypes.string,
};
