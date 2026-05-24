import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth.jsx";
import {
  useSpeechRecognition,
  speakJapanese,
} from "../hooks/useSpeechRecognition.js";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  getKaiwaContextById,
  postKaiwaPracticeTurnSafe,
} from "../services/kaiwaService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { isJlptLockedError } from "../utils/jlptAccess.js";
import JlptLockGate from "../components/study/JlptLockGate.jsx";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./GrammarPages.css";
import {
  KaiwaChatBubbleIcon,
  KaiwaCoachIcon,
  KaiwaReplayIcon,
} from "../components/kaiwa/KaiwaIcons.jsx";
import "./KaiwaPages.css";

function roleLabel(role, lang) {
  const vi = String(role?.nameVi ?? "").trim();
  const ja = String(role?.nameJa ?? "").trim();
  if (lang.startsWith("ja") && ja) return ja;
  return vi || ja || "—";
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-3 6v3h2v2H8v-2h2v-3h2z" />
    </svg>
  );
}

export default function KaiwaPracticePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();
  const lang = i18n.language || "vi";
  const chatEndRef = useRef(null);
  const messagesRef = useRef([]);

  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [jlptLocked, setJlptLocked] = useState(false);
  const [lockedJlpt, setLockedJlpt] = useState("");
  const [userRoleIndex, setUserRoleIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [draft, setDraft] = useState("");
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const partnerRoleIndex = useMemo(() => {
    const roles = context?.roles ?? [];
    if (roles.length < 2) return 0;
    return userRoleIndex === 0 ? 1 : 0;
  }, [context, userRoleIndex]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendTurn = useCallback(
    async (userMessage, history) => {
      if (!id) return;
      setBusy(true);
      setLastFeedback(null);
      try {
        const data = await postKaiwaPracticeTurnSafe(id, {
          userMessage,
          messages: history,
          userRoleIndex,
          partnerRoleIndex,
          sessionId: sessionId ?? undefined,
        });
        if (data.session?.id) {
          setSessionId(data.session.id);
        }
        const turn = data.turn;
        if (!turn?.partnerMessageJa) {
          toast.error(t("kaiwaPractice.aiError"));
          return;
        }
        const partnerMsg = {
          id: `p-${Date.now()}`,
          role: "partner",
          textJa: turn.partnerMessageJa,
          textVi: turn.partnerMessageVi,
        };
        setMessages((prev) => [...prev, partnerMsg]);
        setLastFeedback({
          analysis: turn.analysis,
          suggestion: turn.suggestion,
          source: data.source,
        });
        speakJapanese(turn.partnerMessageJa);
        if (turn.conversationEnded) {
          toast.message(t("kaiwaPractice.sceneEnd"));
        }
      } catch (err) {
        const detail =
          err &&
          typeof err === "object" &&
          Array.isArray(/** @type {{ errors?: { message?: string }[] }} */ (err).errors)
            ? /** @type {{ errors?: { message?: string }[] }} */ (err).errors
                ?.map((e) => e.message)
                .filter(Boolean)
                .join(" · ")
            : "";
        toast.error(t("kaiwaPractice.sendFailed"), {
          description: detail || getApiErrorMessage(err, t),
        });
      } finally {
        setBusy(false);
      }
    },
    [id, userRoleIndex, partnerRoleIndex, sessionId, t],
  );

  const submitDraft = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || busy) return;
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      textJa: trimmed,
    };
    const history = messagesRef.current;
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    await sendTurn(trimmed, history);
  }, [busy, draft, sendTurn]);

  const { supported: speechSupported, listening, interim, start, stop } =
    useSpeechRecognition({
      lang: "ja-JP",
      commitOnStop: true,
      onTranscriptReady: (text) => {
        setDraft((prev) => {
          const base = prev.trim();
          return base ? `${base} ${text}` : text;
        });
        toast.message(t("kaiwaPractice.voiceReady"), {
          description: t("kaiwaPractice.voiceReadyHint"),
        });
      },
    });

  const handleMicClick = () => {
    if (listening) stop();
    else start();
  };

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const item = await getKaiwaContextById(id);
        if (!cancelled) setContext(item);
      } catch (err) {
        if (!cancelled) {
          if (isJlptLockedError(err)) {
            setJlptLocked(true);
            setLockedJlpt(
              /** @type {{ errors?: { message?: string }[] }} */ (err).errors?.[0]
                ?.message ?? "",
            );
          } else {
            toast.error(getApiErrorMessage(err, t));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, id, t]);

  const startSession = async () => {
    if (started || busy) return;
    setStarted(true);
    setMessages([]);
    messagesRef.current = [];
    await sendTurn("", []);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, lastFeedback, busy]);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  if (loading) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
        <p className="vocab-empty">{t("common.loading")}</p>
      </Layout>
    );
  }

  if (jlptLocked) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
        <JlptLockGate level={lockedJlpt} backTo="/kaiwa" />
      </Layout>
    );
  }

  if (!context) {
    return <Navigate to="/kaiwa" replace />;
  }

  const roles = context.roles ?? [];
  const jlptSlug = String(context.jlpt || "n5").toLowerCase();
  const partnerName = roleLabel(roles[partnerRoleIndex], lang);

  return (
    <Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.kaiwa"), to: "/kaiwa" },
          { label: context.titleVi, to: `/kaiwa/${id}` },
          { label: t("kaiwaPractice.title") },
        ]}
      />

      <article className="kaiwa-practice-page kaiwa-scope vocab-scope">
        <header className="kaiwa-practice-hero">
          <div className="kaiwa-practice-hero-text">
            <div className="kaiwa-practice-hero__kicker">
              <span className={`reading-badge reading-badge--${jlptSlug}`} lang="ja">
                {context.jlpt}
              </span>
            </div>
            <h1>{context.titleVi}</h1>
            <p>{t("kaiwaPractice.subtitle")}</p>
          </div>
          <div className="kaiwa-practice-hero__actions">
            {!started ? (
              <button
                type="button"
                className="kaiwa-btn kaiwa-btn--primary"
                disabled={busy}
                onClick={() => void startSession()}
              >
                {t("kaiwaPractice.start")}
              </button>
            ) : sessionId ? (
              <Link
                to={`/kaiwa/sessions/${sessionId}`}
                className="kaiwa-practice-hero__link"
              >
                {t("kaiwaPractice.viewHistory")}
              </Link>
            ) : null}
          </div>
        </header>

        {!started ? (
          <section className="kaiwa-setup-card" aria-labelledby="kaiwa-pick-role">
            <h2 id="kaiwa-pick-role">{t("kaiwaPractice.pickRole")}</h2>
            <p className="kaiwa-setup-card__lead">
              {t("kaiwaPractice.aiPlays", { name: partnerName })}
            </p>
            <div className="kaiwa-role-grid">
              {roles.map((role, idx) => (
                <label
                  key={`role-${idx}`}
                  className={`kaiwa-role-card-select${userRoleIndex === idx ? " kaiwa-role-card-select--active" : ""}`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    checked={userRoleIndex === idx}
                    disabled={busy}
                    onChange={() => setUserRoleIndex(idx)}
                  />
                  <span className="kaiwa-role-card-select__index" aria-hidden>
                    {idx + 1}
                  </span>
                  <span className="kaiwa-role-card-select__name" lang="ja">
                    {roleLabel(role, lang)}
                  </span>
                  <span className="kaiwa-role-card-select__tag">
                    {t("kaiwaPractice.youPlay")}
                  </span>
                </label>
              ))}
            </div>
            <p className="kaiwa-partner-hint">
              <span className="kaiwa-partner-hint__icon" aria-hidden>
                AI
              </span>
              {t("kaiwaPractice.aiPlays", { name: partnerName })}
            </p>
          </section>
        ) : (
          <div className="kaiwa-practice-layout">
            <section className="kaiwa-chat-panel">
              <div className="kaiwa-chat-panel__head">
                <span className="kaiwa-chat-panel__title">
                  <span className="kaiwa-chat-panel__title-icon" aria-hidden>
                    <KaiwaChatBubbleIcon />
                  </span>
                  {t("kaiwaPractice.chatTitle")}
                </span>
                <span className="kaiwa-chat-panel__partner">
                  {t("kaiwaPractice.withPartner", { name: partnerName })}
                </span>
              </div>
              <div className="kaiwa-chat" role="log" aria-live="polite">
                {messages.length === 0 && !busy ? (
                  <div className="kaiwa-chat-empty">
                    <div className="kaiwa-chat-empty__icon" aria-hidden>
                      💬
                    </div>
                    <p>{t("kaiwaPractice.emptyChat")}</p>
                  </div>
                ) : null}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`kaiwa-bubble kaiwa-bubble--${m.role}`}
                  >
                    <div className="kaiwa-bubble__avatar" aria-hidden>
                      {m.role === "partner" ? "相" : "私"}
                    </div>
                    <div className="kaiwa-bubble__body">
                      <span className="kaiwa-bubble__who">
                        {m.role === "partner"
                          ? partnerName
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
                ))}
                {busy ? (
                  <div className="kaiwa-thinking">
                    <span className="kaiwa-thinking__dots" aria-hidden />
                    {t("kaiwaPractice.thinking")}
                  </div>
                ) : null}
                <div ref={chatEndRef} />
              </div>

              <footer className="kaiwa-composer">
                {(listening || interim) && (
                  <div className="kaiwa-live-transcript" lang="ja">
                    <span className="kaiwa-live-transcript__label">
                      {listening
                        ? t("kaiwaPractice.listening")
                        : t("kaiwaPractice.transcriptLabel")}
                    </span>
                    <span>
                      {draft.trim() ? `${draft.trim()} ` : ""}
                      {interim}
                      {listening ? "…" : ""}
                    </span>
                  </div>
                )}
                <textarea
                  className="kaiwa-composer__input"
                  rows={3}
                  value={draft}
                  placeholder={t("kaiwaPractice.inputPlaceholder")}
                  disabled={busy}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void submitDraft();
                    }
                  }}
                />
                <div className="kaiwa-composer__actions">
                  <button
                    type="button"
                    className={`kaiwa-mic${listening ? " kaiwa-mic--recording" : ""}`}
                    disabled={busy || !speechSupported}
                    onClick={handleMicClick}
                    aria-pressed={listening}
                  >
                    <MicIcon />
                    <span>
                      {listening
                        ? t("kaiwaPractice.micStop")
                        : t("kaiwaPractice.micStart")}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="kaiwa-btn kaiwa-btn--primary"
                    disabled={busy || listening || !draft.trim()}
                    onClick={() => void submitDraft()}
                  >
                    {busy ? t("kaiwaPractice.sending") : t("kaiwaPractice.send")}
                  </button>
                </div>
                <p className="kaiwa-composer__hint">
                  {speechSupported
                    ? t("kaiwaPractice.flowHint")
                    : t("kaiwaPractice.micUnsupported")}
                </p>
              </footer>
            </section>

            <aside className="kaiwa-coach-panel">
              <div className="kaiwa-coach-panel__head">
                <span className="kaiwa-coach-panel__head-icon" aria-hidden>
                  <KaiwaCoachIcon />
                </span>
                <h2>{t("kaiwaPractice.coachTitle")}</h2>
              </div>
              <div className="kaiwa-coach-panel__body">
                {!lastFeedback ? (
                  <p className="kaiwa-coach-empty">{t("kaiwaPractice.coachEmpty")}</p>
                ) : (
                  <>
                    {lastFeedback.analysis?.summaryVi ? (
                      <div className="kaiwa-coach-block">
                        <h3>{t("kaiwaPractice.feedbackSummary")}</h3>
                        <p>{lastFeedback.analysis.summaryVi}</p>
                      </div>
                    ) : null}
                    {lastFeedback.analysis?.grammarNoteVi ? (
                      <div className="kaiwa-coach-block">
                        <h3>{t("kaiwaPractice.grammar")}</h3>
                        <p>{lastFeedback.analysis.grammarNoteVi}</p>
                      </div>
                    ) : null}
                    {lastFeedback.analysis?.politenessVi ? (
                      <div className="kaiwa-coach-block">
                        <h3>{t("kaiwaPractice.politeness")}</h3>
                        <p>{lastFeedback.analysis.politenessVi}</p>
                      </div>
                    ) : null}
                    {lastFeedback.suggestion?.replyJa ? (
                      <div className="kaiwa-suggestion-card">
                        <h3>{t("kaiwaPractice.suggestedReply")}</h3>
                        <p className="kaiwa-suggestion-card__ja" lang="ja">
                          {lastFeedback.suggestion.replyJa}
                        </p>
                        {lastFeedback.suggestion.replyReading ? (
                          <p className="kaiwa-suggestion-card__reading" lang="ja">
                            {lastFeedback.suggestion.replyReading}
                          </p>
                        ) : null}
                        {lastFeedback.suggestion.replyVi ? (
                          <p className="kaiwa-suggestion-card__vi">
                            {lastFeedback.suggestion.replyVi}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          className="kaiwa-btn kaiwa-btn--ghost kaiwa-btn--small"
                          onClick={() =>
                            setDraft(lastFeedback.suggestion.replyJa ?? "")
                          }
                        >
                          {t("kaiwaPractice.useSuggestion")}
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </aside>
          </div>
        )}

        <p className="kaiwa-back-link">
          <Link to={`/kaiwa/${id}`}>← {t("kaiwaPractice.backContext")}</Link>
        </p>
      </article>
    </Layout>
  );
}
