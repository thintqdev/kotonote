import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import { readingChoiceLetterJa } from "../data/readingMock.js";
import { grammarIsViUI } from "../data/grammarMock.js";
import {
  getReadingArticle,
  saveReadingProgress,
} from "../services/readingService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { isJlptLockedError } from "../utils/jlptAccess.js";
import JlptLockGate from "../components/study/JlptLockGate.jsx";
import { resolvePublicMediaUrl } from "../utils/resolveAvatarUrl.js";
import "./DashboardHome.css";
import "./GrammarPages.css";
import "./ReadingListPage.css";

export default function ReadingArticlePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { id: slug } = useParams();
  const lang = i18n.language || "ja";
  const showViGloss = grammarIsViUI(lang);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jlptLocked, setJlptLocked] = useState(false);
  const [lockedJlpt, setLockedJlpt] = useState("");
  /** @type {Record<number, number>} */
  const [quizPick, setQuizPick] = useState({});

  useEffect(() => {
    if (!user || !slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const article = await getReadingArticle(slug);
        if (cancelled) return;
        if (!article) {
          setDetail(null);
          return;
        }
        setDetail(article);
        const pick = {};
        for (const row of article.questionAnswers ?? []) {
          pick[row.questionIndex] = row.choiceIndex;
        }
        setQuizPick(pick);
        if (article.status === "not_started") {
          await saveReadingProgress(slug, { status: "in_progress" });
        }
      } catch (err) {
        if (!cancelled) {
          if (isJlptLockedError(err)) {
            const level =
              err &&
              typeof err === "object" &&
              Array.isArray(/** @type {{ errors?: { message?: string }[] }} */ (err).errors)
                ? /** @type {{ errors?: { message?: string }[] }} */ (err).errors?.[0]
                    ?.message
                : "";
            setLockedJlpt(level || "");
            setJlptLocked(true);
          } else {
            setError(getApiErrorMessage(err, t));
          }
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, slug, t]);

  const handlePick = useCallback(
    async (qi, ci) => {
      if (!slug) return;
      setQuizPick((prev) => ({ ...prev, [qi]: ci }));
      try {
        await saveReadingProgress(slug, {
          recordAnswer: { questionIndex: qi, choiceIndex: ci },
        });
      } catch {
        // giữ lựa chọn local nếu API lỗi
      }
    },
    [slug],
  );

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  if (loading) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days}>
        <p className="vocab-empty">{t("common.loading")}</p>
      </Layout>
    );
  }

  if (jlptLocked) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days}>
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), to: "/", end: true },
            { label: t("breadcrumb.reading"), to: "/reading" },
          ]}
        />
        <JlptLockGate jlpt={lockedJlpt} forceLocked>
          <span />
        </JlptLockGate>
      </Layout>
    );
  }

  if (!detail) {
    return <Navigate to="/reading" replace />;
  }

  const coverSrc = resolvePublicMediaUrl(detail.imageUrl);

  const ribbon = t("readingArticlePage.metaRibbon", {
    words: detail.wordCount,
    minutes: detail.readingMinutes,
    rating: detail.rating.toFixed(1),
  });

  return (
    <Layout userName={headerName} streakDays={mockStreak.days}>
      <JlptLockGate jlpt={detail.jlpt}>
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.reading"), to: "/reading" },
          { label: detail.titleJa },
        ]}
      />

      {error ? (
        <p className="vocab-empty" role="alert">
          {error}
        </p>
      ) : null}

      <article
        className="grammar-sheet grammar-scope grammar-detail--journal"
        aria-labelledby="reading-detail-title"
      >
        <Link className="grammar-back" to="/reading">
          {t("readingArticlePage.backToList")}
        </Link>

        {coverSrc ? (
          <div className="grammar-block reading-detail-cover-block">
            <div className="grammar-box reading-detail-cover-wrap">
              <img
                className="reading-detail-cover-img"
                src={coverSrc}
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
                          onClick={() => void handlePick(qi, ci)}
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
      </JlptLockGate>
    </Layout>
  );
}
