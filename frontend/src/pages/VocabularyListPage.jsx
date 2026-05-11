import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Sidebar, Header, Footer, Breadcrumb } from "../components/common";
import { mockStreak, mockNotifications } from "../data/dashboardHomeMock.js";
import {
  VOCAB_PAGE_SIZE,
  VOCAB_TAB_IDS,
  VOCAB_ITEMS,
  mergeVocabMarks,
  getVocabListPaged,
  vocabListHref,
  vocabListSearchParams,
  getDistinctJlptLevels,
  vocabMeaningLine,
} from "../data/vocabularyMock.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";

function parsePage(searchParams) {
  const raw = parseInt(searchParams.get("page") || "1", 10);
  return Number.isFinite(raw) && raw >= 1 ? raw : 1;
}

function posBadgeKey(pos) {
  if (pos === "i_adj" || pos === "na_adj") return "shape";
  return pos;
}

function VocabSearchIcon() {
  return (
    <svg
      className="vocab-svg-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-4.2-4.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VocabSpeakerIcon() {
  return (
    <svg
      className="vocab-svg-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M11 5L6 9H3v6h3l5 4V5z" opacity="0.95" />
      <path
        d="M15.5 9.5a3.5 3.5 0 010 5M17.5 7a7 7 0 010 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/** Nút đánh dấu đã học — chỉ icon */
function VocabLearnedIcon({ learned }) {
  if (learned) {
    return (
      <svg
        className="vocab-svg-icon vocab-learn-svg"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path
          d="M7.5 12l2.8 2.8L16.5 9.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      className="vocab-svg-icon vocab-learn-svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.75"
      />
    </svg>
  );
}

export default function VocabularyListPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const lang = i18n.language || "ja";
  const showViGloss = String(lang).toLowerCase().startsWith("vi");

  const [marks, setMarks] = useState(() => ({}));

  const requested = parsePage(searchParams);

  const rawJlpt = (searchParams.get("jlpt") || "").trim();
  const jlptLevels = useMemo(() => getDistinctJlptLevels(), []);
  const jlpt = jlptLevels.includes(rawJlpt) ? rawJlpt : "";

  const rawTab = (searchParams.get("tab") || "all").trim();
  const tab = VOCAB_TAB_IDS.includes(rawTab) ? rawTab : "all";

  const rawSort = (searchParams.get("sort") || "newest").trim();

  const qUrl = (searchParams.get("q") || "").trim();
  const [qDraft, setQDraft] = useState(qUrl);
  useEffect(() => {
    setQDraft(qUrl);
  }, [qUrl]);

  const merged = useMemo(() => mergeVocabMarks(VOCAB_ITEMS, marks), [marks]);

  const filters = useMemo(
    () => ({
      jlpt,
      tab,
      q: qUrl,
      sort: rawSort,
    }),
    [jlpt, tab, qUrl, rawSort],
  );

  const paged = useMemo(
    () => getVocabListPaged(requested, VOCAB_PAGE_SIZE, merged, filters),
    [requested, merged, filters],
  );

  const { items, page, totalPages, fromIndex, toIndex, total } = paged;

  useEffect(() => {
    if (requested !== page) {
      const next = vocabListSearchParams({
        page,
        jlpt,
        tab,
        q: qUrl,
        sort: rawSort,
      });
      setSearchParams(next, { replace: true });
    }
  }, [requested, page, jlpt, tab, qUrl, rawSort, setSearchParams]);

  const baseFilter = useMemo(
    () => ({ jlpt, tab, q: qUrl, sort: rawSort }),
    [jlpt, tab, qUrl, rawSort],
  );

  const applyJlpt = (nextJlpt) => {
    setSearchParams(
      vocabListSearchParams({
        page: 1,
        jlpt: nextJlpt,
        tab,
        q: qUrl,
        sort: rawSort,
      }),
      { replace: true },
    );
  };

  const applyTab = (nextTab) => {
    const v = nextTab === "all" ? "" : nextTab;
    setSearchParams(
      vocabListSearchParams({
        page: 1,
        jlpt,
        tab: v,
        q: qUrl,
        sort: rawSort,
      }),
      { replace: true },
    );
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setSearchParams(
      vocabListSearchParams({
        page: 1,
        jlpt,
        tab,
        q: qDraft.trim(),
        sort: rawSort,
      }),
      { replace: true },
    );
  };

  const applySort = (nextSort) => {
    setSearchParams(
      vocabListSearchParams({
        page: 1,
        jlpt,
        tab,
        q: qUrl,
        sort: nextSort,
      }),
      { replace: true },
    );
  };

  const clearFilters = () => {
    setQDraft("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const setLearned = (id, learned) => {
    setMarks((prev) => ({
      ...prev,
      [id]: { ...prev[id], learned },
    }));
  };

  const toggleFavorite = (id) => {
    setMarks((prev) => {
      const item = mergeVocabMarks(VOCAB_ITEMS, prev).find((x) => x.id === id);
      const nextFav = item ? !item.favorite : false;
      return { ...prev, [id]: { ...prev[id], favorite: nextFav } };
    });
  };

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const summaryText = t("vocabPage.pageSummary", {
    from: fromIndex || 0,
    to: toIndex || 0,
    total,
  });
  const positionText = t("vocabPage.pagePosition", {
    current: page,
    totalPages,
  });

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const hasActiveFilter = Boolean(jlpt || tab !== "all" || qUrl);

  const sortValue =
    rawSort === "oldest" || rawSort === "reading" ? rawSort : "newest";

  return (
    <Layout>
      <div className="dash-page vocab-dash">
        <Sidebar streakDays={mockStreak.days} />
        <div className="dash-main">
          <Header userName={headerName} notificationCount={mockNotifications} />
          <div className="dash-main-inner">
            <Breadcrumb
              items={[
                { label: t("breadcrumb.home"), to: "/", end: true },
                { label: t("breadcrumb.vocabulary"), to: "/vocabulary" },
                { label: t("vocabPage.browseCrumb") },
              ]}
            />

            <article
              className="vocab-sheet vocab-scope vocab-notebook"
              aria-labelledby="vocab-list-title"
            >
              <header className="vocab-list-head">
                <div className="vocab-list-head-row">
                  <div>
                    <p className="vocab-list-kicker">{t("vocabPage.kicker")}</p>
                    <h1 id="vocab-list-title" className="vocab-list-title">
                      {t("vocabPage.browseTitle")}
                    </h1>
                    <p className="vocab-list-sub">{t("vocabPage.browseSubtitle")}</p>
                  </div>
                  <div className="vocab-jlpt-inline">
                    <label
                      htmlFor="vocab-filter-jlpt"
                      className="vocab-toolbar-label"
                    >
                      {t("vocabPage.jlptShort")}
                    </label>
                    <select
                      id="vocab-filter-jlpt"
                      className="vocab-toolbar-select vocab-jlpt-select"
                      value={jlpt}
                      onChange={(e) => applyJlpt(e.target.value)}
                    >
                      <option value="">{t("vocabPage.jlptAll")}</option>
                      {jlptLevels.map((lv) => (
                        <option key={lv} value={lv}>
                          {lv}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="vocab-toolbar-panel">
                  <section
                    className="vocab-toolbar"
                    aria-label={t("vocabPage.filterAria")}
                  >
                    <form className="vocab-search-row" onSubmit={submitSearch}>
                      <span className="vocab-search-icon" aria-hidden>
                        <VocabSearchIcon />
                      </span>
                      <input
                        type="search"
                        className="vocab-search-input"
                        value={qDraft}
                        onChange={(e) => setQDraft(e.target.value)}
                        placeholder={t("vocabPage.searchPlaceholder")}
                        enterKeyHint="search"
                        aria-label={t("vocabPage.searchLabel")}
                      />
                    </form>

                    <div className="vocab-sort-wrap">
                      <label
                        htmlFor="vocab-sort"
                        className="vocab-toolbar-label"
                      >
                        {t("vocabPage.sortLabel")}
                      </label>
                      <select
                        id="vocab-sort"
                        className="vocab-toolbar-select"
                        value={sortValue}
                        onChange={(e) => applySort(e.target.value)}
                      >
                        <option value="newest">
                          {t("vocabPage.sortNewest")}
                        </option>
                        <option value="oldest">
                          {t("vocabPage.sortOldest")}
                        </option>
                        <option value="reading">
                          {t("vocabPage.sortReading")}
                        </option>
                      </select>
                    </div>
                  </section>
                </div>

                <div
                  className="vocab-tabs"
                  role="tablist"
                  aria-label={t("vocabPage.tabListAria")}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "all"}
                    className={`vocab-tab ${tab === "all" ? "vocab-tab--active" : ""}`}
                    onClick={() => applyTab("all")}
                  >
                    {t("vocabPage.tabAll")}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "learned"}
                    className={`vocab-tab vocab-tab--learned ${tab === "learned" ? "vocab-tab--active" : ""}`}
                    onClick={() => applyTab("learned")}
                  >
                    {t("vocabPage.tabLearned")}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "unlearned"}
                    className={`vocab-tab vocab-tab--unlearned ${tab === "unlearned" ? "vocab-tab--active" : ""}`}
                    onClick={() => applyTab("unlearned")}
                  >
                    {t("vocabPage.tabUnlearned")}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "favorite"}
                    className={`vocab-tab vocab-tab--fav ${tab === "favorite" ? "vocab-tab--active" : ""}`}
                    onClick={() => applyTab("favorite")}
                  >
                    {t("vocabPage.tabFavorites")}
                  </button>
                </div>

                {hasActiveFilter ? (
                  <button
                    type="button"
                    className="vocab-filter-reset"
                    onClick={clearFilters}
                  >
                    {t("vocabPage.clearFilters")}
                  </button>
                ) : null}
              </header>

              {total === 0 ? (
                <p className="vocab-empty" role="status">
                  {t("vocabPage.noResults")}
                </p>
              ) : (
                <ul className="vocab-card-list">
                  {items.map((item) => {
                    const posKey = posBadgeKey(item.pos);
                    const meaning = vocabMeaningLine(item, lang);
                    return (
                      <li key={item.id} className="vocab-card">
                        <div className="vocab-card-head">
                          <Link
                            className="vocab-card-tap-head"
                            to={`/vocabulary/${item.id}`}
                          >
                            <div className="vocab-head-main">
                              <span
                                className={`vocab-pos vocab-pos--${posKey}`}
                                title={t(`vocabPage.posLong.${posKey}`, {
                                  defaultValue: posKey,
                                })}
                              >
                                {t(`vocabPage.pos.${posKey}`)}
                              </span>
                              <div className="vocab-word-block">
                                <span className="vocab-surface">
                                  {item.surface}
                                </span>
                                <span className="vocab-reading">
                                  {item.reading}
                                </span>
                              </div>
                            </div>
                          </Link>
                          <div className="vocab-card-actions">
                            <button
                              type="button"
                              className="vocab-icon-btn"
                              aria-label={t("vocabPage.playAudioAria")}
                              onClick={() => {}}
                            >
                              <VocabSpeakerIcon />
                            </button>
                            <button
                              type="button"
                              className={`vocab-icon-btn vocab-fav-btn ${item.favorite ? "vocab-fav-btn--on" : ""}`}
                              aria-pressed={item.favorite}
                              aria-label={t("vocabPage.favoriteAria")}
                              onClick={() => toggleFavorite(item.id)}
                            >
                              {item.favorite ? "★" : "☆"}
                            </button>
                            <button
                              type="button"
                              className={`vocab-icon-btn vocab-learn-btn ${item.learned ? "vocab-learn-btn--on" : ""}`}
                              aria-pressed={item.learned}
                              aria-label={
                                item.learned
                                  ? t("vocabPage.statusLearned")
                                  : t("vocabPage.statusUnlearned")
                              }
                              onClick={() => setLearned(item.id, !item.learned)}
                            >
                              <VocabLearnedIcon learned={item.learned} />
                            </button>
                          </div>
                        </div>
                        <Link
                          className="vocab-card-tap-body"
                          to={`/vocabulary/${item.id}`}
                        >
                          <p className="vocab-meaning">
                            <span className="vocab-inline-label">
                              {t("vocabPage.meaningLabel")}
                            </span>
                            {meaning}
                          </p>
                          <p className="vocab-example-line">
                            <span className="vocab-inline-label">
                              {t("vocabPage.exampleLabel")}
                            </span>
                            <span
                              className="vocab-example-ja"
                              lang="ja"
                              dangerouslySetInnerHTML={{
                                __html: item.exampleJaHtml,
                              }}
                            />
                            {showViGloss ? (
                              <span className="vocab-example-vi-inline">
                                {" \u2014 "}
                                {item.exampleVi}
                              </span>
                            ) : null}
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="vocab-footer-actions">
                <button type="button" className="vocab-add-btn">
                  <span aria-hidden>＋</span> {t("vocabPage.addVocab")}
                </button>
              </div>

              {total > 0 ? (
                <nav
                  className="vocab-pagination"
                  aria-label={t("vocabPage.paginationLabel")}
                >
                  <p className="vocab-pagination-meta">
                    {summaryText}
                    {" · "}
                    {positionText}
                  </p>
                  <div className="vocab-pagination-nav">
                    <Link
                      className="vocab-page-btn"
                      to={vocabListHref({ ...baseFilter, page: 1 })}
                      aria-disabled={page <= 1}
                      tabIndex={page <= 1 ? -1 : 0}
                      style={
                        page <= 1
                          ? { pointerEvents: "none", opacity: 0.45 }
                          : undefined
                      }
                      title={t("vocabPage.firstPage")}
                    >
                      «
                    </Link>
                    <Link
                      className="vocab-page-btn"
                      to={vocabListHref({ ...baseFilter, page: page - 1 })}
                      aria-disabled={page <= 1}
                      tabIndex={page <= 1 ? -1 : 0}
                      style={
                        page <= 1
                          ? { pointerEvents: "none", opacity: 0.45 }
                          : undefined
                      }
                    >
                      {t("vocabPage.prevPage")}
                    </Link>

                    {pageNumbers.map((n) => (
                      <Link
                        key={n}
                        to={vocabListHref({ ...baseFilter, page: n })}
                        className={`vocab-page-btn${n === page ? " vocab-page-btn--active" : ""}`}
                        aria-current={n === page ? "page" : undefined}
                        title={t("vocabPage.goToPage", { n })}
                      >
                        {n}
                      </Link>
                    ))}

                    <Link
                      className="vocab-page-btn"
                      to={vocabListHref({ ...baseFilter, page: page + 1 })}
                      aria-disabled={page >= totalPages}
                      tabIndex={page >= totalPages ? -1 : 0}
                      style={
                        page >= totalPages
                          ? { pointerEvents: "none", opacity: 0.45 }
                          : undefined
                      }
                    >
                      {t("vocabPage.nextPage")}
                    </Link>
                    <Link
                      className="vocab-page-btn"
                      to={vocabListHref({ ...baseFilter, page: totalPages })}
                      aria-disabled={page >= totalPages}
                      tabIndex={page >= totalPages ? -1 : 0}
                      style={
                        page >= totalPages
                          ? { pointerEvents: "none", opacity: 0.45 }
                          : undefined
                      }
                      title={t("vocabPage.lastPage")}
                    >
                      »
                    </Link>
                  </div>
                </nav>
              ) : null}
            </article>

            <Footer quote={t("dashboard.quotes.footer")} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
