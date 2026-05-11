import PropTypes from "prop-types";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak, mockNotifications } from "../data/dashboardHomeMock.js";
import {
  getGrammarDetail,
  grammarLine,
  grammarIsViUI,
} from "../data/grammarMock.js";
import "./DashboardHome.css";
import "./GrammarPages.css";

function GrammarJpVi({ loc, lang, className = "" }) {
  if (loc == null) return null;
  const { primary, secondary } = grammarLine(loc, lang);
  return (
    <div className={className}>
      {primary ? <p className="grammar-jp-line">{primary}</p> : null}
      {secondary ? <p className="grammar-vi-note">{secondary}</p> : null}
    </div>
  );
}

GrammarJpVi.propTypes = {
  loc: PropTypes.oneOfType([
    PropTypes.shape({ ja: PropTypes.string, vi: PropTypes.string }),
    PropTypes.string,
  ]),
  lang: PropTypes.string.isRequired,
  className: PropTypes.string,
};

function GrammarJpViTd({ loc, lang }) {
  const { primary, secondary } = grammarLine(loc, lang);
  return (
    <>
      <span className="grammar-td-jp">{primary}</span>
      {secondary ? <span className="grammar-td-vi">{secondary}</span> : null}
    </>
  );
}

GrammarJpViTd.propTypes = {
  loc: PropTypes.shape({
    ja: PropTypes.string,
    vi: PropTypes.string,
  }).isRequired,
  lang: PropTypes.string.isRequired,
};

function GrammarExampleItem({ pair, lang }) {
  const jaHtml = pair?.ja ?? "";
  const { secondary } = grammarLine(pair, lang);
  return (
    <li className="grammar-example-item-split">
      <div
        className="grammar-example-jp"
        dangerouslySetInnerHTML={{ __html: jaHtml }}
      />
      {secondary ? (
        <p className="grammar-example-vi-gloss">{secondary}</p>
      ) : null}
    </li>
  );
}

GrammarExampleItem.propTypes = {
  pair: PropTypes.shape({
    ja: PropTypes.string,
    vi: PropTypes.string,
  }).isRequired,
  lang: PropTypes.string.isRequired,
};

function GrammarDetailPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language || "ja";

  const detail = slug ? getGrammarDetail(slug) : null;

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  if (!detail) {
    return <Navigate to="/grammar" replace />;
  }

  const meta = detail.meta || {};
  const ngLinesJa = detail.ng?.ja ?? [];
  const ngLinesVi = detail.ng?.vi ?? [];

  const showNgViAssist = grammarIsViUI(lang);
  const capLine = grammarLine(detail.compare?.caption, lang);

  return (
    <Layout
      userName={headerName}
      notificationCount={mockNotifications}
      footerQuote={t("dashboard.quotes.footer")}
      streakDays={mockStreak.days}
    >
      <Breadcrumb
              items={[
                { label: t("breadcrumb.home"), to: "/", end: true },
                { label: t("breadcrumb.grammar"), to: "/grammar" },
                { label: detail.pattern },
              ]}
            />

            <article
              className="grammar-sheet grammar-scope grammar-detail--journal"
              aria-labelledby="grammar-detail-pattern"
            >
              <Link className="grammar-back" to="/grammar">
                {t("grammarPage.backToList")}
              </Link>

              <header className="grammar-detail-head">
                <p className="grammar-detail-kicker">
                  {t("grammarPage.jlptBadge", { level: detail.jlpt })} ·{" "}
                  {t("nav.grammar")}
                </p>
                <h1
                  id="grammar-detail-pattern"
                  className="grammar-detail-title"
                >
                  {detail.pattern}
                </h1>
                {meta.topicRibbon ? (
                  <p className="grammar-detail-ribbon">
                    {grammarLine(meta.topicRibbon, lang).primary}
                  </p>
                ) : null}
              </header>

              {detail.connection ? (
                <section className="grammar-block" aria-labelledby="g-conn">
                  <h2 id="g-conn" className="grammar-h">
                    {t("grammar.labels.connection")}
                  </h2>
                  <div className="grammar-box grammar-box--soft">
                    <GrammarJpVi loc={detail.connection} lang={lang} />
                  </div>
                </section>
              ) : null}

              {detail.meaning ? (
                <section className="grammar-block" aria-labelledby="g-mean">
                  <h2 id="g-mean" className="grammar-h">
                    {t("grammar.labels.meaning")}
                  </h2>
                  <div className="grammar-box">
                    <GrammarJpVi loc={detail.meaning} lang={lang} />
                  </div>
                </section>
              ) : null}

              {detail.usage ? (
                <section className="grammar-block" aria-labelledby="g-use">
                  <h2 id="g-use" className="grammar-h">
                    {t("grammar.labels.usage")}
                  </h2>
                  <div className="grammar-box">
                    <GrammarJpVi loc={detail.usage} lang={lang} />
                  </div>
                  {detail.usageNote ? (
                    <div className="grammar-note-red">
                      <GrammarJpVi loc={detail.usageNote} lang={lang} />
                    </div>
                  ) : null}
                </section>
              ) : null}

              {detail.pointBubble ? (
                <section className="grammar-block" aria-labelledby="g-point">
                  <h2 id="g-point" className="grammar-h">
                    {t("grammar.labels.point")}
                  </h2>
                  <div className="grammar-bubble">
                    <GrammarJpVi loc={detail.pointBubble} lang={lang} />
                  </div>
                </section>
              ) : null}

              {detail.examples?.length ? (
                <section className="grammar-block" aria-labelledby="g-ex">
                  <h2 id="g-ex" className="grammar-h">
                    {t("grammar.labels.examples")}
                  </h2>
                  <div className="grammar-box">
                    <ol className="grammar-example-list">
                      {detail.examples.map((ex, idx) => (
                        <GrammarExampleItem
                          key={`ex-${slug}-${idx}`}
                          pair={ex}
                          lang={lang}
                        />
                      ))}
                    </ol>
                  </div>
                </section>
              ) : null}

              {detail.ng ? (
                <section className="grammar-block" aria-labelledby="g-ng">
                  <div className="grammar-ng-title" id="g-ng">
                    {t("grammar.labels.ng")} ✕
                  </div>
                  <div className="grammar-box">
                    {ngLinesJa.map((lineJa, idx) => {
                      const viLineRaw = ngLinesVi[idx];
                      const viLine =
                        typeof viLineRaw === "string" ? viLineRaw.trim() : "";
                      return (
                        <div
                          key={`ng-${slug}-${idx}`}
                          className="grammar-ng-block"
                        >
                          <p className="grammar-ng-line grammar-ng-line--ja">
                            {lineJa}
                          </p>
                          {showNgViAssist && viLine ? (
                            <p className="grammar-ng-line grammar-ng-line--vi">
                              {viLine}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  {detail.ngNote ? (
                    <div className="grammar-note-red">
                      <GrammarJpVi loc={detail.ngNote} lang={lang} />
                    </div>
                  ) : null}
                </section>
              ) : null}

              {detail.compare?.rows?.length ? (
                <section className="grammar-block" aria-labelledby="g-cmp">
                  <h2 id="g-cmp" className="grammar-h">
                    {t("grammar.labels.compare")}
                  </h2>
                  <div className="grammar-compare">
                    <table>
                      <thead>
                        <tr>
                          <th scope="col" />
                          {(detail.compare.colLabels || []).map((col, i) => (
                            <th key={`ch-${i}`} scope="col">
                              <GrammarJpViTd loc={col} lang={lang} />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detail.compare.rows.map((row, ri) => (
                          <tr key={`cr-${slug}-${ri}`}>
                            <th scope="row">
                              <GrammarJpViTd loc={row.label} lang={lang} />
                            </th>
                            {(row.cells || []).map((cell, ci) => (
                              <td key={`cc-${ri}-${ci}`}>
                                <GrammarJpViTd loc={cell} lang={lang} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}

              {detail.memo ? (
                <section className="grammar-block" aria-labelledby="g-memo">
                  <h2 id="g-memo" className="grammar-h">
                    {t("grammar.labels.memo")}
                  </h2>
                  <div className="grammar-memo">
                    <GrammarJpVi loc={detail.memo} lang={lang} />
                  </div>
                </section>
              ) : null}

              {detail.practice?.items?.length ? (
                <section className="grammar-block" aria-labelledby="g-prac">
                  <h2 id="g-prac" className="grammar-h">
                    {t("grammar.labels.practice")}
                  </h2>
                  <div className="grammar-box">
                    <div className="grammar-practice-lines">
                      {detail.practice.items.map((item, idx) => (
                        <div
                          key={`p-${slug}-${idx}`}
                          className="grammar-practice-item"
                        >
                          <GrammarJpVi loc={item} lang={lang} />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}
            </article>
    </Layout>
  );
}

export default GrammarDetailPage;
