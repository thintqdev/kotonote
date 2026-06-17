import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import GrammarLocFields from "../../components/admin/GrammarLocFields.jsx";
import {
  GRAMMAR_JLPT_LEVELS,
  GRAMMAR_TAG_ADMIN_LABELS,
  GRAMMAR_TAG_IDS,
} from "../../constants/grammarFieldMeta.js";
import {
  createAdminGrammar,
  getAdminGrammar,
  updateAdminGrammar,
} from "../../services/adminGrammarService.js";
import { getApiErrorMessage } from "../../utils/apiErrorMessage.js";
import GrammarImportModal from "../../components/admin/GrammarImportModal.jsx";
import { GRAMMAR_AI_GENERATE } from "../../constants/editorAiGenerateConfig.js";
import { listAdminPrompts } from "../../services/adminPromptService.js";
import {
  emptyGrammarForm,
  formToGrammarPayload,
  grammarToForm,
} from "../../utils/grammarForm.js";
import { mergeGrammarAIIntoForm } from "../../utils/grammarAiMerge.js";
import "./AdminGrammarPage.css";

export default function AdminGrammarEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyGrammarForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [promptOptions, setPromptOptions] = useState([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(
    GRAMMAR_AI_GENERATE.defaultTemplate("N5"),
  );

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const g = await getAdminGrammar(id);
        if (!cancelled) setForm(grammarToForm(g));
      } catch (e) {
        toast.error("Không tải được bài ngữ pháp", {
          description: getApiErrorMessage(e),
        });
        navigate("/admin/grammar", { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPromptsLoading(true);
      try {
        const data = await listAdminPrompts({
          type: GRAMMAR_AI_GENERATE.promptType,
          isActive: true,
        });
        if (cancelled) return;
        const list = (data.prompts ?? []).sort(
          (a, b) =>
            (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0),
        );
        setPromptOptions(list);
        const preferred = GRAMMAR_AI_GENERATE.defaultTemplate(form.jlpt);
        if (list.some((p) => p.templateKey === preferred)) {
          setSelectedTemplate(preferred);
        } else if (list[0]?.templateKey) {
          setSelectedTemplate(list[0].templateKey);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error("Không tải được danh sách prompt", {
            description: getApiErrorMessage(e),
          });
        }
      } finally {
        if (!cancelled) setPromptsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!promptOptions.length) return;
    const preferred = GRAMMAR_AI_GENERATE.defaultTemplate(form.jlpt);
    if (promptOptions.some((p) => p.templateKey === preferred)) {
      setSelectedTemplate(preferred);
    }
  }, [form.jlpt, promptOptions]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tid) => {
    setForm((prev) => {
      const has = prev.tagIds.includes(tid);
      return {
        ...prev,
        tagIds: has
          ? prev.tagIds.filter((t) => t !== tid)
          : [...prev.tagIds, tid],
      };
    });
  };

  const updateExample = (index, value) => {
    setForm((prev) => {
      const next = [...prev.examples];
      next[index] = value;
      return { ...prev, examples: next };
    });
  };

  const updatePractice = (index, value) => {
    setForm((prev) => {
      const next = [...prev.practiceItems];
      next[index] = value;
      return { ...prev, practiceItems: next };
    });
  };

  const handleGenerateAI = async () => {
    const pattern = form.pattern.trim();
    if (!pattern) {
      toast.error("Nhập mẫu ngữ pháp (Pattern) trước khi Generate AI");
      return;
    }
    if (!selectedTemplate) {
      toast.error("Chọn mẫu prompt");
      return;
    }
    setGenerating(true);
    try {
      const { item, source, fallbackReason } = await GRAMMAR_AI_GENERATE.generate({
        templateName: selectedTemplate,
        prompt: "",
        jlpt: form.jlpt,
        patternHint: pattern,
      });
      if (!item) {
        toast.error("AI không trả về nội dung");
        return;
      }
      setForm((prev) => {
        const merged = mergeGrammarAIIntoForm(prev, item);
        return {
          ...merged,
          pattern: prev.pattern.trim() || item.pattern?.trim() || prev.pattern,
          jlpt: prev.jlpt,
          slug: isEdit ? prev.slug : merged.slug,
        };
      });
      if (source === "gemini") {
        toast.success("Đã điền vào form từ Gemini AI", {
          description: `${selectedTemplate} · Kiểm tra trước khi lưu.`,
        });
        return;
      }
      const reasonHint =
        fallbackReason === "gemini_not_configured"
          ? "Server chưa có GEMINI_API_KEYS / GEMINI_API_KEY trong .env"
          : fallbackReason === "normalize_failed"
            ? "Gemini trả JSON nhưng không parse/normalize được — xem log backend"
            : "Gemini API lỗi hoặc hết quota — xem log backend";
      toast.warning("AI không khả dụng — đã điền dữ liệu mẫu", {
        description: `${reasonHint} · Pattern "${pattern}" đã được gửi qua patternHint (prompt trống là bình thường).`,
      });
    } catch (err) {
      toast.error("Generate thất bại", {
        description: getApiErrorMessage(err),
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = formToGrammarPayload(form);
      if (isEdit) {
        await updateAdminGrammar(id, payload);
        toast.success("Đã cập nhật ngữ pháp");
      } else {
        await createAdminGrammar(payload);
        toast.success("Đã tạo ngữ pháp");
      }
      navigate("/admin/grammar");
    } catch (err) {
      if (err instanceof Error && err.message === "COMPARE_JSON_INVALID") {
        toast.error("JSON bảng so sánh không hợp lệ");
      } else {
        toast.error("Không lưu được", {
          description: getApiErrorMessage(err),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-stub-main admin-grammar-page">
        <p className="admin-grammar-status">Đang tải…</p>
      </div>
    );
  }

  return (
    <div className="admin-stub-main admin-grammar-page admin-grammar-editor">
      <Link to="/admin/grammar" className="admin-grammar-back">
        ← Danh sách ngữ pháp
      </Link>
      <div className="admin-grammar-editor-head">
        <h1 className="admin-grammar-title">
          {isEdit ? "Sửa ngữ pháp" : "Thêm ngữ pháp"}
        </h1>
        <div className="admin-grammar-editor-actions">
          <button
            type="button"
            className="admin-grammar-ai-btn admin-grammar-ai-btn--secondary"
            onClick={() => setImportOpen(true)}
          >
            Import JSON/CSV
          </button>
          <button
            type="button"
            className="admin-grammar-ai-btn"
            disabled={generating || saving || promptsLoading}
            onClick={() => void handleGenerateAI()}
          >
            {generating ? "Đang generate…" : "Generate AI"}
          </button>
        </div>
      </div>

      <form className="admin-grammar-form" onSubmit={handleSubmit}>
        <section className="admin-grammar-form-section">
          <h2>Thông tin cơ bản</h2>
          <div className="admin-grammar-grid">
            <label>
              Slug
              <input
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                placeholder="masu-to-te-form"
                required
                disabled={isEdit}
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <label className="admin-grammar-grid-span">
              Pattern
              <input
                value={form.pattern}
                onChange={(e) => setField("pattern", e.target.value)}
                required
                lang="ja"
                placeholder="vd: 〜ている / 〜によると"
              />
            </label>
            <label className="admin-grammar-grid-span">
              Mẫu prompt
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                disabled={generating || promptsLoading}
              >
                {promptOptions.length === 0 ? (
                  <option value={selectedTemplate}>
                    {promptsLoading ? "Đang tải…" : selectedTemplate}
                  </option>
                ) : (
                  promptOptions.map((p) => (
                    <option key={p._id} value={p.templateKey}>
                      {p.name} ({p.templateKey})
                    </option>
                  ))
                )}
              </select>
            </label>
            <label>
              JLPT
              <select
                value={form.jlpt}
                onChange={(e) => setField("jlpt", e.target.value)}
              >
                {GRAMMAR_JLPT_LEVELS.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Thứ tự
              <input
                type="number"
                min={0}
                value={form.displayOrder}
                onChange={(e) =>
                  setField("displayOrder", Number(e.target.value))
                }
              />
            </label>
          </div>
          <p className="admin-grammar-tags-hint">
            Generate AI: nhập Pattern, chọn mẫu prompt ở trên rồi bấm{" "}
            <strong>Generate AI</strong> — nội dung tự điền vào form (quản lý
            prompt tại{" "}
            <Link to="/admin/prompts">Prompt AI</Link>).
          </p>
          <div className="admin-grammar-field admin-grammar-publish-row">
            <span className="admin-grammar-label">Xuất bản</span>
            <div className="admin-grammar-switch-wrap">
              <button
                type="button"
                className={`admin-grammar-switch${form.isPublished ? " admin-grammar-switch--on" : ""}`}
                role="switch"
                aria-checked={form.isPublished}
                onClick={() => setField("isPublished", !form.isPublished)}
              >
                <span className="admin-grammar-switch-thumb" aria-hidden />
              </button>
              <span className="admin-grammar-switch-caption">
                {form.isPublished
                  ? "Công khai — học viên thấy trên app"
                  : "Nháp — chỉ admin"}
              </span>
            </div>
          </div>
          <div className="admin-grammar-tags-block">
            <div className="admin-grammar-tags-head">
              <span className="admin-grammar-label">Tags</span>
              <span className="admin-grammar-tags-count">
                {form.tagIds.length} / {GRAMMAR_TAG_IDS.length}
              </span>
            </div>
            <p className="admin-grammar-tags-hint">
              Phân loại để lọc danh sách — chọn 1–3 tag phù hợp. AI có thể gợi ý
              khi generate.
            </p>
            <div
              className="admin-grammar-tags-pick"
              role="group"
              aria-label="Tags"
            >
              {GRAMMAR_TAG_IDS.map((tid) => {
                const on = form.tagIds.includes(tid);
                return (
                  <button
                    key={tid}
                    type="button"
                    className={`admin-grammar-tag-chip${on ? " admin-grammar-tag-chip--on" : ""}`}
                    aria-pressed={on}
                    onClick={() => toggleTag(tid)}
                  >
                    <span className="admin-grammar-tag-chip__id">{tid}</span>
                    <span className="admin-grammar-tag-chip__label">
                      {GRAMMAR_TAG_ADMIN_LABELS[tid] ?? tid}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="admin-grammar-form-section">
          <h2>Teaser & ribbon</h2>
          <GrammarLocFields
            label="Teaser"
            value={form.teaser}
            onChange={(v) => setField("teaser", v)}
          />
          <GrammarLocFields
            label="Topic ribbon"
            value={form.topicRibbon}
            onChange={(v) => setField("topicRibbon", v)}
            rows={2}
          />
        </section>

        <section className="admin-grammar-form-section">
          <h2>Nội dung chính</h2>
          <GrammarLocFields
            label="Kết nối"
            value={form.connection}
            onChange={(v) => setField("connection", v)}
          />
          <GrammarLocFields
            label="Ý nghĩa"
            value={form.meaning}
            onChange={(v) => setField("meaning", v)}
          />
          <GrammarLocFields
            label="Cách dùng"
            value={form.usage}
            onChange={(v) => setField("usage", v)}
          />
          <GrammarLocFields
            label="Ghi chú cách dùng"
            value={form.usageNote}
            onChange={(v) => setField("usageNote", v)}
          />
          <GrammarLocFields
            label="Point bubble"
            value={form.pointBubble}
            onChange={(v) => setField("pointBubble", v)}
          />
          <GrammarLocFields
            label="Memo"
            value={form.memo}
            onChange={(v) => setField("memo", v)}
          />
        </section>

        <section className="admin-grammar-form-section">
          <h2>Ví dụ</h2>
          {form.examples.map((ex, idx) => (
            <div key={`ex-${idx}`} className="admin-grammar-repeat">
              <GrammarLocFields
                label={`Ví dụ ${idx + 1}`}
                value={ex}
                onChange={(v) => updateExample(idx, v)}
                rows={2}
              />
              {form.examples.length > 1 ? (
                <button
                  type="button"
                  className="admin-grammar-btn admin-grammar-btn--ghost"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      examples: prev.examples.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  Xóa ví dụ
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="admin-grammar-btn admin-grammar-btn--ghost"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                examples: [...prev.examples, { ja: "", vi: "" }],
              }))
            }
          >
            + Thêm ví dụ
          </button>
        </section>

        <section className="admin-grammar-form-section">
          <h2>NG</h2>
          <label>
            NG (JA) — mỗi dòng một mục
            <textarea
              rows={4}
              value={form.ngJaText}
              onChange={(e) => setField("ngJaText", e.target.value)}
              lang="ja"
            />
          </label>
          <label>
            NG (VI)
            <textarea
              rows={4}
              value={form.ngViText}
              onChange={(e) => setField("ngViText", e.target.value)}
            />
          </label>
          <GrammarLocFields
            label="Ghi chú NG"
            value={form.ngNote}
            onChange={(v) => setField("ngNote", v)}
          />
        </section>

        <section className="admin-grammar-form-section">
          <h2>Bảng so sánh (JSON)</h2>
          <textarea
            className="admin-grammar-json"
            rows={10}
            value={form.compareJson}
            onChange={(e) => setField("compareJson", e.target.value)}
          />
        </section>

        <section className="admin-grammar-form-section">
          <h2>Luyện tập</h2>
          {form.practiceItems.map((it, idx) => (
            <div key={`pr-${idx}`} className="admin-grammar-repeat">
              <GrammarLocFields
                label={`Bài ${idx + 1}`}
                value={it}
                onChange={(v) => updatePractice(idx, v)}
                rows={2}
              />
            </div>
          ))}
          <button
            type="button"
            className="admin-grammar-btn admin-grammar-btn--ghost"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                practiceItems: [...prev.practiceItems, { ja: "", vi: "" }],
              }))
            }
          >
            + Thêm dòng luyện tập
          </button>
        </section>

        <div className="admin-grammar-form-actions">
          <Link
            to="/admin/grammar"
            className="admin-grammar-btn admin-grammar-btn--ghost"
          >
            Hủy
          </Link>
          <button
            type="submit"
            className="admin-grammar-btn admin-grammar-btn--primary"
            disabled={saving}
          >
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </form>

      <GrammarImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        isEdit={isEdit}
        onApply={(imported) =>
          setForm((prev) => ({
            ...imported,
            slug: isEdit ? prev.slug : imported.slug,
          }))
        }
      />
    </div>
  );
}
