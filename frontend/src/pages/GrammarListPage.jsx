import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import StudyPageHeader from "../components/study/StudyPageHeader.jsx";
import { mockStreak } from "../data/dashboardHomeMock.js";
import { GRAMMAR_PAGE_SIZE, GRAMMAR_TAG_IDS } from "../constants/grammarFieldMeta.js";
import {
  grammarLine,
  grammarListHref,
  grammarListSearchParams,
} from "../data/grammarMock.js";
import { listGrammars } from "../services/grammarService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { useJlptAccess } from "../hooks/useJlptAccess.js";
import JlptLockedOverlay from "../components/study/JlptLockedOverlay.jsx";
import "../components/study/JlptLockGate.css";
import "./DashboardHome.css";
import "./GrammarPages.css";
import "./VocabularyPages.css";
import "./ReadingListPage.css";

const TAG_ACCENT = new Set([
  "formal",
  "hearsay",
  "purpose",
  "goal",
  "change",
]);

const DEFAULT_JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"];

function parsePage(searchParams) {
  const raw = parseInt(searchParams.get("page") || "1", 10);
  return Number.isFinite(raw) && raw >= 1 ? raw : 1;
}

export default function GrammarListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isLocked } = useJlptAccess();
  const lang = i18n.language || "ja";

  const requested = parsePage(searchParams);

  const rawJlpt = (searchParams.get("jlpt") || "").trim();
  const jlpt = rawJlpt;

  const rawTag = (searchParams.get("tag") || "").trim();
  const tag = GRAMMAR_TAG_IDS.includes(rawTag) ? rawTag : "";

  const qUrl = (searchParams.get("q") || "").trim();

  const [qDraft, setQDraft] = useState(qUrl);
  const [items, setItems] = useState([]);
  const [jlptLevels, setJlptLevels] = useState([]);
  const [availableTagIds, setAvailableTagIds] = useState([]);
  const [tagCounts, setTagCounts] = useState({});
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const resultsRef = useRef(null);
  const prevTagRef = useRef(tag);
  const fetchSeqRef = useRef(0);
  const listAbortRef = useRef(null);

  useEffect(() => {
    setQDraft(qUrl);
  }, [qUrl]);

  useEffect(() => {
    if (prevTagRef.current === tag) return;
    prevTagRef.current = tag;
    if (!tag) return;
    const frame = window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [tag]);

  const fetchList = useCallback(async () => {
    if (!user) return;

    const seq = ++fetchSeqRef.current;
    listAbortRef.current?.abort();
    const controller = new AbortController();
    listAbortRef.current = controller;

    const fetchTag = tag;
    const fetchJlpt = jlpt;
    const fetchQ = qUrl;
    const fetchPage = requested;

    setLoading(true);
    setError("");
    try {
      const data = await listGrammars(
        {
          page: fetchPage,
          limit: GRAMMAR_PAGE_SIZE,
          jlpt: fetchJlpt || undefined,
          tag: fetchTag || undefined,
          q: fetchQ || undefined,
        },
        { signal: controller.signal },
      );
      if (seq !== fetchSeqRef.current) return;

      const tagsForScope = data.availableTagIds ?? [];
      setItems(data.items ?? []);
      setJlptLevels(data.jlptLevels ?? []);
      setAvailableTagIds(tagsForScope);
      setTagCounts(data.tagCounts ?? {});
      setPagination(data.pagination);

      const tagStillValid = !fetchTag || tagsForScope.includes(fetchTag);
      const serverPage = data.pagination?.page ?? fetchPage;
      if (serverPage !== fetchPage || !tagStillValid) {
        setSearchParams(
          grammarListSearchParams({
            page: serverPage,
            jlpt: fetchJlpt,
            tag: tagStillValid ? fetchTag : "",
            q: fetchQ,
          }),
          { replace: true },
        );
      }
    } catch (err) {
      if (controller.signal.aborted || err?.code === "ERR_CANCELED") return;
      if (seq !== fetchSeqRef.current) return;
      setError(getApiErrorMessage(err, t));
      setItems([]);
      setPagination(null);
    } finally {
      if (seq === fetchSeqRef.current) {
        setLoading(false);
      }
    }
  }, [requested, jlpt, tag, qUrl, setSearchParams, t, user]);

  useEffect(() => {
    if (!user) return;
    void fetchList();
    return () => listAbortRef.current?.abort();
  }, [fetchList, user]);

  const page = pagination?.page ?? requested;
  const totalPages = Math.max(1, pagination?.pages ?? 1);
  const total = pagination?.total ?? 0;
  const fromIndex = total === 0 ? 0 : (page - 1) * GRAMMAR_PAGE_SIZE + 1;
  const toIndex = total === 0 ? 0 : Math.min(page * GRAMMAR_PAGE_SIZE, total);

  const isInitialLoad = loading && items.length === 0;
  const isRefetching = loading && items.length > 0;

  const baseFilter = useMemo(() => ({ jlpt, tag, q: qUrl }), [jlpt, tag, qUrl]);

  const applyJlpt = (nextJlpt) => {
    setSearchParams(
      grammarListSearchParams({
        page: 1,
        jlpt: nextJlpt,
        tag,
        q: qUrl,
      }),
      { replace: true },
    );
  };

  const handleJlptTab = (nextJlpt) => {
    if (nextJlpt && isLocked(nextJlpt)) {
      navigate("/membership");
      return;
    }
    applyJlpt(nextJlpt);
  };

  const applyTag = (nextTag) => {
    const next = nextTag === "all" ? "" : nextTag;
    if (next === tag) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setSearchParams(
      grammarListSearchParams({
        page: 1,
        jlpt,
        tag: next,
        q: qUrl,
      }),
      { replace: true },
    );
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setSearchParams(
      grammarListSearchParams({
        page: 1,
        jlpt,
        tag,
        q: qDraft.trim(),
      }),
      { replace: true },
    );
  };

  const clearFilters = () => {
    setQDraft("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const summaryText = t("grammarPage.pageSummary", {
    from: fromIndex || 0,
    to: toIndex || 0,
    total,
  });
  const positionText = t("grammarPage.pagePosition", {
    current: page,
    totalPages,
  });

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const hasActiveFilter = Boolean(jlpt || tag || qUrl);
  const jlptFilterLocked = Boolean(jlpt && isLocked(jlpt));

  const jlptTabLevels =
    jlptLevels.length > 0 ? jlptLevels : DEFAULT_JLPT_LEVELS;

  const showTagFilter = availableTagIds.length > 0;

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      pageClassName="vocab-dash"
    >
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.grammar") },
        ]}
      />

      <article
        className="vocab-sheet vocab-scope vocab-notebook vocab-lesson-scope grammar-sheet grammar-scope"
        aria-labelledby="grammar-list-title"
      >
        <StudyPageHeader
          titleId="grammar-list-title"
          title={t("grammarPage.listTitle")}
          subtitle={t("grammarPage.listSubtitle")}
        />

        <div
          className="vocab-tabs reading-jlpt-tabs grammar-jlpt-tabs"
          role="tablist"
          aria-label={t("grammarPage.levelTabsAria")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={!jlpt}
            className={`vocab-tab${!jlpt ? " vocab-tab--active" : ""}`}
            onClick={() => handleJlptTab("")}
          >
            {t("grammarPage.jlptAll")}
          </button>
          {jlptTabLevels.map((lv) => (
            <button
              key={`grammar-jlpt-tab-${lv}`}
              type="button"
              role="tab"
              aria-selected={jlpt === lv}
              className={`vocab-tab${jlpt === lv ? " vocab-tab--active" : ""}${isLocked(lv) ? " vocab-tab--jlpt-locked" : ""}`}
              onClick={() => handleJlptTab(lv)}
            >
              {isLocked(lv) ? t("jlptAccess.tabLocked", { level: lv }) : lv}
            </button>
          ))}
        </div>

        <section
          className="grammar-filters grammar-filters--below-head"
          aria-label={t("grammarPage.filterAria")}
        >
            {showTagFilter ? (
              <div
                className={`grammar-filter-row${loading ? " grammar-filter-row--busy" : ""}`}
              >
                <span className="grammar-filter-label">
                  {t("grammarPage.tagFilter")}
                  {loading ? (
                    <span
                      className="grammar-list-spinner grammar-list-spinner--inline"
                      aria-hidden
                    />
                  ) : null}
                </span>
                <div className="grammar-filter-tags" role="group" aria-label={t("grammarPage.tagFilter")}>
                  <button
                    type="button"
                    className={`grammar-filter-chip ${!tag ? "grammar-filter-chip--active" : ""}`}
                    aria-pressed={!tag}
                    onClick={() => applyTag("all")}
                  >
                    {t("grammarPage.tagAll")}
                  </button>
                  {availableTagIds.map((tid) => (
                    <button
                      key={tid}
                      type="button"
                      className={`grammar-filter-chip ${tag === tid ? "grammar-filter-chip--active" : ""}`}
                      aria-pressed={tag === tid}
                      onClick={() => applyTag(tid)}
                    >
                      {t("grammarPage.tagChipCount", {
                        tag: t(`grammar.tags.${tid}`),
                        count: tagCounts[tid] ?? 0,
                      })}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form className="grammar-filter-search" onSubmit={submitSearch}>
              <label htmlFor="grammar-filter-q" className="grammar-filter-label">
                {t("grammarPage.searchLabel")}
              </label>
              <div className="grammar-filter-search-inner">
                <input
                  id="grammar-filter-q"
                  type="search"
                  className="grammar-filter-input"
                  value={qDraft}
                  onChange={(e) => setQDraft(e.target.value)}
                  placeholder={t("grammarPage.searchPlaceholder")}
                  enterKeyHint="search"
                />
                <button type="submit" className="grammar-filter-submit">
                  {t("grammarPage.searchApply")}
                </button>
              </div>
            </form>

            {hasActiveFilter ? (
              <button type="button" className="grammar-filter-reset" onClick={clearFilters}>
                {t("grammarPage.clearFilters")}
              </button>
            ) : null}
        </section>

        {jlptFilterLocked ? (
          <p className="jlpt-filter-locked-banner" role="status">
            {t("jlptAccess.filterLocked", { level: jlpt })}
          </p>
        ) : null}

        {tag ? (
          <div
            ref={resultsRef}
            className={`grammar-active-filter-banner${loading ? " grammar-active-filter-banner--loading" : ""}`}
            role="status"
            aria-live="polite"
          >
            <p className="grammar-active-filter-banner-text">
              {loading
                ? t("grammarPage.tagFilterLoading", { tag: t(`grammar.tags.${tag}`) })
                : t("grammarPage.tagFilterResult", {
                    count: total,
                    tag: t(`grammar.tags.${tag}`),
                  })}
            </p>
            <button
              type="button"
              className="grammar-active-filter-banner-clear"
              onClick={() => applyTag("all")}
              disabled={loading}
            >
              {t("grammarPage.tagFilterClear")}
            </button>
          </div>
        ) : (
          <div ref={resultsRef} className="grammar-results-anchor" aria-hidden="true" />
        )}

        {isInitialLoad ? (
          <div className="grammar-list-loading" role="status" aria-live="polite">
            <span className="grammar-list-spinner" aria-hidden />
            <p>{t("common.loading")}</p>
          </div>
        ) : error ? (
          <p className="grammar-empty grammar-empty--error" role="alert">
            {error}
          </p>
        ) : !loading && total === 0 ? (
          <p className="grammar-empty" role="status">
            {t("grammarPage.noResults")}
          </p>
        ) : (
          <div className="grammar-list-results" aria-busy={isRefetching}>
            <div
              key={`${jlpt}|${tag}|${qUrl}|${page}`}
              className={`grammar-list-grid grammar-list-grid--filtered${isRefetching ? " grammar-list-grid--busy" : ""}`}
            >
            {items.map((item) => {
              const teaserLn = grammarLine(item.teaser, lang);
              const locked = item.locked || isLocked(item.jlpt);
              const cardInner = (
                <>
                  <div className="grammar-card-top">
                    <span className="grammar-jlpt-pill">{item.jlpt}</span>
                  </div>
                  <h2 className="grammar-card-pattern">{item.pattern}</h2>
                  <div className="grammar-card-tags">
                    {(item.tagIds || []).map((tid) => (
                      <span
                        key={tid}
                        className={`grammar-tag ${TAG_ACCENT.has(tid) ? "grammar-tag--accent" : ""}`}
                      >
                        {t(`grammar.tags.${tid}`, { defaultValue: tid })}
                      </span>
                    ))}
                  </div>
                  <div className="grammar-card-teaser">
                    <span className="grammar-card-teaser-ja">{teaserLn.primary}</span>
                    {teaserLn.secondary ? (
                      <span className="grammar-card-teaser-vi">{teaserLn.secondary}</span>
                    ) : null}
                  </div>
                  {!locked ? (
                    <span className="grammar-card-cta">{t("grammarPage.cardCta")}</span>
                  ) : null}
                </>
              );
              if (locked) {
                return (
                  <div key={item.slug} className="grammar-card-wrap--locked">
                    <article className="grammar-card grammar-card--jlpt-locked">
                      {cardInner}
                    </article>
                    <JlptLockedOverlay level={item.jlpt} />
                  </div>
                );
              }
              return (
                <Link
                  key={item.slug}
                  to={`/grammar/${item.slug}`}
                  className="grammar-card"
                >
                  {cardInner}
                </Link>
              );
            })}
            </div>
            {isRefetching ? (
              <div className="grammar-list-busy-overlay" role="status" aria-live="polite">
                <span className="grammar-list-spinner" aria-hidden />
                <span>{t("grammarPage.filterRefreshing")}</span>
              </div>
            ) : null}
          </div>
        )}

        {!loading && !error && total > 0 ? (
          <nav className="grammar-pagination" aria-label={t("grammarPage.paginationLabel")}>
            <p className="grammar-pagination-meta">
              {summaryText}
              {" · "}
              {positionText}
            </p>
            <div className="grammar-pagination-nav">
              <Link
                className="grammar-page-btn"
                to={grammarListHref({ ...baseFilter, page: 1 })}
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : 0}
                style={page <= 1 ? { pointerEvents: "none", opacity: 0.45 } : undefined}
                title={t("grammarPage.firstPage")}
              >
                «
              </Link>
              <Link
                className="grammar-page-btn"
                to={grammarListHref({ ...baseFilter, page: page - 1 })}
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : 0}
                style={page <= 1 ? { pointerEvents: "none", opacity: 0.45 } : undefined}
              >
                {t("grammarPage.prevPage")}
              </Link>

              {pageNumbers.map((n) => (
                <Link
                  key={n}
                  to={grammarListHref({ ...baseFilter, page: n })}
                  className={`grammar-page-btn${n === page ? " grammar-page-btn--active" : ""}`}
                  aria-current={n === page ? "page" : undefined}
                  title={t("grammarPage.goToPage", { n })}
                >
                  {n}
                </Link>
              ))}

              <Link
                className="grammar-page-btn"
                to={grammarListHref({ ...baseFilter, page: page + 1 })}
                aria-disabled={page >= totalPages}
                tabIndex={page >= totalPages ? -1 : 0}
                style={
                  page >= totalPages
                    ? { pointerEvents: "none", opacity: 0.45 }
                    : undefined
                }
              >
                {t("grammarPage.nextPage")}
              </Link>
              <Link
                className="grammar-page-btn"
                to={grammarListHref({ ...baseFilter, page: totalPages })}
                aria-disabled={page >= totalPages}
                tabIndex={page >= totalPages ? -1 : 0}
                style={
                  page >= totalPages
                    ? { pointerEvents: "none", opacity: 0.45 }
                    : undefined
                }
                title={t("grammarPage.lastPage")}
              >
                »
              </Link>
            </div>
          </nav>
        ) : null}
      </article>
    </Layout>
  );
}
