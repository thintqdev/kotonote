import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import {
  KANJI_JLPT_OPTIONS,
  MAX_KANJI_PER_DECK,
} from "../../constants/kanjiFieldMeta.js";
import DeckAIGenerateModal from "../../components/admin/DeckAIGenerateModal.jsx";
import { KANJI_AI_GENERATE } from "../../constants/deckAiGenerateConfig.js";
import {
  applyKanjiDeckMeta,
  mergeKanjiAIIntoRows,
} from "../../utils/deckAiMerge.js";
import {
  createKanji,
  createKanjiDeck,
  deleteKanji,
  getDeckWithKanji,
  importKanjiFromJson,
  updateKanji,
  updateKanjiDeck,
} from "../../services/adminKanjiService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import "./VocabularyDeckEditorPage.css";

const IMPORT_JSON_EXAMPLE = `[
  {
    "char": "学",
    "onYomi": "ガク",
    "kunYomi": "まな・ぶ",
    "hanViet": "học",
    "meaningVi": "học tập",
    "vocabJa": "学校",
    "exampleJa": "学校に行きます。",
    "exampleVi": "Tôi đi học."
  }
]`;

/**
 * @param {unknown} raw
 * @returns {object | null}
 */
function normalizeKanjiImportItem(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const char = String(o.char ?? "").trim();
  const onYomi = String(o.onYomi ?? "").trim();
  const hanViet = String(o.hanViet ?? "").trim();
  const meaningVi = String(o.meaningVi ?? o.meaning ?? "").trim();
  const vocabJa = String(o.vocabJa ?? "").trim();
  const exampleJa = String(o.exampleJa ?? o.example ?? "").trim();
  const exampleVi = String(o.exampleVi ?? o.exampleMeaning ?? "").trim();
  if (!char || !onYomi || !hanViet || !meaningVi || !vocabJa || !exampleJa || !exampleVi) {
    return null;
  }
  const kunRaw = String(o.kunYomi ?? "").trim();
  const kunYomi = kunRaw || "—";
  const displayOrder = Number(o.displayOrder);
  return {
    char,
    onYomi,
    kunYomi,
    hanViet,
    meaningVi,
    vocabJa,
    exampleJa,
    exampleVi,
    displayOrder: Number.isFinite(displayOrder) && displayOrder >= 0 ? displayOrder : 0,
  };
}

/**
 * @param {string} text
 * @returns {object[]}
 */
function parseKanjiImportJson(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Nội dung trống.");
  }
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("Không phải JSON hợp lệ.");
  }
  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray(parsed.kanjiList)
      ? parsed.kanjiList
      : null;
  if (!list) {
    throw new Error(
      'Cần mảng trực tiếp [...] hoặc object { "kanjiList": [...] }.',
    );
  }
  const normalized = list
    .map((item) => normalizeKanjiImportItem(item))
    .filter(Boolean);
  if (normalized.length === 0) {
    throw new Error(
      "Không có mục nào hợp lệ. Mỗi mục cần char, onYomi, hanViet, meaningVi, vocabJa, exampleJa, exampleVi (kunYomi tùy chọn).",
    );
  }
  return normalized;
}

let clientRowSeq = 0;
function nextClientRowId() {
  clientRowSeq += 1;
  return `krow-${clientRowSeq}`;
}

function emptyRow() {
  return {
    clientId: nextClientRowId(),
    serverId: null,
    char: "",
    onYomi: "",
    kunYomi: "",
    hanViet: "",
    meaningVi: "",
    vocabJa: "",
    exampleJa: "",
    exampleVi: "",
  };
}

function IconLeafSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 18c6-1.5 10-6 12-12-6 1.5-10 6-12 12z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7h12M9 7V5h6v2M8 7l1 14h6l1-14M11 11v6M13 11v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function KanjiDeckEditorPage() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const baseId = useId();

  const isCreate = deckId === "new";
  const isView = searchParams.get("mode") === "view";

  const { pageTitle, breadcrumbLast, subtitle, primaryActionLabel } =
    useMemo(() => {
      if (isView) {
        return {
          pageTitle: "Xem deck kanji",
          breadcrumbLast: "Chi tiết",
          subtitle: "Chỉ xem, không chỉnh sửa.",
          primaryActionLabel: "",
        };
      }
      if (isCreate) {
        return {
          pageTitle: "Tạo deck kanji",
          breadcrumbLast: "Tạo mới",
          subtitle: "Điền thông tin deck và danh sách chữ kanji.",
          primaryActionLabel: "Tạo deck",
        };
      }
      return {
        pageTitle: "Sửa deck kanji",
        breadcrumbLast: "Chỉnh sửa",
        subtitle: "Cập nhật deck và các chữ trong deck.",
        primaryActionLabel: "Lưu thay đổi",
      };
    }, [isCreate, isView]);

  const [loading, setLoading] = useState(!isCreate);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [titleVi, setTitleVi] = useState("");
  const [titleJa, setTitleJa] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionJa, setDescriptionJa] = useState("");
  const [jlpt, setJlpt] = useState("N5");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [rows, setRows] = useState(() => [emptyRow()]);
  const initialKanjiIdsRef = useRef(new Set());

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importBusy, setImportBusy] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  const loadDeck = useCallback(
    async (opts) => {
      const signal = opts?.signal;
      if (isCreate || !deckId) return;
      setLoading(true);
      setLoadError("");
      try {
        const data = await getDeckWithKanji(deckId, { signal });
        const d = data.deck;
        setTitleVi(d.titleVi ?? "");
        setTitleJa(d.titleJa ?? "");
        setDescriptionVi(d.descriptionVi ?? "");
        setDescriptionJa(d.descriptionJa ?? "");
        setJlpt(d.jlpt ?? "N5");
        setDisplayOrder(Number(d.displayOrder) || 0);
        setIsActive(d.isActive !== false);
        const list = data.kanji ?? [];
        initialKanjiIdsRef.current = new Set(
          list.map((k) => String(k._id)).filter(Boolean),
        );
        setRows(
          list.length
            ? list.map((k) => ({
                clientId: String(k._id),
                serverId: String(k._id),
                char: k.char ?? "",
                onYomi: k.onYomi ?? "",
                kunYomi: k.kunYomi === "—" ? "" : (k.kunYomi ?? ""),
                hanViet: k.hanViet ?? "",
                meaningVi: k.meaningVi ?? "",
                vocabJa: k.vocabJa ?? "",
                exampleJa: k.exampleJa ?? "",
                exampleVi: k.exampleVi ?? "",
              }))
            : [emptyRow()],
        );
      } catch (e) {
        if (signal?.aborted) return;
        setLoadError(getAxiosErrorMessage(e));
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [deckId, isCreate],
  );

  useEffect(() => {
    if (isCreate) return undefined;
    const ac = new AbortController();
    void loadDeck({ signal: ac.signal });
    return () => ac.abort();
  }, [isCreate, deckId, loadDeck]);

  useEffect(() => {
    if (!importModalOpen) {
      return undefined;
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        setImportModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [importModalOpen]);

  const submitImportJson = async () => {
    if (isCreate || !deckId) {
      toast.error("Chưa thể nhập", {
        description:
          "Hãy bấm «Tạo deck» hoặc «Lưu thay đổi» trước, rồi quay lại trang này.",
      });
      return;
    }
    setImportBusy(true);
    try {
      const list = parseKanjiImportJson(importJsonText);
      const result = await importKanjiFromJson(deckId, list);
      const created = result?.created ?? list.length;
      toast.success("Đã nhập xong", {
        description: `Thêm ${created} chữ vào deck.`,
      });
      setImportModalOpen(false);
      setImportJsonText("");
      await loadDeck();
    } catch (err) {
      toast.error("Nhập thất bại", {
        description: getAxiosErrorMessage(err),
      });
    } finally {
      setImportBusy(false);
    }
  };

  const updateRow = (clientId, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.clientId === clientId ? { ...r, [field]: value } : r)),
    );
  };

  const removeRow = (clientId) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.clientId !== clientId);
      return next.length ? next : [emptyRow()];
    });
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
  };

  const buildDeckPayload = () => ({
    titleVi: titleVi.trim(),
    titleJa: titleJa.trim(),
    descriptionVi: descriptionVi.trim(),
    descriptionJa: descriptionJa.trim(),
    jlpt,
    displayOrder: Number(displayOrder) || 0,
    isActive,
  });

  const rowIsFilled = (r) =>
    r.char.trim() ||
    r.onYomi.trim() ||
    r.kunYomi.trim() ||
    r.hanViet.trim() ||
    r.meaningVi.trim() ||
    r.vocabJa.trim() ||
    r.exampleJa.trim() ||
    r.exampleVi.trim();

  const rowIsValid = (r) =>
    r.char.trim() &&
    r.onYomi.trim() &&
    r.hanViet.trim() &&
    r.meaningVi.trim() &&
    r.vocabJa.trim() &&
    r.exampleJa.trim() &&
    r.exampleVi.trim();

  const filledKanjiCount = useMemo(() => rows.filter(rowIsValid).length, [rows]);
  const slotsLeft = useMemo(
    () => Math.max(0, MAX_KANJI_PER_DECK - filledKanjiCount),
    [filledKanjiCount],
  );

  const handleDeckAIApply = ({ items, deck }) => {
    const meta = applyKanjiDeckMeta(
      { titleVi, titleJa, descriptionVi, descriptionJa },
      deck,
    );
    setTitleVi(meta.titleVi);
    setTitleJa(meta.titleJa);
    setDescriptionVi(meta.descriptionVi);
    setDescriptionJa(meta.descriptionJa);
    setRows((prev) => mergeKanjiAIIntoRows(prev, items, MAX_KANJI_PER_DECK));
  };

  const openGenerateModal = () => {
    if (isView || saving) return;
    if (slotsLeft <= 0) {
      toast.error(`Deck đã đủ ${MAX_KANJI_PER_DECK} chữ`);
      return;
    }
    setGenerateOpen(true);
  };

  const syncKanjiForDeck = async (id) => {
    const initial = initialKanjiIdsRef.current;
    const currentServer = new Set(
      rows.filter((r) => r.serverId).map((r) => r.serverId),
    );
    for (const kid of initial) {
      if (!currentServer.has(kid)) {
        await deleteKanji(kid);
      }
    }

    let order = 0;
    for (const r of rows) {
      if (!rowIsFilled(r)) continue;
      if (!rowIsValid(r)) {
        throw new Error(
          "Mỗi dòng có dữ liệu cần đủ: chữ kanji, on'yomi, Hán Việt, nghĩa, từ gắn, ví dụ JP và dịch ví dụ.",
        );
      }
      order += 1;
      const kunYomi = r.kunYomi.trim() || "—";
      const base = {
        char: r.char.trim(),
        onYomi: r.onYomi.trim(),
        kunYomi,
        hanViet: r.hanViet.trim(),
        meaningVi: r.meaningVi.trim(),
        vocabJa: r.vocabJa.trim(),
        exampleJa: r.exampleJa.trim(),
        exampleVi: r.exampleVi.trim(),
        displayOrder: order,
      };
      if (r.serverId) {
        await updateKanji(r.serverId, { deckId: id, ...base });
      } else {
        await createKanji({ deckId: id, ...base });
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;

    if (!titleVi.trim()) {
      toast.error("Thiếu thông tin", {
        description: "Vui lòng nhập tiêu đề deck (tiếng Việt).",
      });
      return;
    }
    if (!titleJa.trim()) {
      toast.error("Thiếu thông tin", {
        description: "Vui lòng nhập tiêu đề deck (tiếng Nhật).",
      });
      return;
    }

    const validRows = rows.filter((r) => rowIsValid(r));
    if (validRows.length > MAX_KANJI_PER_DECK) {
      toast.error("Quá giới hạn", {
        description: `Mỗi deck tối đa ${MAX_KANJI_PER_DECK} chữ kanji.`,
      });
      return;
    }

    setSaving(true);
    try {
      const deckPayload = buildDeckPayload();
      if (isCreate) {
        const { deck } = await createKanjiDeck(deckPayload);
        const id = deck?._id;
        if (!id) throw new Error("Không nhận được ID deck từ server.");
        await syncKanjiForDeck(String(id));
        toast.success("Đã tạo deck", {
          description: "Deck và kanji đã lưu.",
        });
        navigate("/admin/kanji", { replace: true });
      } else {
        await updateKanjiDeck(deckId, deckPayload);
        await syncKanjiForDeck(deckId);
        toast.success("Đã lưu", {
          description: "Deck và kanji đã cập nhật.",
        });
        await loadDeck();
      }
    } catch (err) {
      toast.error("Không lưu được", {
        description: getAxiosErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  const titleViCount = titleVi.length;
  const descViCount = descriptionVi.length;

  if (!isCreate && loading) {
    return (
      <div className="admin-stub-main admin-stub-main--vdeck">
        <div className="vdeck-page">
          <p className="vdeck-load-msg">Đang tải deck…</p>
        </div>
      </div>
    );
  }

  if (!isCreate && loadError) {
    return (
      <div className="admin-stub-main admin-stub-main--vdeck">
        <div className="vdeck-page">
          <p className="vdeck-load-msg vdeck-load-msg--error" role="alert">
            {loadError}
          </p>
          <button
            type="button"
            className="vdeck-btn vdeck-btn--muted"
            onClick={() => navigate("/admin/kanji")}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-stub-main admin-stub-main--vdeck">
      <div className="vdeck-page">
      <div className="vdeck-topbar vdeck-topbar--simple">
        <nav className="vdeck-breadcrumb" aria-label="Breadcrumb">
          <Link to="/admin/kanji">Kanji</Link>
          <span className="vdeck-breadcrumb-sep">›</span>
          <span>{breadcrumbLast}</span>
        </nav>
      </div>

      <form onSubmit={onSubmit}>
        <header className="vdeck-head">
          <div className="vdeck-head-text">
            <div>
              <h1 className="vdeck-title">{pageTitle}</h1>
              <p className="vdeck-subtitle">{subtitle}</p>
              {!isCreate ? (
                <p className="vdeck-subtitle vdeck-subtitle--id">
                  Mã deck: <code>{deckId}</code>
                </p>
              ) : null}
            </div>
          </div>
          <div className="vdeck-head-actions">
            {isView ? (
              <Link
                className="vdeck-btn vdeck-btn--primary"
                to={`/admin/kanji/decks/${encodeURIComponent(deckId)}`}
              >
                Chỉnh sửa
              </Link>
            ) : null}
          </div>
        </header>

        <div className="vdeck-form-body">
          <div className="vdeck-columns">
            <div className="vdeck-col vdeck-col--meta">
              <fieldset
                className="vdeck-fieldset-plain"
                disabled={isView || saving}
              >
                <section
                  className="vdeck-card"
                  aria-labelledby={`${baseId}-basic`}
                >
                  <h2 id={`${baseId}-basic`} className="vdeck-card-title">
                    Thông tin deck
                  </h2>
                  <div className="vdeck-grid-2">
                    <div className="vdeck-field vdeck-field--full">
                      <label className="vdeck-label" htmlFor={`${baseId}-titleVi`}>
                        Tiêu đề (VI) <span className="vdeck-req">*</span>
                      </label>
                      <input
                        id={`${baseId}-titleVi`}
                        className="vdeck-input"
                        maxLength={200}
                        value={titleVi}
                        onChange={(e) => setTitleVi(e.target.value)}
                        placeholder="VD: Kanji N5 — Bài 1"
                      />
                      <span className="vdeck-counter">{titleViCount}/200</span>
                    </div>
                    <div className="vdeck-field vdeck-field--full">
                      <label className="vdeck-label" htmlFor={`${baseId}-titleJa`}>
                        Tiêu đề (JP) <span className="vdeck-req">*</span>
                      </label>
                      <input
                        id={`${baseId}-titleJa`}
                        className="vdeck-input"
                        lang="ja"
                        value={titleJa}
                        onChange={(e) => setTitleJa(e.target.value)}
                        placeholder="日本語タイトル"
                      />
                    </div>
                    <div className="vdeck-field vdeck-field--full">
                      <label className="vdeck-label" htmlFor={`${baseId}-descVi`}>
                        Mô tả (VI)
                      </label>
                      <textarea
                        id={`${baseId}-descVi`}
                        className="vdeck-textarea"
                        maxLength={2000}
                        value={descriptionVi}
                        onChange={(e) => setDescriptionVi(e.target.value)}
                        placeholder="Tùy chọn"
                      />
                      <span className="vdeck-counter">{descViCount}/2000</span>
                    </div>
                    <div className="vdeck-field vdeck-field--full">
                      <label className="vdeck-label" htmlFor={`${baseId}-descJa`}>
                        Mô tả (JP)
                      </label>
                      <textarea
                        id={`${baseId}-descJa`}
                        className="vdeck-textarea"
                        lang="ja"
                        maxLength={2000}
                        value={descriptionJa}
                        onChange={(e) => setDescriptionJa(e.target.value)}
                      />
                    </div>
                    <div className="vdeck-field">
                      <label className="vdeck-label" htmlFor={`${baseId}-jlpt`}>
                        JLPT <span className="vdeck-req">*</span>
                      </label>
                      <select
                        id={`${baseId}-jlpt`}
                        className="vdeck-select"
                        value={jlpt}
                        onChange={(e) => setJlpt(e.target.value)}
                      >
                        {KANJI_JLPT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="vdeck-field">
                      <label className="vdeck-label" htmlFor={`${baseId}-order`}>
                        Thứ tự
                      </label>
                      <input
                        id={`${baseId}-order`}
                        type="number"
                        min={0}
                        className="vdeck-input"
                        value={displayOrder}
                        onChange={(e) =>
                          setDisplayOrder(Number(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="vdeck-field vdeck-field--full">
                      <div className="vdeck-switch-row">
                        <span
                          className="vdeck-label vdeck-label--switch"
                          id={`${baseId}-active-label`}
                        >
                          Hiển thị deck
                        </span>
                        <button
                          type="button"
                          id={`${baseId}-active-switch`}
                          role="switch"
                          aria-checked={isActive}
                          aria-labelledby={`${baseId}-active-label`}
                          className={`vdeck-switch${isActive ? " vdeck-switch--on" : ""}`}
                          onClick={() => setIsActive((v) => !v)}
                        >
                          <span className="vdeck-switch-thumb" aria-hidden />
                        </button>
                        <span className="vdeck-switch-caption" aria-live="polite">
                          {isActive ? "Đang bật" : "Đang tắt"}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </fieldset>
            </div>

            <div className="vdeck-col vdeck-col--words">
              <section
                className="vdeck-card"
                aria-labelledby={`${baseId}-kanji`}
              >
                <h2 id={`${baseId}-kanji`} className="vdeck-card-title">
                  Kanji
                </h2>
                <div className="vdeck-table-tools">
                  <button
                    type="button"
                    className="vdeck-btn vdeck-btn--ghost"
                    onClick={openGenerateModal}
                    disabled={isView || saving || slotsLeft <= 0}
                    title={
                      slotsLeft <= 0
                        ? `Deck đã đủ ${MAX_KANJI_PER_DECK} chữ.`
                        : "Generate kanji và tên deck bằng AI"
                    }
                  >
                    Generate AI
                  </button>
                  <button
                    type="button"
                    className="vdeck-btn vdeck-btn--ghost"
                    onClick={() => setImportModalOpen(true)}
                    disabled={isView || saving}
                    title={
                      isView
                        ? "Chế độ xem — chuyển sang chỉnh sửa để nhập JSON."
                        : isCreate
                          ? "Lưu deck trước, rồi quay lại để nhập JSON."
                          : "Nhập nhiều chữ từ file JSON"
                    }
                  >
                    Nhập JSON
                  </button>
                  <button
                    type="button"
                    className="vdeck-btn vdeck-btn--primary"
                    onClick={addRow}
                    disabled={isView || saving}
                  >
                    + Thêm dòng
                  </button>
                </div>
                <fieldset
                  className="vdeck-fieldset-plain"
                  disabled={isView || saving}
                >
                  <div className="vdeck-table-wrap vdeck-table-wrap--wide">
                    <table className="vdeck-table vdeck-table--dense">
                      <thead>
                        <tr>
                          <th>Chữ</th>
                          <th>On</th>
                          <th>Kun</th>
                          <th>Hán Việt</th>
                          <th>Nghĩa</th>
                          <th>Từ (JP)</th>
                          <th>Ví dụ</th>
                          <th>Dịch VD</th>
                          <th style={{ width: 56 }} aria-label="Xóa" />
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.clientId}>
                            <td>
                              <input
                                value={r.char}
                                onChange={(e) =>
                                  updateRow(r.clientId, "char", e.target.value)
                                }
                                placeholder="字"
                                lang="ja"
                              />
                            </td>
                            <td>
                              <input
                                value={r.onYomi}
                                onChange={(e) =>
                                  updateRow(r.clientId, "onYomi", e.target.value)
                                }
                                placeholder="オン"
                                lang="ja"
                              />
                            </td>
                            <td>
                              <input
                                value={r.kunYomi}
                                onChange={(e) =>
                                  updateRow(r.clientId, "kunYomi", e.target.value)
                                }
                                placeholder="くん（để trống → —）"
                                lang="ja"
                              />
                            </td>
                            <td>
                              <input
                                value={r.hanViet}
                                onChange={(e) =>
                                  updateRow(r.clientId, "hanViet", e.target.value)
                                }
                                placeholder="Hán Việt"
                              />
                            </td>
                            <td>
                              <input
                                value={r.meaningVi}
                                onChange={(e) =>
                                  updateRow(
                                    r.clientId,
                                    "meaningVi",
                                    e.target.value,
                                  )
                                }
                                placeholder="Nghĩa TV"
                              />
                            </td>
                            <td>
                              <input
                                value={r.vocabJa}
                                onChange={(e) =>
                                  updateRow(r.clientId, "vocabJa", e.target.value)
                                }
                                placeholder="語彙"
                                lang="ja"
                              />
                            </td>
                            <td>
                              <input
                                value={r.exampleJa}
                                onChange={(e) =>
                                  updateRow(
                                    r.clientId,
                                    "exampleJa",
                                    e.target.value,
                                  )
                                }
                                placeholder="例文"
                                lang="ja"
                              />
                            </td>
                            <td>
                              <input
                                value={r.exampleVi}
                                onChange={(e) =>
                                  updateRow(
                                    r.clientId,
                                    "exampleVi",
                                    e.target.value,
                                  )
                                }
                                placeholder="Dịch ví dụ"
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="vdeck-row-icon vdeck-row-icon--danger"
                                title="Xóa dòng"
                                onClick={() => removeRow(r.clientId)}
                              >
                                <IconTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="vdeck-table-foot">
                    {rows.length} dòng · tối đa {MAX_KANJI_PER_DECK} chữ/deck
                  </p>
                </fieldset>
              </section>
            </div>
          </div>
        </div>

        <footer className="vdeck-footer-actions">
          <button
            type="button"
            className="vdeck-btn vdeck-btn--muted"
            onClick={() => navigate("/admin/kanji")}
            disabled={saving}
          >
            {isView ? "Quay lại" : "Hủy"}
          </button>
          {!isView ? (
            <button
              type="submit"
              className="vdeck-btn vdeck-btn--primary"
              disabled={saving}
            >
              <IconLeafSmall />
              {saving ? "Đang lưu…" : primaryActionLabel}
            </button>
          ) : null}
        </footer>
      </form>

      {importModalOpen ? (
        <div
          className="vdeck-modal-backdrop"
          role="presentation"
          onClick={() => !importBusy && setImportModalOpen(false)}
        >
          <div
            className="vdeck-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${baseId}-import-title`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vdeck-modal-header">
              <h2 id={`${baseId}-import-title`} className="vdeck-modal-title">
                Nhập kanji (JSON)
              </h2>
              <button
                type="button"
                className="vdeck-modal-close"
                aria-label="Đóng"
                disabled={importBusy}
                onClick={() => setImportModalOpen(false)}
              >
                ×
              </button>
            </div>
            <p className="vdeck-modal-lead">
              Dán mảng <code className="vdeck-modal-code">[...]</code> hoặc{" "}
              <code className="vdeck-modal-code">{"{ \"kanjiList\": [...] }"}</code>
              . Mỗi mục cần <strong>char</strong>, <strong>onYomi</strong>,{" "}
              <strong>hanViet</strong>, <strong>meaningVi</strong>,{" "}
              <strong>vocabJa</strong>, <strong>exampleJa</strong>,{" "}
              <strong>exampleVi</strong>. Có thể thêm <strong>kunYomi</strong>{" "}
              (mặc định —).
            </p>
            <details className="vdeck-modal-sample">
              <summary>Ví dụ</summary>
              <pre className="vdeck-modal-pre">{IMPORT_JSON_EXAMPLE}</pre>
            </details>
            <label className="vdeck-label" htmlFor={`${baseId}-import-textarea`}>
              Nội dung
            </label>
            <textarea
              id={`${baseId}-import-textarea`}
              className="vdeck-modal-textarea"
              rows={12}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[ { "char": "学", "onYomi": "ガク", ... } ]'
              spellCheck={false}
              disabled={importBusy}
            />
            <div className="vdeck-modal-actions">
              <button
                type="button"
                className="vdeck-btn vdeck-btn--muted"
                disabled={importBusy}
                onClick={() => setImportModalOpen(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="vdeck-btn vdeck-btn--primary"
                disabled={importBusy}
                onClick={() => void submitImportJson()}
              >
                {importBusy ? "Đang nhập…" : "Nhập"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <DeckAIGenerateModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        config={KANJI_AI_GENERATE}
        deckId={isCreate ? undefined : deckId}
        slotsLeft={slotsLeft}
        levelKey={jlpt}
        deckHint={titleVi}
        onApply={handleDeckAIApply}
      />
      </div>
    </div>
  );
}
