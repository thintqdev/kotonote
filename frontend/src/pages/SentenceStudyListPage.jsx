import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import { listSentenceSpecialties } from "../services/sentenceTemplateService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./ReadingListPage.css";
import "./SentencePages.css";

function SentenceIcon() {
  return (
    <svg
      className="reading-ico sentence-list-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 8h10M7 12h8M7 16h6M5 4h14a1 1 0 011 1v14l-3-2H5a1 1 0 01-1-1V5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SentenceStudyListPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language?.startsWith("ja") ? "ja" : "vi";

  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchList = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const rows = await listSentenceSpecialties();
      setSpecialties(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
      setSpecialties([]);
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  return (
    <Layout pageClassName="vocab-dash" mockStreak={mockStreak}>
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/" },
          { label: t("breadcrumb.sentences") },
        ]}
      />

      <article className="vocab-sheet vocab-scope vocab-notebook sentence-list-scope">
        <header className="sentence-list-head">
          <p className="sentence-kicker">{t("sentencePage.kicker")}</p>
          <h1 className="vocab-lesson-title">{t("sentencePage.listTitle")}</h1>
          <p className="vocab-lesson-sub">{t("sentencePage.listSubtitle")}</p>
        </header>

        {loading ? (
          <p className="vocab-empty" role="status">
            {t("common.loading")}
          </p>
        ) : error ? (
          <p className="vocab-empty sentence-error" role="alert">
            {error}
          </p>
        ) : specialties.length === 0 ? (
          <p className="vocab-empty" role="status">
            {t("sentencePage.noSpecialties")}
          </p>
        ) : (
          <ul className="sentence-specialty-list">
            {specialties.map((sp) => {
              const name = lang === "ja" ? sp.nameJa : sp.nameVi;
              const desc =
                lang === "ja" ? sp.descriptionJa : sp.descriptionVi;
              return (
                <li key={sp._id ?? sp.code}>
                  <Link
                    to={`/sentences/${encodeURIComponent(sp.code)}`}
                    className="reading-row-link sentence-specialty-card"
                  >
                    <SentenceIcon />
                    <div className="sentence-specialty-body">
                      <span className="sentence-specialty-name">{name}</span>
                      {desc ? (
                        <span className="sentence-specialty-desc">{desc}</span>
                      ) : null}
                      <span className="sentence-specialty-meta">
                        {t("sentencePage.templateCount", {
                          n: sp.templateCount ?? 0,
                        })}
                      </span>
                    </div>
                    <span className="sentence-specialty-arrow" aria-hidden>
                      →
                    </span>
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
