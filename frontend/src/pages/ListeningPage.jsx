import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import listeningService from "../services/listeningService.js";
import { LISTENING_ASSETS } from "../constants/listeningAssets.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import { useJlptAccess } from "../hooks/useJlptAccess.js";
import JlptLockedOverlay from "../components/study/JlptLockedOverlay.jsx";
import "../components/study/JlptLockGate.css";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./ReadingListPage.css"; // Reuse reading list styles for consistency

const LISTENING_JLPT_LEVELS = ["N1", "N2", "N3", "N4", "N5"];

export default function ListeningPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isLocked } = useJlptAccess();
  const [searchParams, setSearchParams] = useSearchParams();

  const jlpt = (searchParams.get("jlpt") || "").trim();

  const [list, setList] = useState([]);
  const [jlptLevels, setJlptLevels] = useState(LISTENING_JLPT_LEVELS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { items, jlptLevels: levels } =
          await listeningService.getAllPublished({
            jlpt: jlpt || undefined,
          });
        if (cancelled) return;
        setList(items);
        if (levels?.length) setJlptLevels(levels);
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
  }, [t, jlpt]);

  const filteredList = list;

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

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      pageClassName="vocab-dash"
    >
      {loading ? (
        <p className="vocab-empty">{t("common.loading")}</p>
      ) : (
        <>
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
              className={`vocab-tab${jlpt === lv ? " vocab-tab--active" : ""}${isLocked(lv) ? " vocab-tab--jlpt-locked" : ""}`}
              onClick={() => setJlpt(lv)}
            >
              {isLocked(lv) ? t("jlptAccess.tabLocked", { level: lv }) : lv}
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
              const locked = item.locked || isLocked(item.jlpt);
              const rowInner = (
                <>
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
                        <img
                          className="reading-thumb reading-thumb--placeholder"
                          src={LISTENING_ASSETS.placeholderThumb}
                          alt=""
                          width={200}
                          height={140}
                          loading="lazy"
                          decoding="async"
                        />
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
                          <img
                            className="reading-ico"
                            src={LISTENING_ASSETS.iconHeadphone}
                            alt=""
                            width={20}
                            height={20}
                            decoding="async"
                          />
                          {item.questions?.length || 0} câu hỏi
                        </span>
                        <span className="reading-meta-item">
                          <img
                            className="reading-ico"
                            src={LISTENING_ASSETS.iconClock}
                            alt=""
                            width={20}
                            height={20}
                            decoding="async"
                          />
                          {Math.floor(item.duration / 60)} phút {item.duration % 60} giây
                        </span>
                      </div>
                      <span className="reading-row-cta vocab-cta-btn reading-cta--not_started">
                        Bắt đầu
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
                    key={item._id}
                    className="reading-card-wrap--locked vocab-lesson-card"
                  >
                    <div className="reading-row-link reading-card--jlpt-locked">
                      {rowInner}
                    </div>
                    <JlptLockedOverlay level={item.jlpt} />
                  </li>
                );
              }
              return (
                <li key={item._id} className="vocab-lesson-card">
                  <Link className="reading-row-link" to={`/listening/${item._id}`}>
                    {rowInner}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </article>
        </>
      )}
    </Layout>
  );
}
