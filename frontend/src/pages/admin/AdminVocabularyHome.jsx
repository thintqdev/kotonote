import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  JLPT_LEVEL_OPTIONS,
  VOCAB_CATEGORY_OPTIONS,
} from "../../constants/vocabularyFieldMeta.js";
import { listVocabularyDecks } from "../../services/adminVocabularyService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";

function levelLabel(value) {
  return JLPT_LEVEL_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function categoryLabel(value) {
  return VOCAB_CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

const LEVEL_KEYS = ["n5", "n4", "n3", "n2", "n1"];

function levelCssClass(level) {
  const v = String(level || "").toLowerCase();
  return LEVEL_KEYS.includes(v) ? v : "n5";
}

function isLikelyImageUrl(s) {
  const t = String(s || "").trim();
  if (!t) return false;
  return (
    t.startsWith("http://") ||
    t.startsWith("https://") ||
    t.startsWith("data:image/")
  );
}

/** Ảnh bìa deck + nền gradient theo cấp độ khi không có ảnh / lỗi tải */
function DeckCover({ deck }) {
  const [imgFailed, setImgFailed] = useState(false);
  const raw = typeof deck.thumbnail === "string" ? deck.thumbnail.trim() : "";
  const showImg = Boolean(raw && isLikelyImageUrl(raw) && !imgFailed);
  const lv = levelCssClass(deck.level);

  return (
    <div className={`admin-vocab-deck-cover admin-vocab-deck-cover--${lv}`}>
      {showImg ? (
        <img
          className="admin-vocab-deck-cover-img"
          src={raw}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      ) : null}
      <div className="admin-vocab-deck-cover-scrim" />
      <div className="admin-vocab-deck-cover-badges">
        <span
          className={`admin-vocab-chip admin-vocab-chip--jlpt admin-vocab-chip--${lv}`}
          title={levelLabel(deck.level)}
        >
          {String(deck.level || "?").toUpperCase()}
        </span>
        {deck.category ? (
          <span className="admin-vocab-chip admin-vocab-chip--cat">
            {categoryLabel(deck.category)}
          </span>
        ) : null}
        <span className="admin-vocab-chip admin-vocab-chip--count">
          {deck.wordCount ?? deck.totalWords ?? 0} từ
        </span>
      </div>
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/** Trang hub Từ vựng trong Studio — danh sách deck từ API backend. */
export default function AdminVocabularyHome() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await listVocabularyDecks(
          { page, limit: pageSize },
          { signal: ac.signal },
        );
        setDecks(data.decks ?? []);
        setPagination(data.pagination ?? null);
      } catch (e) {
        if (ac.signal.aborted) return;
        const msg = getAxiosErrorMessage(e);
        setError(msg);
        toast.error("Không tải được danh sách deck", { description: msg });
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [page, pageSize]);

  useEffect(() => {
    if (loading || error || !pagination) return;
    if (pagination.total > 0 && decks.length === 0 && page > 1) {
      setPage(1);
    }
  }, [loading, error, pagination, decks.length, page]);

  return (
    <div className="admin-stub-main admin-vocab-home">
      <h2 className="admin-vocab-home-title">Quản lý từ vựng</h2>
      <p className="admin-vocab-home-lead">
        Deck và từ lưu theo schema backend (title, level, category, word,
        reading, meaning…).
      </p>
      <div className="admin-vocab-home-toolbar">
        <div className="admin-vocab-home-actions">
          <Link
            className="admin-vocab-home-cta"
            to="/admin/vocabulary/decks/new"
          >
            Tạo deck mới
          </Link>
        </div>
        {!loading && !error && pagination && pagination.total > 0 ? (
          <label className="admin-vocab-page-size">
            <span>Mỗi trang</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Số deck mỗi trang"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {loading ? (
        <p className="admin-vocab-home-status">Đang tải…</p>
      ) : error ? (
        <p
          className="admin-vocab-home-status admin-vocab-home-status--error"
          role="alert"
        >
          {error}
        </p>
      ) : decks.length === 0 ? (
        <p className="admin-vocab-home-status">Chưa có deck nào.</p>
      ) : (
        <ul className="admin-vocab-deck-list">
          {decks.map((d) => (
            <li
              key={d._id}
              className={`admin-vocab-deck-card${d.isActive === false ? " admin-vocab-deck-card--inactive" : ""}`}
            >
              <div className="admin-vocab-deck-card-visual">
                <DeckCover deck={d} />
                {d.isActive === false ? (
                  <span className="admin-vocab-deck-ribbon">Ẩn</span>
                ) : null}
              </div>
              <div className="admin-vocab-deck-card-body">
                <h3 className="admin-vocab-deck-name" title={d.title || ""}>
                  {d.title || "—"}
                </h3>
                {d.titleJa ? (
                  <p className="admin-vocab-deck-sub" lang="ja">
                    {d.titleJa}
                  </p>
                ) : null}
                <p className="admin-vocab-deck-meta admin-vocab-deck-meta--inline">
                  <span title={levelLabel(d.level)}>{levelLabel(d.level)}</span>
                </p>
                <div className="admin-vocab-deck-card-actions">
                  <Link
                    className="admin-vocab-deck-link"
                    to={`/admin/vocabulary/decks/${encodeURIComponent(d._id)}?mode=view`}
                  >
                    Xem
                  </Link>
                  <Link
                    className="admin-vocab-deck-link admin-vocab-deck-link--primary"
                    to={`/admin/vocabulary/decks/${encodeURIComponent(d._id)}`}
                  >
                    Sửa
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && pagination && pagination.total > 0 ? (
        <nav
          className="admin-vocab-pagination"
          aria-label="Phân trang danh sách deck"
        >
          <button
            type="button"
            className="admin-vocab-pagination-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </button>
          <span className="admin-vocab-pagination-info">
            Trang {pagination.page} / {Math.max(1, pagination.pages)}
            <span className="admin-vocab-pagination-sep" aria-hidden>
              {" "}
              ·{" "}
            </span>
            <span className="admin-vocab-pagination-total">
              {pagination.total} deck
            </span>
          </span>
          <button
            type="button"
            className="admin-vocab-pagination-btn"
            disabled={page >= pagination.pages}
            onClick={() =>
              setPage((p) =>
                pagination.pages ? Math.min(pagination.pages, p + 1) : p + 1,
              )
            }
          >
            Sau
          </button>
        </nav>
      ) : null}
    </div>
  );
}
