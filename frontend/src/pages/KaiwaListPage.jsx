import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import { listPublishedKaiwaContexts } from "../services/kaiwaService.js";
import { kaiwaCategoryLabelI18n } from "../constants/kaiwaFieldMeta.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { useJlptAccess } from "../hooks/useJlptAccess.js";
import JlptLockedOverlay from "../components/study/JlptLockedOverlay.jsx";
import "../components/study/JlptLockGate.css";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./ReadingListPage.css";

function KaiwaChatIcon() {
  return (
    <svg
      className="reading-ico kaiwa-list-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 10h8M8 14h5M6 20l2-4h10a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function resolveKaiwaId(item) {
  const row = /** @type {{ id?: unknown; _id?: unknown }} */ (item);
  for (const candidate of [row.id, row._id]) {
    if (candidate == null) continue;
    const s = String(candidate).trim();
    if (s && s !== "undefined" && s !== "null") return s;
  }
  return null;
}

/** @param {unknown} item @param {number} index */
function kaiwaItemKey(item, index) {
  const id = resolveKaiwaId(item);
  return id ? `kaiwa-${id}` : `kaiwa-row-${index}`;
}

export default function KaiwaListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isLocked } = useJlptAccess();
  const [searchParams, setSearchParams] = useSearchParams();

  const jlpt = (searchParams.get("jlpt") || "").trim();

  const [list, setList] = useState([]);
  const [jlptLevels, setJlptLevels] = useState([]);
  const [requestedJlptLocked, setRequestedJlptLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { items, jlptLevels: levels, requestedJlptLocked: locked } =
          await listPublishedKaiwaContexts({
            jlpt: jlpt || undefined,
            limit: 50,
          });
        if (cancelled) return;
        setList(Array.isArray(items) ? items : []);
        setJlptLevels(
          levels?.length
            ? [...new Set(levels.map((lv) => String(lv).trim()).filter(Boolean))]
            : [],
        );
        setRequestedJlptLocked(Boolean(locked));
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, t));
          setList([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, jlpt, t]);

  const setJlpt = (next) => {
    const p = new URLSearchParams(searchParams);
    if (next) p.set("jlpt", next);
    else p.delete("jlpt");
    setSearchParams(p, { replace: true });
  };

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const emptyMessage = useMemo(() => {
    if (requestedJlptLocked && jlpt) {
      return t("kaiwaPage.jlptLockedEmpty", { level: jlpt });
    }
    return t("kaiwaPage.noResults");
  }, [requestedJlptLocked, jlpt, t]);

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

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      pageClassName="vocab-dash"
    >
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.kaiwa") },
        ]}
      />

      <article
        className="vocab-sheet vocab-scope vocab-notebook vocab-lesson-scope"
        aria-labelledby="kaiwa-list-title"
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
              <h1 id="kaiwa-list-title" className="vocab-lesson-title">
                {t("kaiwaPage.listTitle")}
              </h1>
              <p className="vocab-lesson-sub">
                <span className="reading-sub-kicker" lang="ja">
                  {t("kaiwaPage.kickerJa")}
                </span>
                <span className="reading-sub-sep"> · </span>
                <span>{t("kaiwaPage.kicker")}</span>
                <span className="reading-sub-sep"> — </span>
                {t("kaiwaPage.listSubtitle")}
              </p>
            </div>
          </div>
        </header>

        {error ? (
          <p className="vocab-empty" role="alert">
            {error}
          </p>
        ) : null}

        <div
          className="vocab-tabs reading-jlpt-tabs"
          role="tablist"
          aria-label={t("kaiwaPage.filterAria")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={!jlpt}
            className={`vocab-tab${!jlpt ? " vocab-tab--active" : ""}`}
            onClick={() => setJlpt("")}
          >
            {t("kaiwaPage.filterAll")}
          </button>
          {jlptLevels.map((lv) => (
            <button
              key={`kaiwa-jlpt-${lv}`}
              type="button"
              role="tab"
              aria-selected={jlpt === lv}
              className={`vocab-tab${jlpt === lv ? " vocab-tab--active" : ""}${isLocked(lv) ? " vocab-tab--jlpt-locked" : ""}`}
              onClick={() => setJlpt(lv)}
            >
              {isLocked(lv) ? t("jlptAccess.tabLocked", { level: lv }) : lv}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="vocab-empty" role="status">
            {emptyMessage}
          </p>
        ) : (
          <ul className="vocab-lesson-list">
            {list.map((item, index) => {
              const key = kaiwaItemKey(item, index);
              const locked = item.locked || isLocked(item.jlpt);
              const jlptSlug = String(item.jlpt || "n5").toLowerCase();
              const phraseCount = item.keyPhrases?.length ?? 0;
              const roleCount = item.roles?.length ?? 0;

              const rowInner = (
                <>
                  <div className="reading-thumb-wrap listening-thumb-wrap kaiwa-thumb-wrap">
                    <div className="kaiwa-thumb-placeholder" aria-hidden>
                      <KaiwaChatIcon />
                    </div>
                  </div>
                  <div className="vocab-lesson-main reading-row-main">
                    <div className="reading-row-titleline">
                      <span
                        className={`reading-badge reading-badge--${jlptSlug}`}
                        lang="ja"
                      >
                        {item.jlpt}
                      </span>
                      <h2 className="vocab-lesson-card-title reading-row-title">
                        {item.titleVi}
                      </h2>
                    </div>
                    {item.titleJa ? (
                      <p
                        className="vocab-lesson-card-sub reading-row-snippet"
                        lang="ja"
                      >
                        {item.titleJa}
                      </p>
                    ) : null}
                    <div className="reading-row-meta">
                      <span className="reading-meta-item">
                        <KaiwaChatIcon />
                        {kaiwaCategoryLabelI18n(t, item.category)}
                      </span>
                      <span className="reading-meta-item">
                        {t("kaiwaPage.metaRoles", { n: roleCount })}
                      </span>
                      <span className="reading-meta-item">
                        {t("kaiwaPage.metaPhrases", { n: phraseCount })}
                      </span>
                    </div>
                    <span className="reading-row-cta vocab-cta-btn reading-cta--not_started">
                      {t("kaiwaPage.ctaPractice")}
                    </span>
                  </div>
                  {!locked ? (
                    <span className="vocab-lesson-chevron" aria-hidden>
                      ›
                    </span>
                  ) : null}
                </>
              );

              if (locked) {
                return (
                  <li
                    key={key}
                    className="reading-card-wrap--locked vocab-lesson-card"
                  >
                    <div className="reading-row-link reading-card--jlpt-locked">
                      {rowInner}
                    </div>
                    <JlptLockedOverlay level={item.jlpt} />
                  </li>
                );
              }

              const itemId = resolveKaiwaId(item);
              if (!itemId) return null;

              return (
                <li key={key} className="vocab-lesson-card">
                  <Link className="reading-row-link" to={`/kaiwa/${itemId}`}>
                    {rowInner}
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
