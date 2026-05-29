import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import listeningService from "../services/listeningService.js";
import { STUDY_LIST_PAGE_SIZE } from "../constants/deckLessonList.js";
import { JLPT_ORDER } from "../utils/deckStudy.js";
import StudyListPagination from "../components/study/StudyListPagination.jsx";
import {
  parseStudyListPage,
  studyListPath,
  studyListSearchParams,
} from "../utils/studyListNav.js";
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
import "./GrammarPages.css";

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
  const requestedPage = parseStudyListPage(searchParams);

  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [requestedJlptLocked, setRequestedJlptLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchList = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { items, requestedJlptLocked: locked, pagination: pag } =
        await listeningService.getAllPublished({
          jlpt: jlpt || undefined,
          page: requestedPage,
          limit: STUDY_LIST_PAGE_SIZE,
        });
      setList(Array.isArray(items) ? items : []);
      setPagination(pag);
      setRequestedJlptLocked(Boolean(locked));
      const serverPage = pag?.page ?? requestedPage;
      if (serverPage !== requestedPage) {
        setSearchParams(
          studyListSearchParams({ page: serverPage, jlpt }),
          { replace: true },
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t));
      setList([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [user, jlpt, requestedPage, setSearchParams, t]);

  useEffect(() => {
    if (!user) return undefined;
    void fetchList();
    return undefined;
  }, [fetchList, user]);

  const page = pagination?.page ?? requestedPage;
  const totalPages = Math.max(1, pagination?.pages ?? 1);
  const totalItems = pagination?.total ?? 0;

  const setJlpt = (next) => {
    setSearchParams(
      studyListSearchParams({ page: 1, jlpt: next }),
      { replace: true },
    );
  };

  const getPageHref = useCallback(
    (p) => studyListPath("/listening", { page: p, jlpt }),
    [jlpt],
  );

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

  if (loading && !list.length) {
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
          {JLPT_ORDER.map((lv) => (
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

        {loading ? (
          <p className="vocab-empty">{t("common.loading")}</p>
        ) : list.length === 0 ? (
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

        {!loading && !error && totalItems > 0 ? (
          <StudyListPagination
            i18nKey="listeningPage"
            page={page}
            totalPages={totalPages}
            total={totalItems}
            pageSize={STUDY_LIST_PAGE_SIZE}
            getPageHref={getPageHref}
          />
        ) : null}
      </article>
    </Layout>
  );
}
