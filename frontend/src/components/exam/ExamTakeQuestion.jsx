import PropTypes from "prop-types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { examChoiceNumber } from "../../utils/examTakeHelpers.js";
import { resolvePublicMediaUrl } from "../../utils/resolveAvatarUrl.js";
import {
  parsePassageMarkup,
  passageHasMarkup,
} from "../../utils/examPassageMarkup.js";
import {
  buildStarQuestionFilledLine,
  isStarQuestion,
} from "../../utils/examStarQuestion.js";
import ExamMediaZoomImage from "./ExamMediaZoomImage.jsx";
import ExamPassageText from "./ExamPassageText.jsx";
import ExamStarQuestionPrompt from "./ExamStarQuestionPrompt.jsx";
import "./ExamPassageText.css";

export default function ExamTakeQuestion({
  question,
  questionKey,
  scrollId,
  pickedIndex,
  onPick,
  showResult = false,
  result,
}) {
  const { t } = useTranslation();
  const choices = question.choices ?? [];
  const hasPicked = typeof pickedIndex === "number";
  const answerIndex =
    result?.answerIndex !== undefined
      ? result.answerIndex
      : Math.max(0, Number(question.answerIndex) || 0);
  const isCorrect = showResult && hasPicked && pickedIndex === answerIndex;
  const isUnanswered = showResult && !hasPicked;
  const explainText =
    result?.explainVi?.trim() || result?.explainJa?.trim() || "";

  const questionText = question.questionJa || question.questionVi || "";
  const questionLang = question.questionJa ? "ja" : undefined;
  const questionMediaUrl = String(
    question.mediaUrl ?? question.imageUrl ?? "",
  ).trim();
  const questionMediaSrc = questionMediaUrl
    ? resolvePublicMediaUrl(questionMediaUrl)
    : null;
  const passageMode = showResult ? "preview" : "exam";
  const starQ = isStarQuestion(question);

  const questionNodes = useMemo(
    () => parsePassageMarkup(questionText),
    [questionText],
  );
  const questionHasMarkup = !starQ && passageHasMarkup(questionNodes);

  return (
    <fieldset
      id={scrollId}
      className={`exam-take-q grammar-box grammar-box--soft reading-detail-q-box reading-q-fieldset${questionHasMarkup ? " exam-take-q--markup" : ""}`}
    >
      <legend className="exam-take-q-legend reading-q-legend">
        <span className="exam-take-q-num">
          {t("examPage.questionNumber", { n: question.questionNumber })}
        </span>
        {showResult ? (
          <span
            className={`exam-take-q-verdict${
              isUnanswered
                ? " exam-take-q-verdict--skip"
                : isCorrect
                  ? " exam-take-q-verdict--ok"
                  : " exam-take-q-verdict--bad"
            }`}
          >
            {isUnanswered
              ? t("examPage.unanswered")
              : isCorrect
                ? t("examPage.correct")
                : t("examPage.incorrect")}
          </span>
        ) : null}
      </legend>

      {questionText.trim() ? (
        <div
          className={`exam-take-q-prompt${starQ ? " exam-take-q-prompt--star" : ""}`}
        >
          {starQ ? (
            <>
              <ExamStarQuestionPrompt text={questionText} />
              {showResult ? null : (
                <p className="exam-star-q-hint">
                  {t("examPage.starQuestionHint")}
                </p>
              )}
            </>
          ) : (
            <ExamPassageText
              text={questionText}
              mode={passageMode}
              lang={questionLang}
            />
          )}
        </div>
      ) : null}

      {questionMediaSrc ? (
        <div className="exam-take-q-media grammar-box exam-media-box">
          <ExamMediaZoomImage
            src={questionMediaSrc}
            alt={t("examPage.questionNumber", { n: question.questionNumber })}
            className="exam-take-q-media-img"
          />
        </div>
      ) : null}

      <div
        className="exam-take-q-choices reading-q-options"
        role="radiogroup"
        aria-label={t("examPage.questionNumber", {
          n: question.questionNumber,
        })}
      >
        {choices.map((choice, ci) => {
          if (!String(choice ?? "").trim()) return null;
          const letter = examChoiceNumber(ci);
          const isThis = hasPicked && pickedIndex === ci;
          const isAnswer = showResult && ci === answerIndex;
          const choiceNodes = parsePassageMarkup(choice);
          const choiceHasMarkup = passageHasMarkup(choiceNodes);

          let optClass = "reading-q-option exam-take-q-choice";
          if (choiceHasMarkup) optClass += " exam-take-q-choice--markup";
          if (showResult) {
            if (isAnswer) optClass += " reading-q-option--answer";
            else if (isThis) optClass += " reading-q-option--wrong";
            else optClass += " reading-q-option--idle";
          } else if (isThis) {
            optClass += " reading-q-option--picked";
          }

          return (
            <button
              key={`${questionKey}-c-${ci}`}
              type="button"
              role="radio"
              aria-checked={isThis}
              disabled={showResult}
              className={optClass}
              onClick={() => !showResult && onPick?.(ci)}
            >
              <span className="reading-q-option-letter exam-take-q-choice-letter">
                {letter}
              </span>
              <span className="exam-take-q-choice-body">
                <ExamPassageText text={choice} mode={passageMode} lang="ja" />
              </span>
            </button>
          );
        })}
      </div>

      {showResult && result ? (
        <div className="reading-q-explain-block exam-take-q-explain">
          <h3 className="reading-q-explain-title">
            {t("examPage.explainTitle")}
          </h3>
          {explainText ? (
            <div className="grammar-example-vi-gloss reading-q-explain-vi">
              <ExamPassageText
                text={explainText}
                mode="preview"
                lang={result?.explainVi?.trim() ? "vi" : "ja"}
              />
            </div>
          ) : (
            <p className="grammar-example-vi-gloss reading-q-explain-vi">
              {t("examPage.correctAnswer", { n: answerIndex + 1 })}
            </p>
          )}
        </div>
      ) : null}
    </fieldset>
  );
}

ExamTakeQuestion.propTypes = {
  question: PropTypes.object.isRequired,
  questionKey: PropTypes.string.isRequired,
  scrollId: PropTypes.string,
  pickedIndex: PropTypes.number,
  onPick: PropTypes.func,
  showResult: PropTypes.bool,
  result: PropTypes.object,
};
