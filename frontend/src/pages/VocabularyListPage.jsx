import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  getLessonMilestoneLitCount,
  VOCAB_LESSON_GROWTH_MAX,
} from "../data/vocabularyMock.js";
import { listVocabularyDecks } from "../services/vocabularyService.js";
import {
  getMyVocabularyProgress,
  vocabularyProgressToMap,
} from "../services/vocabularyProgressService.js";
import {
  buildDeckLessons,
  filterActiveDecks,
  jlptLevelsFromDecks,
  levelToJlpt,
  packFlowerProgressByDeckMap,
  sortDecksByJlptAndOrder,
  sortDecksByOrder,
} from "../utils/deckStudy.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";

export default function VocabularyListPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "ja";
  const showVi = String(lang).toLowerCase().startsWith("vi");
  const { user } = useAuth();

  const [allDecks, setAllDecks] = useState([]);
  const [jlptLevels, setJlptLevels] = useState([]);
  const [selectedJlpt, setSelectedJlpt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressByDeckId, setProgressByDeckId] = useState({});

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [{ decks }, progressList] = await Promise.all([
          listVocabularyDecks({ isActive: true, limit: 100 }),
          getMyVocabularyProgress(),
        ]);
        if (cancelled) return;

        const active = filterActiveDecks(decks);
        setAllDecks(active);
        setJlptLevels(jlptLevelsFromDecks(active));
        setProgressByDeckId(vocabularyProgressToMap(progressList));
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, t));
          setAllDecks([]);
          setJlptLevels([]);
          setProgressByDeckId({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, t]);

  const sortedDecks = useMemo(() => {
    if (!allDecks.length) return [];
    if (selectedJlpt) {
      return sortDecksByOrder(
        allDecks.filter((d) => levelToJlpt(d.level) === selectedJlpt),
      );
    }
    return sortDecksByJlptAndOrder(allDecks);
  }, [allDecks, selectedJlpt]);

  const lessons = useMemo(
    () => buildDeckLessons(sortedDecks, []),
    [sortedDecks],
  );

  const lessonCount = lessons.length;
  const totalWords = lessons.reduce((acc, lesson) => acc + lesson.total, 0);

  const displayJlpt = selectedJlpt || t("vocabPage.jlptAll");

  const packProgress = useMemo(
    () =>
      packFlowerProgressByDeckMap(
        lessons,
        progressByDeckId,
        VOCAB_LESSON_GROWTH_MAX,
      ),
    [lessons, progressByDeckId],
  );

  const getDeckGrowthStage = useCallback(
    (deckId) => progressByDeckId[String(deckId)] ?? 0,
    [progressByDeckId],
  );

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  if (loading) {
    return (
      <Layout
        userName={headerName}
        streakDays={mockStreak.days}
        pageClassName="vocab-dash"
      >
        <p className="vocab-empty">{t("common.loading")}</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        userName={headerName}
        streakDays={mockStreak.days}
        pageClassName="vocab-dash"
      >
        <p className="vocab-empty grammar-empty--error" role="alert">
          {error}
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
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.vocabulary") },
        ]}
      />

      <article
        className="vocab-sheet vocab-scope vocab-notebook vocab-lesson-scope"
        aria-labelledby="vocab-list-title"
      >
        <header className="vocab-lesson-head">
          <div className="vocab-lesson-head-main">
            <img
              className="vocab-lesson-head-deco"
              src="/assets/vocabulary/list/header-leaf.png"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div>
              <h1 id="vocab-list-title" className="vocab-lesson-title">
                {t("vocabPage.lessonPageTitle")}
              </h1>
              <p className="vocab-lesson-sub">
                {lessonCount > 0 ? (
                  <>
                    {t("vocabPage.lessonPageSubtitle", {
                      jlpt: displayJlpt,
                      lessonCount,
                      totalWords,
                    })}{" "}
                    <span className="vocab-lesson-pack-pct">
                      {t("vocabPage.packCompleteLine", packProgress)}
                    </span>
                  </>
                ) : (
                  t("vocabPage.lessonPageSubtitleEmpty")
                )}
              </p>
            </div>
          </div>

          <div className="vocab-lesson-goal-box">
            <label htmlFor="vocab-jlpt-select" className="vocab-lesson-goal-label">
              {t("vocabPage.jlptFilter")}
            </label>
            <select
              id="vocab-jlpt-select"
              className="vocab-jlpt-select"
              value={selectedJlpt}
              onChange={(e) => setSelectedJlpt(e.target.value)}
            >
              <option value="">{t("vocabPage.jlptAll")}</option>
              {jlptLevels.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
          </div>
        </header>

        {lessons.length === 0 ? (
          <p className="vocab-empty" role="status">
            {t("vocabPage.lessonPageSubtitleEmpty")}
          </p>
        ) : (
          <ul className="vocab-lesson-list">
            {lessons.map((lesson) => {
              const growth = getDeckGrowthStage(lesson.id);
              const progressPct =
                VOCAB_LESSON_GROWTH_MAX > 0
                  ? Math.round((growth / VOCAB_LESSON_GROWTH_MAX) * 100)
                  : 0;
              const milestoneLitCount = getLessonMilestoneLitCount(growth);
              const cardTitle = showVi
                ? lesson.title ||
                  t("vocabPage.lessonCardTitle", { n: lesson.lessonNo })
                : lesson.titleJa ||
                  lesson.title ||
                  t("vocabPage.lessonCardTitle", { n: lesson.lessonNo });
              const studyTo = lesson.id
                ? `/vocabulary/lesson/${lesson.lessonNo}?jlpt=${encodeURIComponent(lesson.jlpt)}&deckId=${encodeURIComponent(lesson.id)}`
                : "/vocabulary/browse";
              return (
                <li key={lesson.id} className="vocab-lesson-card">
                  <Link className="vocab-lesson-link" to={studyTo}>
                    <div className="vocab-lesson-book-wrap">
                      {lesson.thumbnail ? (
                        <img
                          className="vocab-lesson-book-icon vocab-lesson-deck-thumb"
                          src={lesson.thumbnail}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <img
                          className="vocab-lesson-book-icon"
                          src="/assets/vocabulary/list/book-open.png"
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>

                    <div className="vocab-lesson-main">
                      <h2 className="vocab-lesson-card-title">
                        {!selectedJlpt ? (
                          <span className="vocab-lesson-jlpt-tag">
                            {lesson.jlpt}
                          </span>
                        ) : null}
                        {cardTitle}
                      </h2>
                      <p className="vocab-lesson-card-sub">
                        {lesson.description ||
                          t("vocabPage.lessonCardSubtitle")}
                      </p>
                      <p className="vocab-lesson-card-meta">
                        {t("vocabPage.lessonCardWordCount", {
                          count: lesson.total,
                        })}
                      </p>
                      <div className="vocab-lesson-progress">
                        <span className="vocab-lesson-progress-text">
                          {t("vocabPage.lessonCardGrowth", {
                            stageName: t(
                              `vocabPage.growthStageName.${growth}`,
                            ),
                            words: lesson.total,
                          })}
                        </span>
                        <div className="vocab-lesson-progress-track">
                          <div
                            className="vocab-lesson-progress-fill"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="vocab-lesson-milestones" aria-hidden>
                      <img
                        className={`vocab-lesson-milestone ${milestoneLitCount >= 1 ? "is-active" : "is-inactive"}`}
                        src="/assets/vocabulary/list/plant-seed.png"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                      <img
                        className={`vocab-lesson-milestone ${milestoneLitCount >= 2 ? "is-active" : "is-inactive"}`}
                        src="/assets/vocabulary/list/plant-sprout.png"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                      <img
                        className={`vocab-lesson-milestone ${milestoneLitCount >= 3 ? "is-active" : "is-inactive"}`}
                        src="/assets/vocabulary/list/plant-bud.png"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                      <img
                        className={`vocab-lesson-milestone ${milestoneLitCount >= 4 ? "is-active" : "is-inactive"}`}
                        src="/assets/vocabulary/list/plant-flower.png"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <span className="vocab-lesson-chevron" aria-hidden>
                      ›
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </Layout>
  );
}
