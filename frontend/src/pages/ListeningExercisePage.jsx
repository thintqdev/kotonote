import { useCallback, useEffect, useState, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import listeningService from "../services/listeningService.js";
import { LISTENING_ASSETS } from "../constants/listeningAssets.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";
import "./DashboardHome.css";
import "./GrammarPages.css";
import "./ReadingListPage.css";

const readingChoiceLetterJa = (index) => {
  const letters = ["A", "B", "C", "D"];
  return letters[index] || "?";
};

export default function ListeningExercisePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  /** @type {Record<number, number>} */
  const [quizPick, setQuizPick] = useState({});
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await listeningService.getById(id);
        if (cancelled) return;
        if (response.success && response.data) {
          setDetail(response.data);
        } else {
          setDetail(null);
          setError("Không tìm thấy bài nghe.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, t));
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, id, t]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [detail]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((e) => {
          console.error("Audio playback failed", e);
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = (e) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handlePick = useCallback(
    (qi, ci) => {
      setQuizPick((prev) => ({ ...prev, [qi]: ci }));
    },
    [],
  );

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  if (loading) {
    return (
      <Layout userName={headerName} streakDays={mockStreak.days}>
        <p className="vocab-empty">{t("common.loading")}</p>
      </Layout>
    );
  }

  if (!detail && !loading && !error) {
    return <Navigate to="/listening" replace />;
  }

  return (
    <Layout userName={headerName} streakDays={mockStreak.days}>
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: "Luyện nghe", to: "/listening" },
          { label: detail?.titleVi || "Chi tiết" },
        ]}
      />

      {error ? (
        <p className="vocab-empty" role="alert">
          {error}
        </p>
      ) : null}

      {detail && (
        <article
          className="grammar-sheet grammar-scope grammar-detail--journal"
          aria-labelledby="listening-detail-title"
        >
          <Link className="grammar-back" to="/listening">
            Quay lại danh sách
          </Link>

          {detail.image ? (
            <div className="grammar-block reading-detail-cover-block">
              <div className="grammar-box reading-detail-cover-wrap">
                <img
                  className="reading-detail-cover-img"
                  src={detail.image}
                  alt=""
                  width={800}
                  height={360}
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          ) : null}

          <header className="grammar-detail-head">
            <p className="grammar-detail-kicker">
              {detail.jlpt} · Luyện nghe
            </p>
            <h1
              id="listening-detail-title"
              className="grammar-detail-title"
            >
              {detail.titleVi}
            </h1>
            <p className="grammar-detail-ribbon">{detail.titleJa}</p>
          </header>

          <section className="grammar-block" aria-labelledby="listening-audio">
            <div className="grammar-box" style={{ padding: '24px', textAlign: 'center', background: '#f8faf6', borderRadius: '12px' }}>
              <audio ref={audioRef} src={detail.audioUrl} preload="metadata" />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                  style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'var(--admin-sage)', color: '#fff',
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <img
                    src={isPlaying ? LISTENING_ASSETS.iconPause : LISTENING_ASSETS.iconPlay}
                    alt=""
                    width={24}
                    height={24}
                    decoding="async"
                  />
                </button>
                <div style={{ flex: 1 }}>
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || detail.duration || 100} 
                    value={currentTime} 
                    onChange={handleSeek}
                    style={{ width: '100%', accentColor: 'var(--admin-sage)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                    <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                    <span>{Math.floor((duration || detail.duration || 0) / 60)}:{(Math.floor((duration || detail.duration || 0) % 60)).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {detail.questions?.length ? (
            <section className="grammar-block" aria-labelledby="listening-q">
              <h2 id="listening-q" className="grammar-h">
                Câu hỏi trắc nghiệm
              </h2>
              <p className="grammar-vi-note reading-q-hint">
                Nghe đoạn hội thoại và chọn đáp án đúng nhất.
              </p>
              {detail.questions.map((q, qi) => {
                const picked = quizPick[qi];
                const hasPicked = typeof picked === "number";
                const isCorrect = hasPicked && picked === q.answerIndex;

                return (
                  <fieldset
                    key={`q-${detail._id}-${qi}`}
                    className="grammar-box grammar-box--soft reading-detail-q-box reading-q-fieldset"
                  >
                    <legend className="reading-q-legend">
                      <span className="grammar-jp-line reading-detail-q-prompt" lang="ja">
                        {qi + 1}. {q.questionJa || q.questionVi}
                      </span>
                    </legend>
                    
                    <div
                      className="reading-q-options"
                      style={q.choiceImages?.some(img => img) ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } : undefined}
                      role="radiogroup"
                    >
                      {q.choices.map((choice, ci) => {
                        const letter = readingChoiceLetterJa(ci);
                        const isThis = hasPicked && picked === ci;
                        const isAnswer = ci === q.answerIndex;
                        let optClass = "reading-q-option";
                        if (hasPicked) {
                          if (isAnswer) optClass += " reading-q-option--answer";
                          else if (isThis) optClass += " reading-q-option--wrong";
                          else optClass += " reading-q-option--idle";
                        }
                        
                        const hasImg = q.choiceImages && q.choiceImages[ci];
                        
                        return (
                          <button
                            key={`c-${detail._id}-${qi}-${ci}`}
                            type="button"
                            role="radio"
                            aria-checked={isThis}
                            disabled={hasPicked}
                            className={optClass}
                            style={hasImg ? { flexDirection: 'column', height: 'auto', padding: '16px' } : undefined}
                            onClick={() => void handlePick(qi, ci)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: hasImg ? '8px' : '0' }}>
                              <span className="reading-q-option-letter">{letter}</span>
                              {!hasImg && <span className="reading-q-option-text" style={{ marginLeft: '12px' }}>{choice}</span>}
                            </div>
                            {hasImg && (
                              <img src={q.choiceImages[ci]} alt={`Đáp án ${letter}`} style={{ maxWidth: '100%', height: '120px', objectFit: 'contain' }} />
                            )}
                            {hasImg && choice && (
                              <span style={{ marginTop: '8px', fontSize: '0.9rem' }}>{choice}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {hasPicked ? (
                      <>
                        <p
                          className={`reading-q-result${isCorrect ? " reading-q-result--ok" : " reading-q-result--ng"}`}
                          role="status"
                        >
                          {isCorrect
                            ? "Chính xác! Làm tốt lắm 🎉"
                            : "Chưa chính xác! Thử lại nhé 🧐"}
                        </p>
                        
                        <div
                          className="reading-q-explain-block"
                        >
                          <h3 className="reading-q-explain-title">
                            Giải thích
                          </h3>
                          <div className="reading-q-explain-row">
                            <p className="grammar-jp-line reading-q-explain-ja" style={{ marginBottom: '8px' }}>
                              Đáp án đúng là: <strong>{readingChoiceLetterJa(q.answerIndex)}</strong>
                            </p>
                            {q.explainVi && (
                              <p className="grammar-example-vi-gloss reading-q-explain-vi">
                                {q.explainVi}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="reading-q-retry"
                          onClick={() =>
                            setQuizPick((prev) => {
                              const next = { ...prev };
                              delete next[qi];
                              return next;
                            })
                          }
                        >
                          Thử lại
                        </button>
                      </>
                    ) : null}
                  </fieldset>
                );
              })}
            </section>
          ) : null}
          
          <section className="grammar-block">
            <button 
              className="vocab-cta-btn" 
              onClick={() => setShowScript(!showScript)}
              style={{ width: '100%', padding: '16px', fontSize: '1rem', background: '#e9ecef', color: '#333' }}
            >
              {showScript ? 'Ẩn kịch bản (Script)' : 'Xem kịch bản (Script)'}
            </button>
            
            {showScript && (
              <div className="grammar-box" style={{ marginTop: '16px', padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--admin-ink)' }}>Tiếng Nhật</h3>
                  {detail.scriptJa?.split('\n').map((line, i) => (
                    <p key={`ja-${i}`} className="grammar-jp-line" style={{ marginBottom: '8px' }}>{line}</p>
                  ))}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--admin-ink)' }}>Tiếng Việt</h3>
                  {detail.scriptVi?.split('\n').map((line, i) => (
                    <p key={`vi-${i}`} style={{ marginBottom: '8px', lineHeight: '1.6' }}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </section>
        </article>
      )}
    </Layout>
  );
}
