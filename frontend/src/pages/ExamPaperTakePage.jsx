import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  EXAM_PART_META,
  EXAM_SECTION_META,
  countSectionQuestions,
} from "../constants/examPaperStructure.js";
import { examSessionLabel } from "../constants/examPaperFieldMeta.js";
import ExamPassageText from "../components/exam/ExamPassageText.jsx";
import ExamTakeQuestion from "../components/exam/ExamTakeQuestion.jsx";
import ExamMediaZoomImage from "../components/exam/ExamMediaZoomImage.jsx";
import ExamPartPassageBlocks from "../components/exam/ExamPartPassageBlocks.jsx";
import ExamTakeSidebar from "../components/exam/ExamTakeSidebar.jsx";
import ExamListeningAudioPlayer from "../components/exam/ExamListeningAudioPlayer.jsx";
import JlptLockGate from "../components/study/JlptLockGate.jsx";
import { getExamPaper, submitExamPaper } from "../services/examPaperService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { isJlptLockedError } from "../utils/jlptAccess.js";
import { resolvePublicMediaUrl } from "../utils/resolveAvatarUrl.js";
import {
  buildExamAnswerKey,
  buildExamQuestionRegistry,
  examQuestionDomId,
  filterPaperSections,
  getExamSectionTabs,
} from "../utils/examTakeHelpers.js";
import { saveExamResult } from "../utils/examResultStorage.js";
import { resolveListeningAudioUrl } from "../utils/examListeningHelpers.js";
import "./DashboardHome.css";
import "./GrammarPages.css";
import "./VocabularyPages.css";
import "./ReadingListPage.css";
import "./ExamPaperPages.css";
import "../components/exam/ExamPassageText.css";

export default function ExamPaperTakePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jlptLocked, setJlptLocked] = useState(false);
  const [lockedJlpt, setLockedJlpt] = useState("");
  const [activeSection, setActiveSection] = useState("vocabulary");
  /** @type {[Record<string, number>, Function]} */
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    if (!user || !slug) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const loaded = await getExamPaper(slug);
        if (cancelled) return;
        if (!loaded) {
          setPaper(null);
          return;
        }
        setPaper(loaded);
        const tabs = getExamSectionTabs(loaded.sections);
        setActiveSection(tabs[0] ?? "vocabulary");
      } catch (err) {
        if (!cancelled) {
          if (isJlptLockedError(err)) {
            const level =
              err &&
              typeof err === "object" &&
              Array.isArray(
                /** @type {{ errors?: { message?: string }[] }} */ (err).errors,
              )
                ? /** @type {{ errors?: { message?: string }[] }} */ (err)
                    .errors?.[0]?.message
                : "";
            setLockedJlpt(level || "");
            setJlptLocked(true);
          } else {
            setError(getApiErrorMessage(err, t));
          }
          setPaper(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, slug, t]);

  const sectionTabs = useMemo(
    () => getExamSectionTabs(paper?.sections),
    [paper?.sections],
  );

  const sectionsForTab = useMemo(
    () => filterPaperSections(paper?.sections, activeSection),
    [paper?.sections, activeSection],
  );

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const totalQuestions = paper?.questionCount ?? 0;

  const questionRegistry = useMemo(
    () => buildExamQuestionRegistry(paper?.sections),
    [paper?.sections],
  );

  const questionGroups = useMemo(() => {
    const map = new Map();
    for (const item of questionRegistry) {
      if (!map.has(item.sectionType)) {
        map.set(item.sectionType, { sectionType: item.sectionType, items: [] });
      }
      map.get(item.sectionType).items.push(item);
    }
    return getExamSectionTabs(paper?.sections)
      .map((sectionType) => map.get(sectionType))
      .filter(Boolean);
  }, [questionRegistry, paper?.sections]);

  const handleJumpToQuestion = useCallback(
    (item) => {
      if (!item) return;
      if (item.sectionType !== activeSection) {
        setActiveSection(item.sectionType);
      }
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          document
            .getElementById(examQuestionDomId(item.key))
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, item.sectionType !== activeSection ? 80 : 0);
      });
    },
    [activeSection],
  );

  const handlePick = useCallback((key, choiceIndex) => {
    setAnswers((prev) => ({ ...prev, [key]: choiceIndex }));
  }, []);

  const handleSubmit = async () => {
    if (!slug || submitting || !paper) return;
    setSubmitting(true);
    try {
      const { result: graded, attemptId } = await submitExamPaper(slug, answers);
      const paperSnapshot = {
        titleVi: paper.titleVi,
        titleJa: paper.titleJa,
        jlpt: paper.jlpt,
        year: paper.year,
        session: paper.session,
        slug: paper.slug,
      };
      const examResult = { result: graded, paper: paperSnapshot, answers, attemptId };
      saveExamResult(slug, examResult, attemptId);
      toast.success(t("examPage.submitSuccess"));
      navigate(`/practice/history/${attemptId}/result`, { state: { examResult } });
    } catch (err) {
      toast.error(t("examPage.submitFailed"), {
        description: getApiErrorMessage(err, t),
      });
    } finally {
      setSubmitting(false);
    }
  };

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
            { label: t("breadcrumb.practice"), to: "/practice" },
            { label: slug },
          ]}
        />
        <JlptLockGate jlpt={lockedJlpt} forceLocked>
          <span />
        </JlptLockGate>
      </Layout>
    );
  }

  if (!paper) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days}>
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), to: "/", end: true },
            { label: t("breadcrumb.practice"), to: "/practice" },
          ]}
        />
        <p className="vocab-empty" role="alert">
          {error || t("examPage.notFound")}
        </p>
        <p>
          <Link className="grammar-back" to="/practice">
            {t("examPage.backToList")}
          </Link>
        </p>
      </Layout>
    );
  }

  if (!slug) return <Navigate to="/practice" replace />;

  const ribbon = t("examPage.metaRibbon", {
    year: paper.year,
    session: examSessionLabel(paper.session),
    min: paper.durationMinutes ?? 0,
  });

  return (
    <Layout userName={headerName} streakDays={mockStreak.days}>
      <JlptLockGate jlpt={paper.jlpt}>
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), to: "/", end: true },
            { label: t("breadcrumb.practice"), to: "/practice" },
            { label: paper.titleVi },
          ]}
        />

        <div className="exam-take-body">
          <div className="exam-take-main">
        <article
          className="grammar-sheet grammar-scope grammar-detail--journal"
          aria-labelledby="exam-take-title"
        >
          <Link className="grammar-back" to="/practice">
            {t("examPage.backToList")}
          </Link>

          <header className="grammar-detail-head exam-detail-head">
            <p className="grammar-detail-kicker">
              {t("grammarPage.jlptBadge", { level: paper.jlpt })} ·{" "}
              {t("breadcrumb.practice")}
            </p>
            <h1 id="exam-take-title" className="grammar-detail-title">
              {paper.titleVi}
            </h1>
            {paper.titleJa ? (
              <p className="grammar-detail-ribbon" lang="ja">
                {paper.titleJa}
              </p>
            ) : (
              <p className="grammar-detail-ribbon">{ribbon}</p>
            )}
          </header>

          <nav
            className="vocab-tabs reading-jlpt-tabs exam-section-tabs"
            role="tablist"
            aria-label={t("examPage.sectionTabsAria")}
          >
            {sectionTabs.map((key) => {
              const meta = EXAM_SECTION_META[key] ?? {};
              const count = filterPaperSections(paper.sections, key).reduce(
                (n, s) => n + countSectionQuestions(s),
                0,
              );
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeSection === key}
                  className={`vocab-tab${activeSection === key ? " vocab-tab--active" : ""}`}
                  onClick={() => setActiveSection(key)}
                >
                  {meta.titleVi}
                  <span className="exam-section-tab-count">{count}</span>
                </button>
              );
            })}
          </nav>

          {sectionsForTab.length === 0 ? (
            <p className="vocab-empty">{t("examPage.emptySection")}</p>
          ) : (
            <>
              {activeSection === "listening" &&
              resolveListeningAudioUrl(paper) ? (
                <div className="exam-listening-section-audio">
                  <ExamListeningAudioPlayer
                    src={resolvePublicMediaUrl(
                      resolveListeningAudioUrl(paper),
                    )}
                    label={t("examPage.listeningSectionAudio", {
                      defaultValue: "Audio nghe hiểu",
                    })}
                  />
                </div>
              ) : null}
              {sectionsForTab.map((part) => {
              const partMeta = EXAM_PART_META[part.partType] ?? {};
              const partTitle =
                part.titleVi || partMeta.titleVi || part.partType;

              return (
                <section
                  key={`${part.sectionType}-${part.partType}`}
                  className="grammar-block"
                  aria-labelledby={`exam-part-${part.sectionType}-${part.partType}`}
                >
                  <h2
                    id={`exam-part-${part.sectionType}-${part.partType}`}
                    className="grammar-h"
                  >
                    {partTitle}
                  </h2>
                  {partMeta.titleJa ? (
                    <p className="grammar-vi-note" lang="ja">
                      {partMeta.titleJa}
                    </p>
                  ) : null}

                  {part.sectionType === "reading" ||
                  part.sectionType === "listening" ? (
                    <ExamPartPassageBlocks
                      part={part}
                      answers={answers}
                      onPick={handlePick}
                      passageMode="exam"
                    />
                  ) : (
                    <>
                      {part.passageJa ? (
                        <div className="grammar-box exam-passage-box">
                          <ExamPassageText text={part.passageJa} mode="exam" />
                        </div>
                      ) : null}
                      {(part.audioUrl || part.imageUrl) && (
                        <div className="grammar-box exam-media-box">
                          {part.audioUrl ? (
                            <audio
                              controls
                              preload="metadata"
                              src={resolvePublicMediaUrl(part.audioUrl)}
                            />
                          ) : (
                            <ExamMediaZoomImage
                              src={resolvePublicMediaUrl(part.imageUrl)}
                              alt="Tài liệu đề thi"
                            />
                          )}
                        </div>
                      )}
                      {(part.questions ?? []).map((q, qi) => {
                        const qNum = q.questionNumber ?? qi + 1;
                        const key = buildExamAnswerKey(
                          part.sectionType,
                          part.partType,
                          qNum,
                        );
                        return (
                          <ExamTakeQuestion
                            key={key}
                            scrollId={examQuestionDomId(key)}
                            question={{ ...q, questionNumber: qNum }}
                            questionKey={key}
                            pickedIndex={answers[key]}
                            onPick={(ci) => handlePick(key, ci)}
                          />
                        );
                      })}
                    </>
                  )}
                </section>
              );
            })}
            </>
          )}

          <section className="grammar-block exam-submit-block">
            <button
              type="button"
              className="vocab-cta-btn"
              onClick={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? t("examPage.submitting") : t("examPage.submit")}
            </button>
          </section>
        </article>
          </div>

          <ExamTakeSidebar
            key={timerKey}
            durationMinutes={paper.durationMinutes ?? 0}
            paused={submitting}
            questionGroups={questionGroups}
            answers={answers}
            activeSection={activeSection}
            onJumpToQuestion={handleJumpToQuestion}
          />
        </div>
      </JlptLockGate>
    </Layout>
  );
}
