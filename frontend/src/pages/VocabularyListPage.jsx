import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  VOCAB_ITEMS,
  mergeVocabMarks,
  getDistinctJlptLevels,
  VOCAB_LESSON_SIZE,
  getLessonGrowthStage,
  getLessonMilestoneLitCount,
  getPackCompletionPercent,
  VOCAB_LESSON_GROWTH_MAX,
} from "../data/vocabularyMock.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";

const FIXED_TARGET_JLPT = "N3";

export default function VocabularyListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [marks] = useState(() => ({}));
  const jlptLevels = useMemo(() => getDistinctJlptLevels(), []);
  const targetJlpt = useMemo(() => {
    if (jlptLevels.includes(FIXED_TARGET_JLPT)) return FIXED_TARGET_JLPT;
    return jlptLevels[0] || "";
  }, [jlptLevels]);

  const merged = useMemo(() => mergeVocabMarks(VOCAB_ITEMS, marks), [marks]);

  const lessons = useMemo(() => {
    const filtered = targetJlpt
      ? merged.filter((item) => item.jlpt === targetJlpt)
      : merged;
    const chunks = [];
    for (let i = 0; i < filtered.length; i += VOCAB_LESSON_SIZE) {
      const items = filtered.slice(i, i + VOCAB_LESSON_SIZE);
      const learned = items.filter((x) => x.learned).length;
      chunks.push({
        id: `lesson-${i / VOCAB_LESSON_SIZE + 1}`,
        lessonNo: i / VOCAB_LESSON_SIZE + 1,
        learned,
        total: items.length,
        items,
      });
    }
    return chunks;
  }, [merged, targetJlpt]);

  const totalWords = lessons.reduce((acc, lesson) => acc + lesson.total, 0);

  const packCompletePct = useMemo(
    () => getPackCompletionPercent(merged, targetJlpt, lessons.length),
    [merged, targetJlpt, lessons.length],
  );

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  return (
    <Layout
      userName={headerName}
      footerQuote={t("dashboard.quotes.footer")}
      streakDays={mockStreak.days}
      pageClassName="vocab-dash"
    >
      <Breadcrumb
              items={[
                { label: t("breadcrumb.home"), to: "/", end: true },
                {
                  label: t("breadcrumb.vocabulary"),
                },
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
                      {t("vocabPage.lessonPageSubtitle", { total: totalWords })}{" "}
                      <span className="vocab-lesson-pack-pct">
                        {t("vocabPage.packCompleteLine", {
                          pct: packCompletePct,
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="vocab-lesson-goal-box">
                  <span className="vocab-lesson-goal-label">
                    {t("vocabPage.goalLabel")}
                  </span>
                  <strong className="vocab-lesson-goal-value">
                    {targetJlpt || t("vocabPage.jlptAll")}
                  </strong>
                </div>
              </header>

              {lessons.length === 0 ? (
                <p className="vocab-empty" role="status">
                  {t("vocabPage.noResults")}
                </p>
              ) : (
                <ul className="vocab-lesson-list">
                  {lessons.map((lesson) => {
                    const growth = targetJlpt
                      ? getLessonGrowthStage(targetJlpt, lesson.lessonNo)
                      : 0;
                    const progressPct =
                      VOCAB_LESSON_GROWTH_MAX > 0
                        ? Math.round((growth / VOCAB_LESSON_GROWTH_MAX) * 100)
                        : 0;
                    const milestoneLitCount =
                      getLessonMilestoneLitCount(growth);
                    const studyTo =
                      targetJlpt && lesson.lessonNo
                        ? `/vocabulary/lesson/${lesson.lessonNo}?jlpt=${encodeURIComponent(targetJlpt)}`
                        : "/vocabulary/browse";
                    return (
                      <li key={lesson.id} className="vocab-lesson-card">
                        <Link className="vocab-lesson-link" to={studyTo}>
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
                              {t("vocabPage.lessonCardTitle", {
                                n: lesson.lessonNo,
                              })}
                            </h2>
                            <p className="vocab-lesson-card-sub">
                              {t("vocabPage.lessonCardSubtitle")}
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
