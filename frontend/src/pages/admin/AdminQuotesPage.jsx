import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import QuoteFormModal from "../../components/admin/QuoteFormModal.jsx";
import QuoteDeleteConfirmModal from "../../components/admin/QuoteDeleteConfirmModal.jsx";
import {
  QUOTE_CATEGORY_OPTIONS,
  quoteCategoryLabel,
} from "../../constants/quoteFieldMeta.js";
import {
  deleteAdminQuote,
  listAdminQuotes,
} from "../../services/adminQuoteService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import "./AdminQuotesPage.css";

function sortQuotes(list) {
  return [...list].sort((a, b) => {
    const oa = Number(a.displayOrder) || 0;
    const ob = Number(b.displayOrder) || 0;
    if (oa !== ob) return oa - ob;
    const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return tb - ta;
  });
}

/** Một trang quản lý quote: lọc, bảng, thêm/sửa / xóa đều qua modal xác nhận. */
export default function AdminQuotesPage() {
  const [category, setCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingQuote, setEditingQuote] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const queryParams = useMemo(() => {
    const p = {};
    if (category) p.category = category;
    if (activeFilter !== "all") {
      p.isActive = activeFilter === "true";
    }
    return p;
  }, [category, activeFilter]);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAdminQuotes(queryParams);
      setQuotes(sortQuotes(data.quotes ?? []));
    } catch (e) {
      const msg = getAxiosErrorMessage(e);
      setError(msg);
      toast.error("Không tải được danh sách quote", { description: msg });
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    void fetchQuotes();
  }, [fetchQuotes]);

  const openCreate = () => {
    setFormMode("create");
    setEditingQuote(null);
    setFormOpen(true);
  };

  const openEdit = (q) => {
    setFormMode("edit");
    setEditingQuote(q);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingQuote(null);
  };

  const openDeleteConfirm = (q) => {
    setDeleteTarget(q);
    setDeleteOpen(true);
  };

  const closeDeleteConfirm = () => {
    if (!deleteSaving) {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleteSaving(true);
    try {
      await deleteAdminQuote(String(deleteTarget._id));
      toast.success("Đã xóa quote");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchQuotes();
    } catch (e) {
      toast.error("Không xóa được", {
        description: getAxiosErrorMessage(e),
      });
    } finally {
      setDeleteSaving(false);
    }
  };

  return (
    <div className="admin-stub-main admin-quotes-page">
      <h1 className="admin-quotes-title">Trích dẫn (Quotes)</h1>
      <p className="admin-quotes-lead">
        Quản lý nội dung quote hiển thị trong app.
      </p>

      <div className="admin-quotes-toolbar">
        <div className="admin-quotes-filters">
          <div className="admin-quotes-field">
            <label htmlFor="admin-quotes-filter-cat">Danh mục</label>
            <select
              id="admin-quotes-filter-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Tất cả</option>
              {QUOTE_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-quotes-field">
            <label htmlFor="admin-quotes-filter-active">Trạng thái</label>
            <select
              id="admin-quotes-filter-active"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="true">Đang bật</option>
              <option value="false">Đang tắt</option>
            </select>
          </div>
        </div>
        <div className="admin-quotes-actions">
          <button
            type="button"
            className="admin-quotes-btn admin-quotes-btn--ghost"
            onClick={() => void fetchQuotes()}
            disabled={loading}
          >
            Làm mới
          </button>
          <button
            type="button"
            className="admin-quotes-btn admin-quotes-btn--primary"
            onClick={openCreate}
          >
            Thêm quote
          </button>
        </div>
      </div>

      {loading ? (
        <p className="admin-quotes-status">Đang tải…</p>
      ) : error ? (
        <p
          className="admin-quotes-status admin-quotes-status--error"
          role="alert"
        >
          {error}
        </p>
      ) : quotes.length === 0 ? (
        <p className="admin-quotes-status">Chưa có quote nào khớp bộ lọc.</p>
      ) : (
        <div className="admin-quotes-table-wrap">
          <table className="admin-quotes-table">
            <thead>
              <tr>
                <th>Thứ tự</th>
                <th>Tiếng Việt</th>
                <th>Tiếng Nhật</th>
                <th>Tác giả</th>
                <th>Danh mục</th>
                <th>Hiển thị</th>
                <th aria-label="Thao tác">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q._id}>
                  <td>{Number(q.displayOrder) || 0}</td>
                  <td>
                    <div className="admin-quotes-cell-text" title={q.quoteVi}>
                      {q.quoteVi}
                    </div>
                  </td>
                  <td>
                    <div
                      className="admin-quotes-cell-text admin-quotes-cell-text--ja"
                      lang="ja"
                      title={q.quoteJa}
                    >
                      {q.quoteJa}
                    </div>
                  </td>
                  <td>{q.author?.trim() ? q.author : "—"}</td>
                  <td>
                    <span className="admin-quotes-chip">
                      {quoteCategoryLabel(q.category)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-quotes-chip${q.isActive === false ? " admin-quotes-chip--off" : ""}`}
                    >
                      {q.isActive === false ? "Tắt" : "Bật"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-quotes-row-actions">
                      <button
                        type="button"
                        className="admin-quotes-btn admin-quotes-btn--ghost"
                        onClick={() => openEdit(q)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="admin-quotes-btn admin-quotes-btn--danger"
                        disabled={deleteSaving}
                        onClick={() => openDeleteConfirm(q)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <QuoteFormModal
        open={formOpen}
        mode={formMode}
        quote={editingQuote}
        onClose={closeForm}
        onSaved={fetchQuotes}
      />

      <QuoteDeleteConfirmModal
        open={deleteOpen}
        quote={deleteTarget}
        deleting={deleteSaving}
        onClose={closeDeleteConfirm}
        onConfirm={executeDelete}
      />
    </div>
  );
}
