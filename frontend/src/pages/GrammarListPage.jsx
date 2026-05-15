import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  GRAMMAR_PAGE_SIZE,
  GRAMMAR_TAG_IDS,
  getDistinctJlptLevels,
  getGrammarListPaged,
  grammarLine,
  grammarListHref,
  grammarListSearchParams,
} from "../data/grammarMock.js";
import "./DashboardHome.css";
import "./GrammarPages.css";

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
  const lang = i18n.language || "ja";

  const requested = parsePage(searchParams);

  const rawJlpt = (searchParams.get("jlpt") || "").trim();
  const jlptLevels = useMemo(() => getDistinctJlptLevels(), []);
  const jlpt = jlptLevels.includes(rawJlpt) ? rawJlpt : "";

  const rawTag = (searchParams.get("tag") || "").trim();
  const tag = GRAMMAR_TAG_IDS.includes(rawTag) ? rawTag : "";

  const qUrl = (searchParams.get("q") || "").trim();

  const [qDraft, setQDraft] = useState(qUrl);
  useEffect(() => {
    setQDraft(qUrl);
  }, [qUrl]);

  const filters = useMemo(
    () => ({
      jlpt,
      tag,
      q: qUrl,
      lang,
    }),
    [jlpt, tag, qUrl, lang],
  );

  const paged = useMemo(
    () => getGrammarListPaged(requested, GRAMMAR_PAGE_SIZE, filters),
    [requested, filters],
  );

  const { items, page, totalPages, fromIndex, toIndex, total } = paged;

  useEffect(() => {
    if (requested !== page) {
      const next = grammarListSearchParams({
        page,
        jlpt,
        tag,
        q: qUrl,
      });
      setSearchParams(next, { replace: true });
    }
  }, [requested, page, jlpt, tag, qUrl, setSearchParams]);

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

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
    >
      <Breadcrumb
              items={[
                { label: t("breadcrumb.home"), to: "/", end: true },
                { label: t("breadcrumb.grammar") },
              ]}
            />

            <article
              className="grammar-sheet grammar-scope"
              aria-labelledby="grammar-list-title"
            >
              <header className="grammar-list-head">
                <p className="grammar-list-kicker">JLPT</p>
                <h1 id="grammar-list-title" className="grammar-list-title">
                  {t("grammarPage.listTitle")}
                </h1>
                <p className="grammar-list-sub">{t("grammarPage.listSubtitle")}</p>

                <section
                  className="grammar-filters"
                  aria-label={t("grammarPage.filterAria")}
                >
                  <div className="grammar-filter-row grammar-filter-row--jlpt">
                    <label htmlFor="grammar-filter-jlpt" className="grammar-filter-label">
                      {t("grammarPage.jlptFilter")}
                    </label>
                    <select
                      id="grammar-filter-jlpt"
                      className="grammar-filter-select"
                      value={jlpt}
                      onChange={(e) => applyJlpt(e.target.value)}
                    >
                      <option value="">{t("grammarPage.jlptAll")}</option>
                      {jlptLevels.map((lv) => (
                        <option key={lv} value={lv}>
                          {lv}
                        </option>
                      ))}
                    </select>
                  </div>

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
              </header>

              {total === 0 ? (
                <p className="grammar-empty" role="status">
                  {t("grammarPage.noResults")}
                </p>
              ) : (
              <div className="grammar-list-grid">
                  {items.map((item) => {
                    const teaserLn = grammarLine(item.teaser, lang);
                    return (
                    <Link
                      key={item.slug}
                      to={`/grammar/${item.slug}`}
                      className="grammar-card"
                    >
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
                        <span className="grammar-card-teaser-ja">
                          {teaserLn.primary}
                        </span>
                        {teaserLn.secondary ? (
                          <span className="grammar-card-teaser-vi">
                            {teaserLn.secondary}
                          </span>
                        ) : null}
                      </div>
                      <span className="grammar-card-cta">{t("grammarPage.cardCta")}</span>
                    </Link>
                    );
                  })}
                </div>
              )}

              {total > 0 ? (
              <nav
                className="grammar-pagination"
                aria-label={t("grammarPage.paginationLabel")}
              >
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
                    style={
                      page <= 1
                        ? { pointerEvents: "none", opacity: 0.45 }
                        : undefined
                    }
                    title={t("grammarPage.firstPage")}
                  >
                    «
                  </Link>
                  <Link
                    className="grammar-page-btn"
                    to={grammarListHref({ ...baseFilter, page: page - 1 })}
                    aria-disabled={page <= 1}
                    tabIndex={page <= 1 ? -1 : 0}
                    style={
                      page <= 1
                        ? { pointerEvents: "none", opacity: 0.45 }
                        : undefined
                    }
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
