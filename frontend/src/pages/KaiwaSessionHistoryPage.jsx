import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  getKaiwaContextById,
  listKaiwaContextPracticeSessions,
} from "../services/kaiwaService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { isJlptLockedError } from "../utils/jlptAccess.js";
import JlptLockGate from "../components/study/JlptLockGate.jsx";
import { KaiwaHistoryIcon } from "../components/kaiwa/KaiwaIcons.jsx";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./GrammarPages.css";
import "./KaiwaPages.css";

function formatWhen(iso, lang) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(lang.startsWith("ja") ? "ja-JP" : "vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(iso);
  }
}

export default function KaiwaSessionHistoryPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { id: contextId } = useParams();
  const lang = i18n.language || "vi";

  const [context, setContext] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jlptLocked, setJlptLocked] = useState(false);
  const [lockedJlpt, setLockedJlpt] = useState("");

  useEffect(() => {
    if (!user || !contextId) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [ctx, list] = await Promise.all([
          getKaiwaContextById(contextId),
          listKaiwaContextPracticeSessions(contextId, { limit: 50 }),
        ]);
        if (cancelled) return;
        setContext(ctx);
        setSessions(list.items ?? []);
      } catch (err) {
        if (!cancelled && isJlptLockedError(err)) {
          const level =
            err &&
            typeof err === "object" &&
            Array.isArray(/** @type {{ errors?: { message?: string }[] }} */ (err).errors)
              ? /** @type {{ errors?: { message?: string }[] }} */ (err).errors?.[0]
                  ?.message
              : "";
          setLockedJlpt(level || "");
          setJlptLocked(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, contextId]);

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

  if (jlptLocked) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
        <JlptLockGate level={lockedJlpt} backTo="/kaiwa" />
      </Layout>
    );
  }

  if (!context) return <Navigate to="/kaiwa" replace />;

  const jlptSlug = String(context.jlpt || "n5").toLowerCase();

  return (
    <Layout userName={headerName} streakDays={mockStreak.days} pageClassName="vocab-dash">
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.kaiwa"), to: "/kaiwa" },
          { label: context.titleVi, to: `/kaiwa/${contextId}` },
          { label: t("kaiwaHistory.title") },
        ]}
      />

      <article className="kaiwa-history-page kaiwa-scope vocab-scope">
        <header className="kaiwa-history-hero">
          <span className={`reading-badge reading-badge--${jlptSlug}`} lang="ja">
            {context.jlpt}
          </span>
          <h1>{t("kaiwaHistory.title")}</h1>
          <p>{context.titleVi}</p>
        </header>

        {sessions.length === 0 ? (
          <div className="kaiwa-setup-card">
            <p className="kaiwa-history-empty">{t("kaiwaHistory.empty")}</p>
            <Link
              className="kaiwa-btn kaiwa-btn--primary kaiwa-history-empty-cta"
              to={`/kaiwa/${contextId}/practice`}
            >
              {t("kaiwaPage.startPractice")}
            </Link>
          </div>
        ) : (
          <ul className="kaiwa-session-list">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/kaiwa/sessions/${s.id}`}
                  className="kaiwa-session-list__item"
                >
                  <span className="kaiwa-session-list__icon" aria-hidden>
                    <KaiwaHistoryIcon />
                  </span>
                  <div className="kaiwa-session-list__main">
                    <div className="kaiwa-session-list__meta">
                      <time dateTime={s.lastActivityAt}>
                        {formatWhen(s.lastActivityAt, lang)}
                      </time>
                      <span
                        className={
                          s.isCompleted
                            ? "kaiwa-session-badge kaiwa-session-badge--done"
                            : "kaiwa-session-badge"
                        }
                      >
                        {s.isCompleted
                          ? t("kaiwaHistory.completed")
                          : t("kaiwaHistory.inProgress")}
                      </span>
                    </div>
                    <p className="kaiwa-session-list__stats">
                      {t("kaiwaHistory.stats", {
                        turns: s.turnCount ?? 0,
                        messages: s.messageCount ?? 0,
                      })}
                    </p>
                  </div>
                  <span className="kaiwa-session-list__chevron" aria-hidden>
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="kaiwa-back-link">
          <Link to={`/kaiwa/${contextId}`}>← {t("kaiwaHistory.backContext")}</Link>
        </p>
      </article>
    </Layout>
  );
}
