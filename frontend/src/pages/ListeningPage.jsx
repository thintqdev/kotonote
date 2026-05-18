import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import StudyPageHeader from "../components/study/StudyPageHeader.jsx";
import { mockStreak } from "../data/dashboardHomeMock.js";
import listeningService from "../services/listeningService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./ReadingListPage.css"; // Reuse reading list styles for consistency

const LISTENING_JLPT_LEVELS = ["N1", "N2", "N3", "N4", "N5"];

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
        d="M3 11a9 9 0 0 1 18 0v4a2 2 0 0 1-2 2h-2v-6h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M3 11v4a2 2 0 0 0 2 2h2v-6H3z"
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

export default function ListeningPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const jlpt = (searchParams.get("jlpt") || "").trim();

  const [list, setList] = useState([]);
  const [jlptLevels, setJlptLevels] = useState(LISTENING_JLPT_LEVELS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await listeningService.getAllPublished();
        if (cancelled) return;
        if (response.success) {
          setList(response.data || []);
        } else {
          setError(response.message || "Failed to load listening exercises");
        }
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
  }, [t]);

  const filteredList = useMemo(() => {
    if (!jlpt) return list;
    return list.filter((item) => item.jlpt === jlpt);
  }, [list, jlpt]);

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
          { label: "Luyện nghe Choukai" },
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
                Luyện Nghe Tiếng Nhật
              </h1>
              <p className="vocab-lesson-sub">
                <span className="reading-sub-kicker" lang="ja">
                  聴解
                </span>
                <span className="reading-sub-sep"> · </span>
                <span>Choukai</span>
                <span className="reading-sub-sep"> — </span>
                Cải thiện kỹ năng nghe mỗi ngày
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
        >
          <button
            type="button"
            role="tab"
            aria-selected={!jlpt}
            className={`vocab-tab${!jlpt ? " vocab-tab--active" : ""}`}
            onClick={() => setJlpt("")}
          >
            Tất cả
          </button>
          {jlptLevels.map((lv) => (
            <button
              key={lv}
              type="button"
              role="tab"
              aria-selected={jlpt === lv}
              className={`vocab-tab${jlpt === lv ? " vocab-tab--active" : ""}`}
              onClick={() => setJlpt(lv)}
            >
              {lv}
            </button>
          ))}
        </div>

        {filteredList.length === 0 ? (
          <p className="vocab-empty" role="status">
            Chưa có bài nghe nào ở cấp độ này.
          </p>
        ) : (
          <ul className="vocab-lesson-list">
            {filteredList.map((item) => {
              return (
                <li key={item._id} className="vocab-lesson-card">
                  <Link className="reading-row-link" to={`/listening/${item._id}`}>
                    <div className="reading-thumb-wrap" style={{ background: '#f5f7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? (
                        <img
                          className="reading-thumb"
                          src={item.image}
                          alt=""
                          width={200}
                          height={140}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span style={{ fontSize: '4rem' }}>🎧</span>
                      )}
                    </div>
                    <div className="vocab-lesson-main reading-row-main">
                      <div className="reading-row-titleline">
                        <span
                          className={`reading-badge reading-badge--${item.jlpt?.toLowerCase()}`}
                          lang="ja"
                        >
                          {item.jlpt}
                        </span>
                        <h2
                          className="vocab-lesson-card-title reading-row-title"
                        >
                          {item.titleVi}
                        </h2>
                      </div>
                      <p
                        className="vocab-lesson-card-sub reading-row-snippet"
                        lang="ja"
                      >
                        {item.titleJa}
                      </p>
                      <div className="reading-row-meta">
                        <span className="reading-meta-item">
                          <ListeningIconHeadphone />
                          {item.questions?.length || 0} câu hỏi
                        </span>
                        <span className="reading-meta-item">
                          <ListeningIconClock />
                          {Math.floor(item.duration / 60)} phút {item.duration % 60} giây
                        </span>
                      </div>
                      <span className="reading-row-cta vocab-cta-btn reading-cta--not_started">
                        Bắt đầu
                      </span>
                    </div>
                    <span className="vocab-lesson-chevron" aria-hidden>
                      ›
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
