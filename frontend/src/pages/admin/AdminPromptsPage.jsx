import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PromptFormModal from "../../components/admin/PromptFormModal.jsx";
import PromptDeleteConfirmModal from "../../components/admin/PromptDeleteConfirmModal.jsx";
import {
  PROMPT_TYPE_OPTIONS,
  promptTypeLabel,
} from "../../constants/promptFieldMeta.js";
import {
  deleteAdminPrompt,
  listAdminPrompts,
} from "../../services/adminPromptService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import "./AdminQuotesPage.css";
import "./AdminPromptsPage.css";

function sortPrompts(list) {
  return [...list].sort((a, b) => {
    const oa = Number(a.displayOrder) || 0;
    const ob = Number(b.displayOrder) || 0;
    if (oa !== ob) return oa - ob;
    const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return tb - ta;
  });
}

/** Một trang quản lý prompt: lọc, bảng, thêm/sửa / xóa đều qua modal xác nhận. */
export default function AdminPromptsPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingPrompt, setEditingPrompt] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const queryParams = useMemo(() => {
    const p = {};
    if (typeFilter) p.type = typeFilter;
    if (activeFilter !== "all") {
      p.isActive = activeFilter === "true";
    }
    return p;
  }, [typeFilter, activeFilter]);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAdminPrompts(queryParams);
      setPrompts(sortPrompts(data.prompts ?? []));
    } catch (e) {
      const msg = getAxiosErrorMessage(e);
      setError(msg);
      toast.error("Không tải được danh sách prompt", { description: msg });
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    void fetchPrompts();
  }, [fetchPrompts]);

  const openCreate = () => {
    setFormMode("create");
    setEditingPrompt(null);
    setFormOpen(true);
  };

  const openEdit = (q) => {
    setFormMode("edit");
    setEditingPrompt(q);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPrompt(null);
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
      await deleteAdminPrompt(String(deleteTarget._id));
      toast.success("Đã xóa prompt");
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchPrompts();
    } catch (e) {
      toast.error("Không xóa được", {
        description: getAxiosErrorMessage(e),
      });
    } finally {
      setDeleteSaving(false);
    }
  };

  return (
    <div className="admin-stub-main admin-prompts-page">
      <h1 className="admin-prompts-title">Prompt AI (Generate)</h1>
      <p className="admin-prompts-lead">
        Mẫu prompt dùng khi generate dữ liệu. Khóa template khớp tên file cũ
        (vd: <code>n5-basic</code>). Placeholder:{" "}
        <code>{"{{count}}"}</code>, <code>{"{{existingWords}}"}</code>.
      </p>

      <div className="admin-prompts-toolbar">
        <div className="admin-prompts-filters">
          <div className="admin-prompts-field">
            <label htmlFor="admin-prompts-filter-cat">Loại</label>
            <select
              id="admin-prompts-filter-cat"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              {PROMPT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-prompts-field">
            <label htmlFor="admin-prompts-filter-active">Trạng thái</label>
            <select
              id="admin-prompts-filter-active"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="true">Đang bật</option>
              <option value="false">Đang tắt</option>
            </select>
          </div>
        </div>
        <div className="admin-prompts-actions">
          <button
            type="button"
            className="admin-prompts-btn admin-prompts-btn--ghost"
            onClick={() => void fetchPrompts()}
            disabled={loading}
          >
            Làm mới
          </button>
          <button
            type="button"
            className="admin-prompts-btn admin-prompts-btn--primary"
            onClick={openCreate}
          >
            Thêm prompt
          </button>
        </div>
      </div>

      {loading ? (
        <p className="admin-prompts-status">Đang tải…</p>
      ) : error ? (
        <p
          className="admin-prompts-status admin-prompts-status--error"
          role="alert"
        >
          {error}
        </p>
      ) : prompts.length === 0 ? (
        <p className="admin-prompts-status">Chưa có prompt nào khớp bộ lọc.</p>
      ) : (
        <div className="admin-prompts-table-wrap">
          <table className="admin-prompts-table">
            <thead>
              <tr>
                <th>Thứ tự</th>
                <th>Tên</th>
                <th>Khóa</th>
                <th>Loại</th>
                <th>JLPT</th>
                <th>Trạng thái</th>
                <th aria-label="Thao tác">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((q) => (
                <tr key={q._id}>
                  <td>{Number(q.displayOrder) || 0}</td>
                  <td>
                    <div className="admin-prompts-cell-text" title={q.name}>
                      {q.name}
                    </div>
                  </td>
                  <td>
                    <code className="admin-prompts-key">{q.templateKey}</code>
                  </td>
                  <td>
                    <span className="admin-prompts-chip">
                      {promptTypeLabel(q.type)}
                    </span>
                  </td>
                  <td>{q.jlptLevel || "—"}</td>
                  <td>
                    <span
                      className={`admin-prompts-chip${q.isActive === false ? " admin-prompts-chip--off" : ""}`}
                    >
                      {q.isActive === false ? "Tắt" : "Bật"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-prompts-row-actions">
                      <button
                        type="button"
                        className="admin-prompts-btn admin-prompts-btn--ghost"
                        onClick={() => openEdit(q)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="admin-prompts-btn admin-prompts-btn--danger"
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

      <PromptFormModal
        open={formOpen}
        mode={formMode}
        prompt={editingPrompt}
        onClose={closeForm}
        onSaved={fetchPrompts}
      />

      <PromptDeleteConfirmModal
        open={deleteOpen}
        prompt={deleteTarget}
        deleting={deleteSaving}
        onClose={closeDeleteConfirm}
        onConfirm={executeDelete}
      />
    </div>
  );
}
