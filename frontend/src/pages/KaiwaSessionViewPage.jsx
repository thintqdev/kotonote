import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import { speakJapanese } from "../hooks/useSpeechRecognition.js";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import { getKaiwaPracticeSession } from "../services/kaiwaService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { KaiwaReplayIcon } from "../components/kaiwa/KaiwaIcons.jsx";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./GrammarPages.css";
import "./KaiwaPages.css";

function CoachFromMessage({ coach, t }) {
  if (!coach) return null;
  const suggestion = coach.suggestion;
  const hasContent =
    coach.summaryVi ||
    coach.grammarNoteVi ||
    coach.politenessVi ||
    suggestion?.replyJa;
  if (!hasContent) return null;

  return (
    <div className="kaiwa-session-coach">
      {coach.summaryVi ? (
        <div className="kaiwa-coach-block">
          <h4>{t("kaiwaPractice.feedbackSummary")}</h4>
          <p>{coach.summaryVi}</p>
        </div>
      ) : null}
      {coach.grammarNoteVi ? (
        <div className="kaiwa-coach-block">
          <h4>{t("kaiwaPractice.grammar")}</h4>
          <p>{coach.grammarNoteVi}</p>
        </div>
      ) : null}
      {coach.politenessVi ? (
        <div className="kaiwa-coach-block">
          <h4>{t("kaiwaPractice.politeness")}</h4>
          <p>{coach.politenessVi}</p>
        </div>
      ) : null}
      {suggestion?.replyJa ? (
        <div className="kaiwa-suggestion-card">
          <h4>{t("kaiwaPractice.suggestedReply")}</h4>
          <p className="kaiwa-suggestion-card__ja" lang="ja">
            {suggestion.replyJa}
          </p>
          {suggestion.replyReading ? (
            <p className="kaiwa-suggestion-card__reading" lang="ja">
              {suggestion.replyReading}
            </p>
          ) : null}
          {suggestion.replyVi ? (
            <p className="kaiwa-suggestion-card__vi">{suggestion.replyVi}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function KaiwaSessionViewPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !sessionId) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getKaiwaPracticeSession(sessionId);
        if (!cancelled) setSession(data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, t));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, sessionId, t]);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  if (!user) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
        <p className="vocab-empty">{t("common.loading")}</p>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
        <p className="vocab-empty" role="alert">
          {error || t("kaiwaSession.notFound")}
        </p>
        <p className="kaiwa-back-link">
          <Link to="/kaiwa">{t("kaiwaPage.backToList")}</Link>
        </p>
      </Layout>
    );
  }

  const contextId = session.contextId;
  const messages = session.messages ?? [];
  const jlptSlug = String(session.jlpt || "n5").toLowerCase();

  return (
    <Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.kaiwa"), to: "/kaiwa" },
          {
            label: session.contextTitleVi || t("kaiwaPage.detailFallback"),
            to: `/kaiwa/${contextId}`,
          },
          { label: t("kaiwaSession.title") },
        ]}
      />

      <article className="kaiwa-session-view kaiwa-scope vocab-scope">
        <header className="kaiwa-session-hero">
          <div className="kaiwa-session-hero__meta">
            <span className={`reading-badge reading-badge--${jlptSlug}`} lang="ja">
              {session.jlpt}
            </span>
            <span
              className={
                session.isCompleted
                  ? "kaiwa-session-badge kaiwa-session-badge--done"
                  : "kaiwa-session-badge"
              }
            >
              {session.isCompleted
                ? t("kaiwaHistory.completed")
                : t("kaiwaHistory.inProgress")}
            </span>
          </div>
          <h1>{session.contextTitleVi}</h1>
          <p className="kaiwa-session-hero__hint">{t("kaiwaSession.replayHint")}</p>
        </header>

        {messages.length === 0 ? (
          <div className="kaiwa-setup-card">
            <p className="kaiwa-history-empty">{t("kaiwaSession.noMessages")}</p>
          </div>
        ) : (
          <div className="kaiwa-chat kaiwa-chat--standalone" role="log">
            {messages.map((m, idx) => (
              <div key={`msg-${idx}`} className="kaiwa-turn-block">
                <div className={`kaiwa-bubble kaiwa-bubble--${m.role}`}>
                  <div className="kaiwa-bubble__avatar" aria-hidden>
                    {m.role === "partner" ? "相" : "私"}
                  </div>
                  <div className="kaiwa-bubble__body">
                    <span className="kaiwa-bubble__who">
                      {m.role === "partner"
                        ? t("kaiwaPractice.aiPlays", { name: "AI" })
                        : t("kaiwaPractice.you")}
                    </span>
                    <p className="kaiwa-bubble__ja" lang="ja">
                      {m.textJa}
                    </p>
                    {m.textVi ? (
                      <p className="kaiwa-bubble__vi">{m.textVi}</p>
                    ) : null}
                    {m.role === "partner" ? (
                      <button
                        type="button"
                        className="kaiwa-bubble__replay"
                        onClick={() => speakJapanese(m.textJa)}
                      >
                        <KaiwaReplayIcon />
                        {t("kaiwaPractice.replay")}
                      </button>
                    ) : null}
                  </div>
                </div>
                {m.role === "user" && m.coach ? (
                  <CoachFromMessage coach={m.coach} t={t} />
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="kaiwa-session-view__actions">
          <Link
            className="kaiwa-btn kaiwa-btn--primary"
            to={`/kaiwa/${contextId}/practice`}
          >
            {t("kaiwaPage.startPractice")}
          </Link>
          <Link
            className="kaiwa-btn kaiwa-btn--ghost"
            to={`/kaiwa/${contextId}/history`}
          >
            {t("kaiwaSession.backHistory")}
          </Link>
        </div>

        <p className="kaiwa-back-link">
          <Link to={`/kaiwa/${contextId}`}>← {t("kaiwaHistory.backContext")}</Link>
        </p>
      </article>
    </Layout>
  );
}
