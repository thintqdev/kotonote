import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import listeningService from "../services/listeningService.js";
import { LISTENING_ASSETS } from "../constants/listeningAssets.js";
import { getListeningTypeLabel } from "../constants/listeningFieldMeta.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { resolvePublicMediaUrl } from "../utils/resolveAvatarUrl.js";
import { useJlptAccess } from "../hooks/useJlptAccess.js";
import JlptLockedOverlay from "../components/study/JlptLockedOverlay.jsx";
import "../components/study/JlptLockGate.css";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./ReadingListPage.css";

function ListeningIconHeadphone() {
  return (
    <svg
      className="reading-ico"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 14v-2a8 8 0 0116 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M4 14a2 2 0 002 2v2a2 2 0 01-2 2H3v-6h1zm16 0a2 2 0 00-2 2v2a2 2 0 002 2h1v-6h-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListeningIconClock() {
  return (
    <svg
      className="reading-ico"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 8v5l3 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Chuỗi id ổn định — bỏ qua `id: ""` từ API (?? không coi "" là thiếu). */
function resolveListeningId(item) {
  const row = /** @type {{ id?: unknown; _id?: unknown }} */ (item);
  for (const candidate of [row.id, row._id]) {
    if (candidate == null) continue;
    const s = String(candidate).trim();
    if (s && s !== "undefined" && s !== "null") return s;
  }
  return null;
}

/** @param {unknown} item @param {number} index */
function listeningItemKey(item, index) {
  const id = resolveListeningId(item);
  return id ? `listening-${id}` : `listening-row-${index}`;
}

/** @param {number} sec */
function splitDuration(sec) {
  const n = Math.max(0, Number(sec) || 0);
  return { min: Math.floor(n / 60), sec: n % 60 };
}

export default function ListeningPage() {
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
          await listeningService.getAllPublished({
            jlpt: jlpt || undefined,
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
      return t("listeningPage.jlptLockedEmpty", { level: jlpt });
    }
    return t("listeningPage.noResults");
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
          { label: t("breadcrumb.listening") },
        ]}
      />

      <article
        className="vocab-sheet vocab-scope vocab-notebook vocab-lesson-scope"
        aria-labelledby="listening-list-title"
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
              <h1 id="listening-list-title" className="vocab-lesson-title">
                {t("listeningPage.listTitle")}
              </h1>
              <p className="vocab-lesson-sub">
                <span className="reading-sub-kicker" lang="ja">
                  {t("listeningPage.kickerJa")}
                </span>
                <span className="reading-sub-sep"> · </span>
                <span>{t("listeningPage.kicker")}</span>
                <span className="reading-sub-sep"> — </span>
                {t("listeningPage.listSubtitle")}
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
          aria-label={t("listeningPage.filterAria")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={!jlpt}
            className={`vocab-tab${!jlpt ? " vocab-tab--active" : ""}`}
            onClick={() => setJlpt("")}
          >
            {t("listeningPage.filterAll")}
          </button>
          {jlptLevels.map((lv) => (
            <button
              key={`jlpt-tab-${lv}`}
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
              const key = listeningItemKey(item, index);
              const thumbSrc =
                resolvePublicMediaUrl(item.image) ||
                LISTENING_ASSETS.placeholderThumb;
              const locked = item.locked || isLocked(item.jlpt);
              const { min, sec } = splitDuration(item.duration);
              const jlptSlug = String(item.jlpt || "n3").toLowerCase();

              const rowInner = (
                <>
                  <div className="reading-thumb-wrap listening-thumb-wrap">
                    <img
                      className={`reading-thumb${!item.image ? " reading-thumb--placeholder" : ""}`}
                      src={thumbSrc}
                      alt=""
                      width={200}
                      height={140}
                      loading="lazy"
                      decoding="async"
                    />
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
                        <ListeningIconHeadphone />
                        {t("listeningPage.metaQuestions", {
                          n: item.questions?.length ?? 0,
                        })}
                      </span>
                      <span className="reading-meta-item">
                        <ListeningIconClock />
                        {t("listeningPage.metaDuration", { min, sec })}
                      </span>
                      {item.type ? (
                        <span className="reading-meta-item reading-meta-item--type">
                          {getListeningTypeLabel(item.type)}
                        </span>
                      ) : null}
                    </div>
                    <span className="reading-row-cta vocab-cta-btn reading-cta--not_started">
                      {t("listeningPage.ctaStart")}
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

              const itemId = resolveListeningId(item);
              if (!itemId) return null;

              return (
                <li key={key} className="vocab-lesson-card">
                  <Link
                    className="reading-row-link"
                    to={`/listening/${itemId}`}
                  >
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
