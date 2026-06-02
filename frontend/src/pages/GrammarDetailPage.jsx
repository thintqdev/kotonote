import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  grammarLine,
  grammarIsViUI,
} from "../data/grammarMock.js";
import { getGrammarBySlug } from "../services/grammarService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { isJlptLockedError } from "../utils/jlptAccess.js";
import JlptLockGate from "../components/study/JlptLockGate.jsx";
import GrammarCompareTables from "../components/grammar/GrammarCompareTables.jsx";
import { hasGrammarCompareContent } from "../utils/grammarCompareNormalize.js";
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

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [jlptLocked, setJlptLocked] = useState(false);
  const [lockedJlpt, setLockedJlpt] = useState("");

  useEffect(() => {
    if (!slug || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      setError("");
      try {
        const g = await getGrammarBySlug(slug);
        if (!cancelled) {
          if (!g) setNotFound(true);
          else setDetail(g);
        }
      } catch (err) {
        if (!cancelled) {
          const code =
            err && typeof err === "object" && "messageCode" in err
              ? /** @type {{ messageCode?: string }} */ (err).messageCode
              : undefined;
          if (code === "MSG_917" || code === "MSG_006") {
            setNotFound(true);
          } else if (isJlptLockedError(err)) {
            const level =
              err &&
              typeof err === "object" &&
              Array.isArray(/** @type {{ errors?: { message?: string }[] }} */ (err).errors)
                ? /** @type {{ errors?: { message?: string }[] }} */ (err).errors?.[0]
                    ?.message
                : "";
            setLockedJlpt(level || "");
            setJlptLocked(true);
          } else {
            setError(getApiErrorMessage(err, t));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, user, t]);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  if (loading) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days}>
        <p className="grammar-empty">{t("common.loading")}</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days}>
        <p className="grammar-empty grammar-empty--error" role="alert">
          {error}
        </p>
        <Link className="grammar-back" to="/grammar">
          {t("grammarPage.backToList")}
        </Link>
      </Layout>
    );
  }

  if (jlptLocked) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days}>
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), to: "/", end: true },
            { label: t("breadcrumb.grammar"), to: "/grammar" },
          ]}
        />
        <JlptLockGate jlpt={lockedJlpt} forceLocked>
          <span />
        </JlptLockGate>
        <Link className="grammar-back" to="/grammar">
          {t("grammarPage.backToList")}
        </Link>
      </Layout>
    );
  }

  if (notFound || !detail) {
    return <Navigate to="/grammar" replace />;
  }

  const ngLinesJa = detail.ng?.ja ?? [];
  const ngLinesVi = detail.ng?.vi ?? [];

  const showNgViAssist = grammarIsViUI(lang);

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
    >
      <Breadcrumb
              items={[
                { label: t("breadcrumb.home"), to: "/", end: true },
                { label: t("breadcrumb.grammar"), to: "/grammar" },
                { label: detail.pattern },
              ]}
            />

            <JlptLockGate jlpt={detail.jlpt}>
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
                {detail.topicRibbon ? (
                  <p className="grammar-detail-ribbon">
                    {grammarLine(detail.topicRibbon, lang).primary}
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
                    {t("grammar.labels.ng")}
                  </div>
                  <div className="grammar-box grammar-box-ng">
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

              {hasGrammarCompareContent(detail.compare) ? (
                <section className="grammar-block" aria-labelledby="g-cmp">
                  <h2 id="g-cmp" className="grammar-h">
                    {t("grammar.labels.compare")}
                  </h2>
                  <GrammarCompareTables
                    compare={detail.compare}
                    lang={lang}
                    slug={slug}
                  />
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
            </JlptLockGate>
    </Layout>
  );
}

export default GrammarDetailPage;
