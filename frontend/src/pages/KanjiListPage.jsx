import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  KANJI_ITEMS,
  mergeKanjiMarks,
  getDistinctKanjiJlptLevels,
  KANJI_LESSON_SIZE,
  getKanjiLessonGrowthStage,
  getKanjiPackCompletionPercent,
  KANJI_LESSON_GROWTH_MAX,
  isKanjiLessonUnlocked,
} from "../data/kanjiMock.js";
import { getLessonMilestoneLitCount } from "../data/vocabularyMock.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";

const FIXED_TARGET_JLPT = "N3";

export default function KanjiListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [marks] = useState(() => ({}));
  const jlptLevels = useMemo(() => getDistinctKanjiJlptLevels(), []);
  const targetJlpt = useMemo(() => {
    if (jlptLevels.includes(FIXED_TARGET_JLPT)) return FIXED_TARGET_JLPT;
    return jlptLevels[0] || "";
  }, [jlptLevels]);

  const merged = useMemo(() => mergeKanjiMarks(KANJI_ITEMS, marks), [marks]);

  const lessons = useMemo(() => {
    const filtered = targetJlpt
      ? merged.filter((item) => item.jlpt === targetJlpt)
      : merged;
    const chunks = [];
    for (let i = 0; i < filtered.length; i += KANJI_LESSON_SIZE) {
      const items = filtered.slice(i, i + KANJI_LESSON_SIZE);
      const learned = items.filter((x) => x.learned).length;
      const lessonNo = i / KANJI_LESSON_SIZE + 1;
      chunks.push({
        id: `kanji-lesson-${lessonNo}`,
        lessonNo,
        learned,
        total: items.length,
        items,
        unlocked: isKanjiLessonUnlocked(merged, targetJlpt, lessonNo),
      });
    }
    return chunks;
  }, [merged, targetJlpt]);

  const totalKanji = lessons.reduce((acc, lesson) => acc + lesson.total, 0);

  const packCompletePct = useMemo(
    () => getKanjiPackCompletionPercent(merged, targetJlpt, lessons.length),
    [merged, targetJlpt, lessons.length],
  );

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

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
                {t("kanjiPage.lessonPageSubtitle", { total: totalKanji })}{" "}
                <span className="vocab-lesson-pack-pct">
                  {t("kanjiPage.packCompleteLine", { pct: packCompletePct })}
                </span>
              </p>
            </div>
          </div>

          <div className="vocab-lesson-goal-box">
            <span className="vocab-lesson-goal-label">
              {t("kanjiPage.goalLabel")}
            </span>
            <strong className="vocab-lesson-goal-value">
              {targetJlpt || t("kanjiPage.jlptAll")}
            </strong>
          </div>
        </header>

        {lessons.length === 0 ? (
          <p className="vocab-empty" role="status">
            {t("kanjiPage.noResults")}
          </p>
        ) : (
          <ul className="vocab-lesson-list">
            {lessons.map((lesson) => {
              const growth = targetJlpt
                ? getKanjiLessonGrowthStage(targetJlpt, lesson.lessonNo)
                : 0;
              const progressPct =
                KANJI_LESSON_GROWTH_MAX > 0
                  ? Math.round((growth / KANJI_LESSON_GROWTH_MAX) * 100)
                  : 0;
              const milestoneLitCount = getLessonMilestoneLitCount(growth);
              const studyTo =
                targetJlpt && lesson.lessonNo
                  ? `/kanji/lesson/${lesson.lessonNo}?jlpt=${encodeURIComponent(targetJlpt)}`
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
