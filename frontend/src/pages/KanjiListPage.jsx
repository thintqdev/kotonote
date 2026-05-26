import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import { mergeKanjiMarks, KANJI_LESSON_GROWTH_MAX } from "../data/kanjiMock.js";
import { getLessonMilestoneLitCount } from "../data/vocabularyMock.js";
import {
  listKanjiDecks,
  loadAllKanjiPacks,
  loadKanjiPack,
} from "../services/kanjiService.js";
import {
  getMyKanjiProgress,
  kanjiProgressToMap,
} from "../services/kanjiProgressService.js";
import {
  buildDeckLessons,
  filterActiveDecks,
  jlptLevelsFromDecks,
  packFlowerProgressByDeckMap,
} from "../utils/deckStudy.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { useJlptAccess } from "../hooks/useJlptAccess.js";
import JlptLockedOverlay from "../components/study/JlptLockedOverlay.jsx";
import "../components/study/JlptLockGate.css";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./ReadingListPage.css";

export default function KanjiListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isLocked } = useJlptAccess();

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJlpt = (searchParams.get("jlpt") || "").trim();

  const [marks] = useState(() => ({}));
  const [jlptLevels, setJlptLevels] = useState([]);
  const [packItems, setPackItems] = useState([]);
  const [sortedDecks, setSortedDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressByDeckId, setProgressByDeckId] = useState({});

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
        const packPromise =
          selectedJlpt && isLocked(selectedJlpt)
            ? Promise.resolve({ decks: [], items: [] })
            : selectedJlpt
              ? loadKanjiPack(selectedJlpt)
              : loadAllKanjiPacks();
        const [pack, progressList] = await Promise.all([
          packPromise,
          getMyKanjiProgress(
            selectedJlpt ? { jlpt: selectedJlpt } : undefined,
          ),
        ]);
        if (!cancelled) {
          setSortedDecks(pack.decks);
          setPackItems(pack.items);
          setProgressByDeckId(kanjiProgressToMap(progressList));
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, t));
          setSortedDecks([]);
          setPackItems([]);
          setProgressByDeckId({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, selectedJlpt, isLocked, t]);

  const merged = useMemo(
    () => mergeKanjiMarks(packItems, marks),
    [packItems, marks],
  );

  const lessons = useMemo(
    () => buildDeckLessons(sortedDecks, merged),
    [sortedDecks, merged],
  );

  const lessonCount = lessons.length;
  const totalKanji = lessons.reduce((acc, lesson) => acc + lesson.total, 0);

  const displayJlpt = selectedJlpt || t("kanjiPage.jlptAll");

  const setJlpt = (next) => {
    const p = new URLSearchParams(searchParams);
    if (next) p.set("jlpt", next);
    else p.delete("jlpt");
    setSearchParams(p, { replace: true });
  };

  const packProgress = useMemo(
    () =>
      packFlowerProgressByDeckMap(
        lessons,
        progressByDeckId,
        KANJI_LESSON_GROWTH_MAX,
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
        </header>

        <div
          className="vocab-tabs reading-jlpt-tabs"
          role="tablist"
          aria-label={t("readingPage.filterAria")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={!selectedJlpt}
            className={`vocab-tab${!selectedJlpt ? " vocab-tab--active" : ""}`}
            onClick={() => setJlpt("")}
          >
            {t("readingPage.filterAll")}
          </button>
          {jlptLevels.map((lv) => (
            <button
              key={`jlpt-tab-${lv}`}
              type="button"
              role="tab"
              aria-selected={selectedJlpt === lv}
              className={`vocab-tab${selectedJlpt === lv ? " vocab-tab--active" : ""}${isLocked(lv) ? " vocab-tab--jlpt-locked" : ""}`}
              onClick={() => setJlpt(lv)}
            >
              {isLocked(lv) ? t("jlptAccess.tabLocked", { level: lv }) : lv}
            </button>
          ))}
        </div>

        {lessons.length === 0 ? (
          <p className="vocab-empty" role="status">
            {t("kanjiPage.noResults")}
          </p>
        ) : (
          <ul className="vocab-lesson-list">
            {lessons.map((lesson) => {
              const growth = getDeckGrowthStage(lesson.id);
              const progressPct =
                KANJI_LESSON_GROWTH_MAX > 0
                  ? Math.round((growth / KANJI_LESSON_GROWTH_MAX) * 100)
                  : 0;
              const milestoneLitCount = getLessonMilestoneLitCount(growth);
              const studyTo = lesson.id
                ? `/kanji/lesson/${lesson.lessonNo}?jlpt=${encodeURIComponent(lesson.jlpt)}&deckId=${encodeURIComponent(lesson.id)}`
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

              const jlptLocked = isLocked(lesson.jlpt);
              const canStudy = lesson.unlocked && !jlptLocked;

              return (
                <li
                  key={lesson.id}
                  className={`vocab-lesson-card${canStudy ? "" : " vocab-lesson-card--locked"}${jlptLocked ? " vocab-lesson-card-wrap--locked" : ""}`}
                >
                  {canStudy ? (
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
                  {jlptLocked ? (
                    <JlptLockedOverlay level={lesson.jlpt} />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </Layout>
  );
}
