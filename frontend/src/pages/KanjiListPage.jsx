import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  mergeKanjiMarks,
  getKanjiLessonGrowthStage,
  KANJI_LESSON_GROWTH_MAX,
} from "../data/kanjiMock.js";
import { getLessonMilestoneLitCount } from "../data/vocabularyMock.js";
import {
  listKanjiDecks,
  loadAllKanjiPacks,
  loadKanjiPack,
} from "../services/kanjiService.js";
import {
  buildDeckLessons,
  buildLessonNoInJlptMap,
  filterActiveDecks,
  jlptLevelsFromDecks,
  packFlowerProgress,
  packFlowerProgressForLessons,
} from "../utils/deckStudy.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";

export default function KanjiListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [marks] = useState(() => ({}));
  const [jlptLevels, setJlptLevels] = useState([]);
  const [selectedJlpt, setSelectedJlpt] = useState("");
  const [packItems, setPackItems] = useState([]);
  const [sortedDecks, setSortedDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const { decks } = await listKanjiDecks({ isActive: true, limit: 100 });
        if (!cancelled) {
          setJlptLevels(jlptLevelsFromDecks(filterActiveDecks(decks)));
        }
      } catch {
        if (!cancelled) setJlptLevels([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const pack = selectedJlpt
          ? await loadKanjiPack(selectedJlpt)
          : await loadAllKanjiPacks();
        if (!cancelled) {
          setSortedDecks(pack.decks);
          setPackItems(pack.items);
        }
      } catch (err) {
        if (!cancelled) {
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
  }, [user, selectedJlpt, t]);

  const merged = useMemo(
    () => mergeKanjiMarks(packItems, marks),
    [packItems, marks],
  );

  const lessons = useMemo(
    () => buildDeckLessons(sortedDecks, merged),
    [sortedDecks, merged],
  );

  const lessonNoInJlpt = useMemo(
    () => buildLessonNoInJlptMap(lessons),
    [lessons],
  );

  const lessonCount = lessons.length;
  const totalKanji = lessons.reduce((acc, lesson) => acc + lesson.total, 0);

  const displayJlpt = selectedJlpt || t("kanjiPage.jlptAll");

  const packProgress = useMemo(() => {
    if (!lessonCount) {
      return { flowerCount: 0, lessonCount: 0, pct: 0 };
    }
    if (selectedJlpt) {
      return packFlowerProgress(
        selectedJlpt,
        lessonCount,
        getKanjiLessonGrowthStage,
        KANJI_LESSON_GROWTH_MAX,
      );
    }
    return packFlowerProgressForLessons(
      lessons,
      getKanjiLessonGrowthStage,
      KANJI_LESSON_GROWTH_MAX,
      lessonNoInJlpt,
    );
  }, [selectedJlpt, lessonCount, lessons, lessonNoInJlpt]);

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
          { label: t("breadcrumb.kanji") },
        ]}
      />

      <article
        className="vocab-sheet vocab-scope vocab-notebook vocab-lesson-scope"
        aria-labelledby="kanji-list-title"
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
              <h1 id="kanji-list-title" className="vocab-lesson-title">
                {t("kanjiPage.lessonPageTitle")}
              </h1>
              <p className="vocab-lesson-sub">
                {lessonCount > 0 ? (
                  <>
                    {t("kanjiPage.lessonPageSubtitle", {
                      jlpt: displayJlpt,
                      lessonCount,
                      totalKanji,
                    })}{" "}
                    <span className="vocab-lesson-pack-pct">
                      {t("kanjiPage.packCompleteLine", packProgress)}
                    </span>
                  </>
                ) : (
                  t("kanjiPage.lessonPageSubtitleEmpty")
                )}
              </p>
            </div>
          </div>

          <div className="vocab-lesson-goal-box">
            <label htmlFor="kanji-jlpt-select" className="vocab-lesson-goal-label">
              {t("kanjiPage.jlptFilter")}
            </label>
            <select
              id="kanji-jlpt-select"
              className="vocab-jlpt-select"
              value={selectedJlpt}
              onChange={(e) => setSelectedJlpt(e.target.value)}
            >
              <option value="">{t("kanjiPage.jlptAll")}</option>
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
            {t("kanjiPage.noResults")}
          </p>
        ) : (
          <ul className="vocab-lesson-list">
            {lessons.map((lesson) => {
              const growthLessonNo =
                lessonNoInJlpt.get(lesson.id) ?? lesson.lessonNo;
              const growth = getKanjiLessonGrowthStage(
                lesson.jlpt,
                growthLessonNo,
              );
              const progressPct =
                KANJI_LESSON_GROWTH_MAX > 0
                  ? Math.round((growth / KANJI_LESSON_GROWTH_MAX) * 100)
                  : 0;
              const milestoneLitCount = getLessonMilestoneLitCount(growth);
              const studyTo = lesson.lessonNo
                ? `/kanji/lesson/${growthLessonNo}?jlpt=${encodeURIComponent(lesson.jlpt)}`
                : "/kanji/browse";

              const cardInner = (
                <>
                  <div className="vocab-lesson-book-wrap">
                    <img
                      className="vocab-lesson-book-icon"
                      src="/assets/vocabulary/list/book-open.png"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="vocab-lesson-main">
                    <h2 className="vocab-lesson-card-title">
                      {!selectedJlpt ? (
                        <span className="vocab-lesson-jlpt-tag">
                          {lesson.jlpt}
                        </span>
                      ) : null}
                      {t("kanjiPage.lessonCardTitle", { n: lesson.lessonNo })}
                      {!lesson.unlocked ? (
                        <span className="vocab-lesson-lock-badge" aria-hidden>
                          {" "}
                          🔒
                        </span>
                      ) : null}
                    </h2>
                    <p className="vocab-lesson-card-sub">
                      {lesson.unlocked
                        ? t("kanjiPage.lessonCardSubtitle")
                        : t("kanjiPage.lessonLockedSubtitle")}
                    </p>
                    <p className="vocab-lesson-card-meta">
                      {t("kanjiPage.lessonCardProgress", {
                        learned: lesson.learned,
                        total: lesson.total,
                      })}
                    </p>
                    <div className="vocab-lesson-progress">
                      <span className="vocab-lesson-progress-text">
                        {t("kanjiPage.lessonCardGrowth", {
                          stageName: t(`kanjiPage.growthStageName.${growth}`),
                          kanji: lesson.total,
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

                  {lesson.unlocked ? (
                    <span className="vocab-lesson-chevron" aria-hidden>
                      ›
                    </span>
                  ) : (
                    <span className="vocab-lesson-chevron vocab-lesson-chevron--muted" aria-hidden>
                      —
                    </span>
                  )}
                </>
              );

              return (
                <li
                  key={lesson.id}
                  className={`vocab-lesson-card${lesson.unlocked ? "" : " vocab-lesson-card--locked"}`}
                >
                  {lesson.unlocked ? (
                    <Link className="vocab-lesson-link" to={studyTo}>
                      {cardInner}
                    </Link>
                  ) : (
                    <div
                      className="vocab-lesson-link vocab-lesson-link--locked"
                      role="group"
                      aria-label={t("kanjiPage.lessonLockedAria", {
                        n: lesson.lessonNo,
                      })}
                    >
                      {cardInner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </Layout>
  );
}
