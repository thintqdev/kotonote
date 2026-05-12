import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak, mockNotifications } from "../data/dashboardHomeMock.js";
import { getReadingDetail, readingChoiceLetterJa } from "../data/readingMock.js";
import { grammarIsViUI } from "../data/grammarMock.js";
import "./DashboardHome.css";
import "./GrammarPages.css";
import "./ReadingListPage.css";

export default function ReadingArticlePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();
  const lang = i18n.language || "ja";
  const showViGloss = grammarIsViUI(lang);
  /** @type {Record<number, number>} chỉ số câu hỏi → chỉ số đáp án đã chọn */
  const [quizPick, setQuizPick] = useState({});

  const detail = id ? getReadingDetail(id) : null;

  useEffect(() => {
    setQuizPick({});
  }, [id]);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  if (!detail) {
    return <Navigate to="/reading" replace />;
  }

  const ribbon = t("readingArticlePage.metaRibbon", {
    words: detail.wordCount,
    minutes: detail.readingMinutes,
    rating: detail.rating.toFixed(1),
  });

  return (
    <Layout
      userName={headerName}
      notificationCount={mockNotifications}
      footerQuote={t("dashboard.quotes.footer")}
      streakDays={mockStreak.days}
    >
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.reading"), to: "/reading" },
          { label: detail.titleJa },
        ]}
      />

      <article
        className="grammar-sheet grammar-scope grammar-detail--journal"
        aria-labelledby="reading-detail-title"
      >
        <Link className="grammar-back" to="/reading">
          {t("readingArticlePage.backToList")}
        </Link>

        {detail.imageUrl ? (
          <div className="grammar-block reading-detail-cover-block">
            <div className="grammar-box reading-detail-cover-wrap">
              <img
                className="reading-detail-cover-img"
                src={detail.imageUrl}
                alt=""
                width={800}
                height={360}
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        ) : null}

        <header className="grammar-detail-head">
          <p className="grammar-detail-kicker">
            {t("grammarPage.jlptBadge", { level: detail.jlpt })} ·{" "}
            {t("breadcrumb.reading")}
          </p>
          <h1
            id="reading-detail-title"
            className="grammar-detail-title"
            lang="ja"
          >
            {detail.titleJa}
          </h1>
          <p className="grammar-detail-ribbon">{ribbon}</p>
        </header>

        <section className="grammar-block" aria-labelledby="reading-body">
          <h2 id="reading-body" className="grammar-h">
            {t("readingArticlePage.labels.body")}
          </h2>
          <div className="grammar-box">
            {detail.paragraphsJa.map((para, idx) => (
              <p key={`rp-${detail.id}-${idx}`} className="grammar-jp-line" lang="ja">
                {para}
              </p>
            ))}
          </div>
        </section>

        {detail.vocabulary?.length ? (
          <section className="grammar-block" aria-labelledby="reading-vocab">
            <h2 id="reading-vocab" className="grammar-h">
              {t("readingArticlePage.labels.vocab")}
            </h2>
            <div className="grammar-box">
              <ol className="grammar-example-list">
                {detail.vocabulary.map((row, idx) => (
                  <li
                    key={`voc-${detail.id}-${idx}`}
                    className="grammar-example-item-split"
                  >
                    <div className="grammar-example-jp" lang="ja">
                      {row.termJa}
                    </div>
                    {showViGloss && row.gloss?.vi ? (
                      <p className="grammar-example-vi-gloss">{row.gloss.vi}</p>
                    ) : null}
                    {showViGloss && !row.gloss?.vi && row.gloss?.ja ? (
                      <p className="grammar-example-vi-gloss" lang="ja">
                        {row.gloss.ja}
                      </p>
                    ) : null}
                    {!showViGloss && row.gloss?.ja ? (
                      <p className="grammar-example-vi-gloss" lang="ja">
                        {row.gloss.ja}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        {detail.questions?.length ? (
          <section className="grammar-block" aria-labelledby="reading-q">
            <h2 id="reading-q" className="grammar-h">
              {t("readingArticlePage.labels.comprehension")}
            </h2>
            <p className="grammar-vi-note reading-q-hint">
              {t("readingArticlePage.quiz.chooseHint")}
            </p>
            {detail.questions.map((q, qi) => {
              const picked = quizPick[qi];
              const hasPicked = typeof picked === "number";
              const isCorrect = hasPicked && picked === q.answerIndex;

              return (
                <fieldset
                  key={`q-${detail.id}-${qi}`}
                  className="grammar-box grammar-box--soft reading-detail-q-box reading-q-fieldset"
                >
                  <legend className="reading-q-legend">
                    <span className="grammar-jp-line reading-detail-q-prompt" lang="ja">
                      {qi + 1}. {q.questionJa}
                    </span>
                  </legend>
                  <div
                    className="reading-q-options"
                    role="radiogroup"
                    aria-label={t("readingArticlePage.quiz.optionsAria", {
                      n: qi + 1,
                    })}
                  >
                    {q.choicesJa.map((choice, ci) => {
                      const letter = readingChoiceLetterJa(ci);
                      const isThis = hasPicked && picked === ci;
                      const isAnswer = ci === q.answerIndex;
                      let optClass = "reading-q-option";
                      if (hasPicked) {
                        if (isAnswer) optClass += " reading-q-option--answer";
                        else if (isThis) optClass += " reading-q-option--wrong";
                        else optClass += " reading-q-option--idle";
                      }
                      return (
                        <button
                          key={`c-${detail.id}-${qi}-${ci}`}
                          type="button"
                          role="radio"
                          aria-checked={isThis}
                          disabled={hasPicked}
                          className={optClass}
                          onClick={() =>
                            setQuizPick((prev) => ({ ...prev, [qi]: ci }))
                          }
                          lang="ja"
                        >
                          <span className="reading-q-option-letter">{letter}</span>
                          <span className="reading-q-option-text">{choice}</span>
                        </button>
                      );
                    })}
                  </div>

                  {hasPicked ? (
                    <>
                      <p
                        className={`reading-q-result${isCorrect ? " reading-q-result--ok" : " reading-q-result--ng"}`}
                        role="status"
                      >
                        {isCorrect
                          ? t("readingArticlePage.quiz.resultCorrect")
                          : t("readingArticlePage.quiz.resultWrong")}
                      </p>
                      <p className="grammar-vi-note reading-detail-answer">
                        {t("readingArticlePage.answerLine", {
                          key: readingChoiceLetterJa(q.answerIndex),
                        })}
                      </p>
                      <div
                        className="reading-q-explain-block"
                        aria-labelledby={`reading-explain-${detail.id}-${qi}`}
                      >
                        <h3
                          id={`reading-explain-${detail.id}-${qi}`}
                          className="reading-q-explain-title"
                        >
                          {t("readingArticlePage.quiz.explainTitle")}
                        </h3>
                        {q.choicesJa.map((choiceLine, ci) => {
                          const letter = readingChoiceLetterJa(ci);
                          const isAns = ci === q.answerIndex;
                          const isSel = picked === ci;
                          let rowClass = "reading-q-explain-row";
                          if (isAns) rowClass += " reading-q-explain-row--answer";
                          else if (isSel) rowClass += " reading-q-explain-row--picked";
                          return (
                            <div
                              key={`ex-${detail.id}-${qi}-${ci}`}
                              className={rowClass}
                            >
                              <div className="reading-q-explain-head">
                                <span className="reading-q-explain-letter">{letter}</span>
                                <p className="reading-q-explain-choice" lang="ja">
                                  {choiceLine}
                                </p>
                              </div>
                              <p className="grammar-jp-line reading-q-explain-ja" lang="ja">
                                {q.explainPerChoice.ja[ci]}
                              </p>
                              {showViGloss ? (
                                <p className="grammar-example-vi-gloss reading-q-explain-vi">
                                  {q.explainPerChoice.vi[ci]}
                                </p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        className="reading-q-retry"
                        onClick={() =>
                          setQuizPick((prev) => {
                            const next = { ...prev };
                            delete next[qi];
                            return next;
                          })
                        }
                      >
                        {t("readingArticlePage.quiz.retry")}
                      </button>
                    </>
                  ) : null}
                </fieldset>
              );
            })}
          </section>
        ) : null}
      </article>
    </Layout>
  );
}
