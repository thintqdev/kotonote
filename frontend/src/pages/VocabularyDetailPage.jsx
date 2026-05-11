import { Fragment, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Sidebar, Header, Footer, Breadcrumb } from "../components/common";
import { mockStreak, mockNotifications } from "../data/dashboardHomeMock.js";
import { getVocabDetailMerged, getVocabDetailNav, vocabMeaningLine } from "../data/vocabularyMock.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./VocabularyDetailPage.css";

function formatLearnedDate(iso) {
  if (!iso || typeof iso !== "string") return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Hiển thị kun/on tách bởi ・ cho dễ đọc */
function KanjiReadingText({ reading }) {
  if (!reading) return null;
  const raw = String(reading).trim();
  const parts = raw.split(/\s*[・·]\s*/).filter(Boolean);
  if (parts.length <= 1) {
    return <span>{raw}</span>;
  }
  return (
    <span className="vocab-detail-kanji-reading-parts">
      {parts.map((p, i) => (
        <Fragment key={`${p}-${i}`}>
          {i > 0 ? <span className="vocab-detail-kanji-reading-dot">·</span> : null}
          <span>{p}</span>
        </Fragment>
      ))}
    </span>
  );
}

function VocabSpeakerIcon() {
  return (
    <svg
      className="vocab-svg-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
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

const TODAY_DONE = 5;
const TODAY_GOAL = 10;

export default function VocabularyDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language || "ja";
  const showViGloss = String(lang).toLowerCase().startsWith("vi");

  const [marks, setMarks] = useState(() => ({}));

  const detail = useMemo(
    () => (id ? getVocabDetailMerged(id, marks) : null),
    [id, marks],
  );

  const nav = useMemo(() => (id ? getVocabDetailNav(id) : null), [id]);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  if (!id || !detail) {
    return <Navigate to="/vocabulary" replace />;
  }

  const posKey = detail.pos === "i_adj" || detail.pos === "na_adj" ? "shape" : detail.pos;
  const meaning = vocabMeaningLine(detail, lang);
  const posLabelVi = t(`vocabPage.posLong.${posKey}`);
  const posLabelJa = t(`vocabDetailPage.posGrammarJa.${posKey}`, {
    defaultValue: t(`vocabPage.posLong.${posKey}`),
  });
  const posLabel = showViGloss ? posLabelVi : posLabelJa;

  const synonymGloss = (row) => (showViGloss ? row.glossVi : row.glossJa || row.glossVi);
  const kanjiGloss = (row) => (showViGloss ? row.glossVi : row.glossJa || row.glossVi);

  const setFavorite = (next) => {
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], favorite: next } }));
  };

  const setLearned = (learned) => {
    setMarks((prev) => ({ ...prev, [id]: { ...prev[id], learned } }));
  };

  const learnedDateStr =
    detail.learned && detail.learnedAt ? formatLearnedDate(detail.learnedAt) : "";

  const barPct = Math.min(100, Math.round((TODAY_DONE / TODAY_GOAL) * 100));

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
                { label: detail.surface },
              ]}
            />

            <article className="vocab-sheet vocab-scope vocab-detail-scope" lang={lang}>
              <div className="vocab-detail-meta-row">
                <span className="vocab-detail-jlpt-tag">
                  {t("vocabDetailPage.jlptWordTag", { level: detail.jlpt })}
                </span>
                <div className="vocab-detail-today-card" aria-hidden={false}>
                  <p className="vocab-detail-today-label">{t("vocabDetailPage.todayStudy")}</p>
                  <div className="vocab-detail-today-bar">
                    <div
                      className="vocab-detail-today-bar-fill"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <p className="vocab-detail-today-count">
                    {t("vocabDetailPage.todayProgress", {
                      done: TODAY_DONE,
                      goal: TODAY_GOAL,
                    })}
                  </p>
                </div>
              </div>

              <div className="vocab-detail-title-row">
                <h1 className="vocab-detail-page-title">{t("vocabDetailPage.pageTitle")}</h1>
                <Link className="vocab-detail-back" to="/vocabulary">
                  {t("vocabDetailPage.backToStudy")}
                </Link>
              </div>

              <section className="vocab-detail-hero vocab-detail-wobbly-border" aria-label={detail.surface}>
                <div className="vocab-detail-hero-top">
                  <div>
                    <p className="vocab-detail-word-ruby" lang="ja">
                      <ruby>
                        {detail.surface}
                        <rt>{detail.reading}</rt>
                      </ruby>
                    </p>
                    {detail.katakana ? (
                      <p className="vocab-detail-katakana" lang="ja">
                        {detail.katakana}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="vocab-detail-icon-circle vocab-detail-hero-audio"
                    aria-label={t("vocabPage.playAudioAria")}
                  >
                    <VocabSpeakerIcon />
                  </button>
                </div>

                <div className="vocab-detail-hero-tags">
                  <span className="vocab-detail-pos-pill">{posLabel}</span>
                  <p className="vocab-detail-meaning-big">
                    <span className="vocab-inline-label">{t("vocabDetailPage.meaningLead")}</span>
                    {meaning}
                  </p>
                </div>

                <div className="vocab-detail-hero-top" style={{ marginTop: 8, marginBottom: 0 }}>
                  <div />
                  <div className="vocab-detail-hero-side">
                    <button
                      type="button"
                      className={`vocab-detail-fav-big ${detail.favorite ? "vocab-detail-fav-big--on" : ""}`}
                      aria-pressed={detail.favorite}
                      onClick={() => setFavorite(!detail.favorite)}
                    >
                      <span aria-hidden>{detail.favorite ? "★" : "☆"}</span>
                      {t("vocabDetailPage.favoriteBtn")}
                    </button>
                    <div className="vocab-detail-learned-box">
                      <button
                        type="button"
                        className={`vocab-detail-learned-pill ${detail.learned ? "vocab-detail-learned-pill--on" : ""}`}
                        aria-pressed={detail.learned}
                        onClick={() => setLearned(!detail.learned)}
                      >
                        ✓ {t("vocabDetailPage.learnedBtn")}
                      </button>
                      {detail.learned && learnedDateStr ? (
                        <p className="vocab-detail-learned-date">
                          {t("vocabDetailPage.learnedDate", { date: learnedDateStr })}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              <section className="vocab-detail-example-card vocab-detail-wobbly-border">
                <h2 className="vocab-detail-washi vocab-detail-washi--pink">
                  {t("vocabDetailPage.sectionExample")}
                </h2>
                <div className="vocab-detail-example-body">
                  <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                    <p
                      className="vocab-detail-example-ja"
                      lang="ja"
                      dangerouslySetInnerHTML={{ __html: detail.detailExampleJaHtml }}
                    />
                    {showViGloss ? (
                      <p className="vocab-detail-example-vi">{detail.detailExampleVi}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="vocab-detail-icon-circle vocab-detail-example-audio"
                    aria-label={t("vocabPage.playAudioAria")}
                  >
                    <VocabSpeakerIcon />
                  </button>
                </div>
              </section>

              <div className="vocab-detail-grid">
                <section className="vocab-detail-panel vocab-detail-panel--kanji vocab-detail-wobbly-border">
                  <h3 className="vocab-detail-panel-title vocab-detail-panel-title--kanji">
                    {t("vocabDetailPage.sectionKanji")}
                  </h3>
                  {detail.kanjiBreakdown?.length ? (
                    <>
                      <div
                        className="vocab-detail-kanji-strip"
                        lang="ja"
                        aria-label={t("vocabDetailPage.sectionKanji")}
                      >
                        {detail.kanjiBreakdown.map((row, i) => (
                          <Fragment key={`strip-${row.kanji}-${i}`}>
                            {i > 0 ? (
                              <span className="vocab-detail-kanji-strip-op" aria-hidden>
                                ＋
                              </span>
                            ) : null}
                            <span className="vocab-detail-kanji-strip-char">{row.kanji}</span>
                          </Fragment>
                        ))}
                      </div>
                      <ul className="vocab-detail-kanji-cards">
                        {detail.kanjiBreakdown.map((row, i) => (
                          <li key={`card-${row.kanji}-${i}`} className="vocab-detail-kanji-card">
                            <div className="vocab-detail-kanji-card-inner">
                              <span className="vocab-detail-kanji-card-glyph" lang="ja">
                                {row.kanji}
                              </span>
                              <div className="vocab-detail-kanji-card-meta">
                                <p className="vocab-detail-kanji-card-label">{t("vocabDetailPage.kanjiReadingLabel")}</p>
                                <p className="vocab-detail-kanji-card-yomi" lang="ja">
                                  <KanjiReadingText reading={row.reading} />
                                </p>
                                {kanjiGloss(row) ? (
                                  <>
                                    <p className="vocab-detail-kanji-card-label vocab-detail-kanji-card-label--meaning">
                                      {t("vocabDetailPage.kanjiMeanLabel")}
                                    </p>
                                    <p className="vocab-detail-kanji-card-mean">{kanjiGloss(row)}</p>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="vocab-detail-empty-hint">{t("vocabDetailPage.emptySection")}</p>
                  )}
                </section>

                <section className="vocab-detail-panel vocab-detail-wobbly-border">
                  <h3 className="vocab-detail-panel-title">{t("vocabDetailPage.sectionSynonyms")}</h3>
                  {detail.synonyms?.length ? (
                    <ul className="vocab-detail-list-plain">
                      {detail.synonyms.map((row, i) => (
                        <li key={`${row.ja}-${i}`}>
                          <span lang="ja">{row.ja}</span>
                          {row.reading ? (
                            <span style={{ opacity: 0.65 }}>（{row.reading}）</span>
                          ) : null}
                          {synonymGloss(row) ? ` — ${synonymGloss(row)}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="vocab-detail-empty-hint">{t("vocabDetailPage.emptySection")}</p>
                  )}
                </section>

                <section className="vocab-detail-panel vocab-detail-wobbly-border">
                  <h3 className="vocab-detail-washi vocab-detail-washi--green vocab-detail-panel-title">
                    {t("vocabDetailPage.sectionPhrases")}
                  </h3>
                  {detail.commonPhrases?.length ? (
                    <ul className="vocab-detail-list-plain" style={{ listStyle: "none", padding: 0 }}>
                      {detail.commonPhrases.map((row, i) => (
                        <li key={i} style={{ marginBottom: 8 }}>
                          <span
                            lang="ja"
                            dangerouslySetInnerHTML={{ __html: row.jaHtml }}
                          />
                          {showViGloss && row.glossVi ? (
                            <div className="vocab-detail-example-vi" style={{ marginTop: 4 }}>
                              {row.glossVi}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="vocab-detail-empty-hint">{t("vocabDetailPage.emptySection")}</p>
                  )}
                </section>

                <section className="vocab-detail-panel vocab-detail-wobbly-border">
                  <h3 className="vocab-detail-washi vocab-detail-washi--yellow vocab-detail-panel-title">
                    {t("vocabDetailPage.sectionMemo")}
                  </h3>
                  {detail.memoJa || (showViGloss && detail.memoVi) ? (
                    <>
                      {detail.memoJa ? (
                        <p className="vocab-detail-memo-note" lang="ja">
                          {detail.memoJa}
                        </p>
                      ) : null}
                      {showViGloss && detail.memoVi ? (
                        <p className="vocab-detail-memo-note vocab-detail-memo-note--sub">
                          {detail.memoVi}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="vocab-detail-empty-hint">{t("vocabDetailPage.emptySection")}</p>
                  )}
                </section>
              </div>

              <div className="vocab-detail-action-bar">
                <button type="button" className="vocab-detail-action-btn">
                  <span className="vocab-detail-action-ico" aria-hidden>
                    🔊
                  </span>
                  {t("vocabDetailPage.actionListen")}
                </button>
                <button type="button" className="vocab-detail-action-btn">
                  <span className="vocab-detail-action-ico" aria-hidden>
                    ✏️
                  </span>
                  {t("vocabDetailPage.actionWrite")}
                </button>
                <button type="button" className="vocab-detail-action-btn">
                  <span className="vocab-detail-action-ico" aria-hidden>
                    📔
                  </span>
                  {t("vocabDetailPage.actionNotebook")}
                </button>
                <button type="button" className="vocab-detail-action-btn">
                  <span className="vocab-detail-action-ico" aria-hidden>
                    ❓
                  </span>
                  {t("vocabDetailPage.actionQuiz")}
                </button>
              </div>

              <nav className="vocab-detail-footer-nav" aria-label={t("vocabPage.paginationLabel")}>
                {nav?.prevId ? (
                  <Link className="vocab-detail-nav-link" to={`/vocabulary/${nav.prevId}`}>
                    ‹ {t("vocabDetailPage.navPrev")}
                  </Link>
                ) : (
                  <span className="vocab-detail-nav-muted">‹ {t("vocabDetailPage.navPrev")}</span>
                )}
                <span className="vocab-detail-nav-pos">
                  {nav
                    ? t("vocabDetailPage.navPosition", {
                        current: nav.position,
                        total: nav.total,
                      })
                    : ""}
                </span>
                {nav?.nextId ? (
                  <Link className="vocab-detail-nav-link" to={`/vocabulary/${nav.nextId}`}>
                    {t("vocabDetailPage.navNext")} ›
                  </Link>
                ) : (
                  <span className="vocab-detail-nav-muted">{t("vocabDetailPage.navNext")} ›</span>
                )}
              </nav>
            </article>

            <Footer quote={t("dashboard.quotes.footer")} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
