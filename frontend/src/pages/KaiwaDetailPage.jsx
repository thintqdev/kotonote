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
import { kaiwaCategoryLabelI18n } from "../constants/kaiwaFieldMeta.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { isJlptLockedError } from "../utils/jlptAccess.js";
import JlptLockGate from "../components/study/JlptLockGate.jsx";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./GrammarPages.css";
import "./ReadingListPage.css";
import { KaiwaHistoryIcon } from "../components/kaiwa/KaiwaIcons.jsx";
import "./KaiwaPages.css";

/** @param {{ vi?: string, ja?: string }} pair @param {string} lang */
function pickBilingual(pair, lang) {
  const vi = String(pair?.vi ?? "").trim();
  const ja = String(pair?.ja ?? "").trim();
  const preferJa = lang.startsWith("ja");
  const primary = preferJa && ja ? ja : vi || ja;
  const secondary = preferJa ? vi : ja;
  return { primary, secondary: secondary && secondary !== primary ? secondary : "" };
}

function BilingualBlock({ vi, ja, lang, className = "" }) {
  const { primary, secondary } = pickBilingual({ vi, ja }, lang);
  if (!primary && !secondary) return null;
  return (
    <div className={className}>
      {primary ? (
        <p className={lang.startsWith("ja") && ja ? "grammar-jp-line" : ""}>
          {primary}
        </p>
      ) : null}
      {secondary ? <p className="grammar-vi-note">{secondary}</p> : null}
    </div>
  );
}

export default function KaiwaDetailPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();
  const lang = i18n.language || "vi";

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jlptLocked, setJlptLocked] = useState(false);
  const [lockedJlpt, setLockedJlpt] = useState("");
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [item, sessionsRes] = await Promise.all([
          getKaiwaContextById(id),
          listKaiwaContextPracticeSessions(id, { limit: 5 }).catch(() => ({
            items: [],
          })),
        ]);
        if (cancelled) return;
        if (item) setDetail(item);
        else setError(t("kaiwaPage.notFound"));
        setRecentSessions(sessionsRes.items ?? []);
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
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, id, t]);

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

  if (jlptLocked) {
    return (
      <Layout
        userName={headerName}
        streakDays={mockStreak.days}
        pageClassName="vocab-dash"
      >
        <JlptLockGate level={lockedJlpt} backTo="/kaiwa" />
      </Layout>
    );
  }

  if (!detail) {
    return <Navigate to="/kaiwa" replace />;
  }

  const jlptSlug = String(detail.jlpt || "n5").toLowerCase();

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      pageClassName="vocab-dash"
    >
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.kaiwa"), to: "/kaiwa" },
          { label: detail.titleVi || t("kaiwaPage.detailFallback") },
        ]}
      />

      <article
        className="grammar-sheet grammar-scope grammar-detail--journal vocab-scope kaiwa-scope"
        aria-labelledby="kaiwa-detail-title"
      >
        <Link className="grammar-back" to="/kaiwa">
          {t("kaiwaPage.backToList")}
        </Link>

        <header className="grammar-detail-head">
          <p className="grammar-detail-kicker">
            <span className={`reading-badge reading-badge--${jlptSlug}`} lang="ja">
              {detail.jlpt}
            </span>
            {" · "}
            {kaiwaCategoryLabelI18n(t, detail.category)}
            {" · "}
            <span lang="ja">{t("kaiwaPage.kickerJa")}</span>
          </p>
          <h1 id="kaiwa-detail-title" className="grammar-detail-title">
            {detail.titleVi}
          </h1>
          {detail.titleJa ? (
            <p className="grammar-detail-ribbon" lang="ja">
              {detail.titleJa}
            </p>
          ) : null}
          <p className="kaiwa-detail-lead">{t("kaiwaPage.detailLead")}</p>
        </header>

        {error ? (
          <p className="vocab-empty" role="alert">
            {error}
          </p>
        ) : null}

        <section className="grammar-block kaiwa-detail-section">
          <h2 className="grammar-h">{t("kaiwaPage.sectionSetting")}</h2>
          <BilingualBlock
            vi={detail.settingVi}
            ja={detail.settingJa}
            lang={lang}
          />
        </section>

        <section className="grammar-block kaiwa-detail-section">
          <h2 className="grammar-h">{t("kaiwaPage.sectionSituation")}</h2>
          <BilingualBlock
            vi={detail.situationVi}
            ja={detail.situationJa}
            lang={lang}
          />
        </section>

        {detail.roles?.length > 0 ? (
          <section className="grammar-block kaiwa-detail-section">
            <h2 className="grammar-h">{t("kaiwaPage.sectionRoles")}</h2>
            {detail.roles.map((role, idx) => {
              const name = pickBilingual(
                { vi: role.nameVi, ja: role.nameJa },
                lang,
              );
              const desc = pickBilingual(
                {
                  vi: role.descriptionVi,
                  ja: role.descriptionJa,
                },
                lang,
              );
              return (
                <div key={`role-${idx}`} className="grammar-box grammar-box--soft kaiwa-role-card">
                  {name.primary ? <h3>{name.primary}</h3> : null}
                  {name.secondary ? (
                    <p className="grammar-vi-note">{name.secondary}</p>
                  ) : null}
                  {desc.primary ? <p>{desc.primary}</p> : null}
                  {desc.secondary ? (
                    <p className="grammar-vi-note">{desc.secondary}</p>
                  ) : null}
                </div>
              );
            })}
          </section>
        ) : null}

        {(detail.objectivesVi || detail.objectivesJa) && (
          <section className="grammar-block kaiwa-detail-section">
            <h2 className="grammar-h">{t("kaiwaPage.sectionObjectives")}</h2>
            <BilingualBlock
              vi={detail.objectivesVi}
              ja={detail.objectivesJa}
              lang={lang}
            />
          </section>
        )}

        {detail.keyPhrases?.length > 0 ? (
          <section className="grammar-block kaiwa-detail-section">
            <h2 className="grammar-h">{t("kaiwaPage.sectionPhrases")}</h2>
            <div className="grammar-box admin-grammar-table-wrap">
              <table className="kaiwa-phrase-table">
                <thead>
                  <tr>
                    <th>{t("kaiwaPage.phraseJa")}</th>
                    <th>{t("kaiwaPage.phraseReading")}</th>
                    <th>{t("kaiwaPage.phraseMeaning")}</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.keyPhrases.map((p, idx) => (
                    <tr key={`phrase-${idx}`}>
                      <td lang="ja">{p.phraseJa}</td>
                      <td lang="ja">
                        {p.reading ? (
                          <span className="kaiwa-phrase-reading">
                            {p.reading}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{p.meaningVi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {(detail.culturalNotesVi || detail.culturalNotesJa) && (
          <section className="grammar-block kaiwa-detail-section">
            <h2 className="grammar-h">{t("kaiwaPage.sectionCulture")}</h2>
            <BilingualBlock
              vi={detail.culturalNotesVi}
              ja={detail.culturalNotesJa}
              lang={lang}
            />
          </section>
        )}

        <section
          className="grammar-block kaiwa-action-card"
          aria-labelledby="kaiwa-practice-cta"
        >
          <div className="kaiwa-action-card__text">
            <h2 id="kaiwa-practice-cta">{t("kaiwaPage.startPractice")}</h2>
            <p>{t("kaiwaPage.practiceHint")}</p>
          </div>
          <div className="kaiwa-action-card__btns">
            <Link className="kaiwa-btn kaiwa-btn--primary" to={`/kaiwa/${id}/practice`}>
              {t("kaiwaPage.startPractice")}
            </Link>
            {recentSessions.length > 0 ? (
              <Link className="kaiwa-btn kaiwa-btn--ghost" to={`/kaiwa/${id}/history`}>
                {t("kaiwaPage.viewAllHistory")}
              </Link>
            ) : null}
          </div>
        </section>

        <section
          className="grammar-block kaiwa-history-card"
          aria-labelledby="kaiwa-history-heading"
        >
          <div className="kaiwa-history-card__head">
            <h2 id="kaiwa-history-heading">{t("kaiwaPage.sectionHistory")}</h2>
            {recentSessions.length > 0 ? (
              <Link to={`/kaiwa/${id}/history`} className="kaiwa-history-card__all">
                {t("kaiwaPage.viewAllHistory")}
              </Link>
            ) : null}
          </div>
          {recentSessions.length === 0 ? (
            <p className="kaiwa-history-empty">{t("kaiwaPage.noSessions")}</p>
          ) : (
            <ul className="kaiwa-session-list kaiwa-session-list--compact">
              {recentSessions.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/kaiwa/sessions/${s.id}`}
                    className="kaiwa-session-list__item"
                  >
                    <span className="kaiwa-session-list__icon" aria-hidden>
                      <KaiwaHistoryIcon />
                    </span>
                    <div className="kaiwa-session-list__main">
                      <p className="kaiwa-session-list__stats">
                        {t("kaiwaHistory.stats", {
                          turns: s.turnCount ?? 0,
                          messages: s.messageCount ?? 0,
                        })}
                      </p>
                    </div>
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
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

      </article>
    </Layout>
  );
}
