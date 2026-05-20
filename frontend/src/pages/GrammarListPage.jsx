import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import StudyPageHeader from "../components/study/StudyPageHeader.jsx";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  GRAMMAR_PAGE_SIZE,
  GRAMMAR_TAG_IDS,
} from "../constants/grammarFieldMeta.js";
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

const TAG_ACCENT = new Set([
  "formal",
  "hearsay",
  "purpose",
  "goal",
  "change",
]);

function parsePage(searchParams) {
  const raw = parseInt(searchParams.get("page") || "1", 10);
  return Number.isFinite(raw) && raw >= 1 ? raw : 1;
}

export default function GrammarListPage() {
  const { t, i18n } = useTranslation();
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
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setQDraft(qUrl);
  }, [qUrl]);

  const fetchList = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const data = await listGrammars({
        page: requested,
        limit: GRAMMAR_PAGE_SIZE,
        jlpt: jlpt || undefined,
        tag: tag || undefined,
        q: qUrl || undefined,
      });
      setItems(data.items ?? []);
      setJlptLevels(data.jlptLevels ?? []);
      setPagination(data.pagination);
      const serverPage = data.pagination?.page ?? requested;
      if (serverPage !== requested) {
        setSearchParams(
          grammarListSearchParams({
            page: serverPage,
            jlpt,
            tag,
            q: qUrl,
          }),
          { replace: true },
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t));
      setItems([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [requested, jlpt, tag, qUrl, setSearchParams, t, user]);

  useEffect(() => {
    if (!user) return;
    void fetchList();
  }, [fetchList, user]);

  const page = pagination?.page ?? requested;
  const totalPages = Math.max(1, pagination?.pages ?? 1);
  const total = pagination?.total ?? 0;
  const fromIndex = total === 0 ? 0 : (page - 1) * GRAMMAR_PAGE_SIZE + 1;
  const toIndex = total === 0 ? 0 : Math.min(page * GRAMMAR_PAGE_SIZE, total);

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

  const applyTag = (nextTag) => {
    const toggled =
      tag === nextTag && nextTag !== "" ? "" : nextTag === "all" ? "" : nextTag;
    setSearchParams(
      grammarListSearchParams({
        page: 1,
        jlpt,
        tag: toggled,
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

  const jlptOptions =
    jlptLevels.length > 0
      ? jlptLevels
      : ["N5", "N4", "N3", "N2", "N1"].filter((lv) =>
          items.some((it) => it.jlpt === lv),
        );

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
          aside={
            <div className="vocab-lesson-goal-box grammar-head-jlpt">
              <label htmlFor="grammar-filter-jlpt" className="vocab-lesson-goal-label">
                {t("grammarPage.jlptFilter")}
              </label>
              <select
                id="grammar-filter-jlpt"
                className="vocab-jlpt-select"
                value={jlpt}
                onChange={(e) => applyJlpt(e.target.value)}
              >
                <option value="">{t("grammarPage.jlptAll")}</option>
                {jlptOptions.map((lv) => (
                  <option key={lv} value={lv} disabled={isLocked(lv)}>
                    {isLocked(lv)
                      ? t("jlptAccess.tabLocked", { level: lv })
                      : lv}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        <section
          className="grammar-filters grammar-filters--below-head"
          aria-label={t("grammarPage.filterAria")}
        >
            <div className="grammar-filter-row">
              <span className="grammar-filter-label">{t("grammarPage.tagFilter")}</span>
              <div className="grammar-filter-tags" role="group">
                <button
                  type="button"
                  className={`grammar-filter-chip ${!tag ? "grammar-filter-chip--active" : ""}`}
                  onClick={() => applyTag("all")}
                >
                  {t("grammarPage.tagAll")}
                </button>
                {GRAMMAR_TAG_IDS.map((tid) => (
                  <button
                    key={tid}
                    type="button"
                    className={`grammar-filter-chip ${tag === tid ? "grammar-filter-chip--active" : ""}`}
                    onClick={() => applyTag(tid)}
                  >
                    {t(`grammar.tags.${tid}`)}
                  </button>
                ))}
              </div>
            </div>

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

        {loading ? (
          <p className="grammar-empty" role="status">
            {t("common.loading")}
          </p>
        ) : error ? (
          <p className="grammar-empty grammar-empty--error" role="alert">
            {error}
          </p>
        ) : total === 0 ? (
          <p className="grammar-empty" role="status">
            {t("grammarPage.noResults")}
          </p>
        ) : (
          <div className="grammar-list-grid">
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
