import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { KANJI_JLPT_OPTIONS } from "../../constants/kanjiFieldMeta.js";
import { listKanjiDecks } from "../../services/adminKanjiService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";

function jlptLabel(value) {
  return KANJI_JLPT_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

const JLPT_KEYS = ["n5", "n4", "n3", "n2", "n1"];

function jlptCssClass(jlpt) {
  const v = String(jlpt || "").toLowerCase();
  return JLPT_KEYS.includes(v) ? v : "n5";
}

/** Nền gradient theo JLPT (không ảnh bìa — KanjiDeck không có thumbnail) */
function KanjiDeckCover({ deck }) {
  const lv = jlptCssClass(deck.jlpt);
  return (
    <div className={`admin-vocab-deck-cover admin-vocab-deck-cover--${lv}`}>
      <div className="admin-vocab-deck-cover-scrim" />
      <div className="admin-vocab-deck-cover-badges">
        <span
          className={`admin-vocab-chip admin-vocab-chip--jlpt admin-vocab-chip--${lv}`}
          title={jlptLabel(deck.jlpt)}
        >
          {String(deck.jlpt || "?").toUpperCase()}
        </span>
        <span className="admin-vocab-chip admin-vocab-chip--count">
          {deck.kanjiCount ?? 0} chữ
        </span>
      </div>
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/** Hub Kanji trong Studio — danh sách deck KanjiDeck từ API. */
export default function AdminKanjiHome() {
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
        const data = await listKanjiDecks(
          { page, limit: pageSize },
          { signal: ac.signal },
        );
        setDecks(data.decks ?? []);
        setPagination(data.pagination ?? null);
      } catch (e) {
        if (ac.signal.aborted) return;
        const msg = getAxiosErrorMessage(e);
        setError(msg);
        toast.error("Không tải được danh sách deck kanji", {
          description: msg,
        });
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
      <h2 className="admin-vocab-home-title">Quản lý kanji</h2>
      <p className="admin-vocab-home-lead">
        Deck và chữ kanji theo schema backend (titleVi, titleJa, jlpt, char,
        onYomi, kunYomi, hanViet, meaningVi…).
      </p>
      <div className="admin-vocab-home-toolbar">
        <div className="admin-vocab-home-actions">
          <Link className="admin-vocab-home-cta" to="/admin/kanji/decks/new">
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
                <KanjiDeckCover deck={d} />
                {d.isActive === false ? (
                  <span className="admin-vocab-deck-ribbon">Ẩn</span>
                ) : null}
              </div>
              <div className="admin-vocab-deck-card-body">
                <h3 className="admin-vocab-deck-name" title={d.titleVi || ""}>
                  {d.titleVi || "—"}
                </h3>
                {d.titleJa ? (
                  <p className="admin-vocab-deck-sub" lang="ja">
                    {d.titleJa}
                  </p>
                ) : null}
                <p className="admin-vocab-deck-meta admin-vocab-deck-meta--inline">
                  <span title={jlptLabel(d.jlpt)}>{jlptLabel(d.jlpt)}</span>
                </p>
                <div className="admin-vocab-deck-card-actions">
                  <Link
                    className="admin-vocab-deck-link"
                    to={`/admin/kanji/decks/${encodeURIComponent(d._id)}?mode=view`}
                  >
                    Xem
                  </Link>
                  <Link
                    className="admin-vocab-deck-link admin-vocab-deck-link--primary"
                    to={`/admin/kanji/decks/${encodeURIComponent(d._id)}`}
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
