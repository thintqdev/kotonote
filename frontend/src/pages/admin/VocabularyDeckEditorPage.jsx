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
  JLPT_LEVEL_OPTIONS,
  VOCAB_CATEGORY_OPTIONS,
} from "../../constants/vocabularyFieldMeta.js";
import {
  createVocab,
  createVocabularyDeck,
  deleteVocab,
  getDeckWithVocabulary,
  importVocabularyFromJson,
  updateVocab,
  updateVocabularyDeck,
} from "../../services/adminVocabularyService.js";
import DeckAIGenerateModal from "../../components/admin/DeckAIGenerateModal.jsx";
import { VOCABULARY_AI_GENERATE } from "../../constants/deckAiGenerateConfig.js";
import GrammarLocFields from "../../components/admin/GrammarLocFields.jsx";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import "./VocabularyDeckEditorPage.css";

/** Ảnh mẫu — URL công khai, gửi thẳng vào field `thumbnail` backend */
const THUMBNAIL_PRESETS = [
  {
    id: "p1",
    src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=480&h=320&fit=crop&q=75",
  },
  {
    id: "p2",
    src: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=480&h=320&fit=crop&q=75",
  },
  {
    id: "p3",
    src: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=480&h=320&fit=crop&q=75",
  },
  {
    id: "p4",
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=480&h=320&fit=crop&q=75",
  },
  {
    id: "p5",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&h=320&fit=crop&q=75",
  },
];

const MAX_UPLOAD_FILE_BYTES = 1.5 * 1024 * 1024;
const MAX_THUMB_DATA_URL_LENGTH = 560_000;
const MAX_WORDS_PER_DECK = 25;

function vocabRowsFilledCount(rows) {
  return rows.filter((r) => r.word.trim() && r.reading.trim() && r.meaning.trim())
    .length;
}

/**
 * @param {File} file
 * @returns {Promise<string>}
 */
async function imageFileToThumbnailDataUrl(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Chỉ chấp nhận file ảnh.");
  }
  if (file.size > MAX_UPLOAD_FILE_BYTES) {
    throw new Error("Ảnh quá lớn (tối đa khoảng 1,5MB).");
  }
  const bitmap = await createImageBitmap(file);
  const maxEdge = 720;
  let w = bitmap.width;
  let h = bitmap.height;
  if (w > maxEdge || h > maxEdge) {
    if (w >= h) {
      h = Math.round((h * maxEdge) / w);
      w = maxEdge;
    } else {
      w = Math.round((w * maxEdge) / h);
      h = maxEdge;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Không xử lý được ảnh.");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  let quality = 0.88;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_THUMB_DATA_URL_LENGTH && quality > 0.42) {
    quality -= 0.07;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > MAX_THUMB_DATA_URL_LENGTH) {
    throw new Error(
      "Ảnh sau khi nén vẫn quá lớn cho lưu trữ, vui lòng chọn ảnh nhỏ hơn.",
    );
  }
  return dataUrl;
}

const IMPORT_JSON_EXAMPLE = `[
  {
    "word": "学校",
    "reading": "がっこう",
    "meaning": "trường học",
    "meaningJa": "勉強する場所",
    "example": "学校に行きます。",
    "exampleMeaning": "Tôi đi học."
  }
]`;

/**
 * Chuẩn hóa một object từ JSON import sang payload backend (Mongoose).
 * Hỗ trợ alias: meaningVi → meaning, exampleSentence → example.
 * @param {unknown} raw
 * @returns {object | null}
 */
function normalizeImportItem(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const word = String(o.word ?? "").trim();
  const reading = String(o.reading ?? "").trim();
  const meaning = String(o.meaning ?? o.meaningVi ?? "").trim();
  if (!word || !reading || !meaning) {
    return null;
  }
  const meaningJa = String(o.meaningJa ?? "").trim();
  const example = String(o.example ?? o.exampleSentence ?? "").trim();
  const exampleReading = String(o.exampleReading ?? "").trim();
  const exampleMeaning = String(o.exampleMeaning ?? "").trim();
  const partOfSpeech =
    typeof o.partOfSpeech === "string" && o.partOfSpeech.trim()
      ? o.partOfSpeech.trim()
      : "noun";
  const displayOrder = Number(o.displayOrder);
  const payload = {
    word,
    reading,
    meaning,
    meaningJa: meaningJa || undefined,
    example: example || undefined,
    exampleReading: exampleReading || undefined,
    exampleMeaning: exampleMeaning || undefined,
    partOfSpeech,
    displayOrder: Number.isFinite(displayOrder) && displayOrder >= 0 ? displayOrder : 0,
    isActive: o.isActive !== false,
  };
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined),
  );
}

/**
 * @param {string} text
 * @returns {object[]}
 */
function parseVocabularyImportJson(text) {
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
    : parsed && typeof parsed === "object" && Array.isArray(parsed.vocabularyList)
      ? parsed.vocabularyList
      : null;
  if (!list) {
    throw new Error(
      'Cần mảng trực tiếp [...] hoặc object { "vocabularyList": [...] }.',
    );
  }
  const normalized = list
    .map((item) => normalizeImportItem(item))
    .filter(Boolean);
  if (normalized.length === 0) {
    throw new Error(
      "Không có mục nào hợp lệ. Mỗi mục cần word, reading, meaning (hoặc meaningVi).",
    );
  }
  return normalized;
}

let clientRowSeq = 0;
function nextClientRowId() {
  clientRowSeq += 1;
  return `row-${clientRowSeq}`;
}

function emptyRow() {
  return {
    clientId: nextClientRowId(),
    serverId: null,
    word: "",
    reading: "",
    meaning: "",
    meaningJa: "",
    example: "",
    exampleMeaning: "",
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

export default function VocabularyDeckEditorPage() {
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
          pageTitle: "Xem deck từ vựng",
          breadcrumbLast: "Chi tiết",
          subtitle: "Chỉ xem, không chỉnh sửa.",
          primaryActionLabel: "",
        };
      }
      if (isCreate) {
        return {
          pageTitle: "Tạo deck từ vựng",
          breadcrumbLast: "Tạo mới",
          subtitle: "Điền thông tin deck và danh sách từ.",
          primaryActionLabel: "Tạo deck",
        };
      }
      return {
        pageTitle: "Sửa deck từ vựng",
        breadcrumbLast: "Chỉnh sửa",
        subtitle: "Cập nhật deck và các từ trong deck.",
        primaryActionLabel: "Lưu thay đổi",
      };
    }, [isCreate, isView]);

  const [loading, setLoading] = useState(!isCreate);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [titleJa, setTitleJa] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionJa, setDescriptionJa] = useState("");
  const [level, setLevel] = useState("n5");
  const [category, setCategory] = useState("basic");
  const [thumbnail, setThumbnail] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [rows, setRows] = useState(() => [emptyRow()]);
  const initialWordIdsRef = useRef(new Set());
  const thumbFileInputRef = useRef(null);
  const [thumbDragOver, setThumbDragOver] = useState(false);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importBusy, setImportBusy] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  const filledWordCount = useMemo(() => vocabRowsFilledCount(rows), [rows]);
  const slotsLeft = useMemo(
    () => Math.max(0, MAX_WORDS_PER_DECK - filledWordCount),
    [filledWordCount],
  );

  const pickPresetThumbnail = (url) => {
    setThumbnail(url);
  };

  const applyUploadedImage = async (file) => {
    if (!file) return;
    try {
      const dataUrl = await imageFileToThumbnailDataUrl(file);
      setThumbnail(dataUrl);
      toast.success("Đã tải ảnh lên", {
        description: "Ảnh được nén và nhúng dưới dạng JPEG.",
      });
    } catch (err) {
      toast.error("Không dùng được ảnh này", {
        description: err instanceof Error ? err.message : "Thử file khác.",
      });
    }
  };

  const onThumbnailFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    applyUploadedImage(file);
  };

  const onThumbDrop = (e) => {
    e.preventDefault();
    setThumbDragOver(false);
    const file = e.dataTransfer.files?.[0];
    applyUploadedImage(file);
  };

  const loadDeck = useCallback(
    async (opts) => {
      const signal = opts?.signal;
      if (isCreate || !deckId) return;
      setLoading(true);
      setLoadError("");
      try {
        const data = await getDeckWithVocabulary(deckId, { signal });
        const d = data.deck;
        setTitle(d.title ?? "");
        setTitleJa(d.titleJa ?? "");
        setDescription(d.description ?? "");
        setDescriptionJa(d.descriptionJa ?? "");
        setLevel(d.level ?? "n5");
        setCategory(d.category ?? "basic");
        setThumbnail(d.thumbnail ?? "");
        setDisplayOrder(Number(d.displayOrder) || 0);
        setIsActive(d.isActive !== false);
        const list = data.vocabulary ?? [];
        initialWordIdsRef.current = new Set(
          list.map((v) => String(v._id)).filter(Boolean),
        );
        setRows(
          list.length
            ? list.map((v) => ({
                clientId: String(v._id),
                serverId: String(v._id),
                word: v.word ?? "",
                reading: v.reading ?? "",
                meaning: v.meaning ?? "",
                meaningJa: v.meaningJa ?? "",
                example: v.example ?? "",
                exampleMeaning: v.exampleMeaning ?? "",
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
      const list = parseVocabularyImportJson(importJsonText);
      const { created } = await importVocabularyFromJson(deckId, list);
      toast.success("Đã nhập xong", {
        description: `Thêm ${created} từ vào deck.`,
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
    title: title.trim(),
    titleJa: titleJa.trim(),
    description: description.trim(),
    descriptionJa: descriptionJa.trim(),
    level,
    category,
    thumbnail: thumbnail.trim() || null,
    displayOrder: Number(displayOrder) || 0,
    isActive,
  });

  const rowIsFilled = (r) =>
    r.word.trim() || r.reading.trim() || r.meaning.trim();

  const rowIsValid = (r) =>
    r.word.trim() && r.reading.trim() && r.meaning.trim();

  const syncWordsForDeck = async (id) => {
    const initial = initialWordIdsRef.current;
    const currentServer = new Set(
      rows.filter((r) => r.serverId).map((r) => r.serverId),
    );
    for (const wid of initial) {
      if (!currentServer.has(wid)) {
        await deleteVocab(wid);
      }
    }

    let order = 0;
    for (const r of rows) {
      if (!rowIsFilled(r)) continue;
      if (!rowIsValid(r)) {
        throw new Error(
          "Mỗi dòng có dữ liệu cần đủ: từ vựng, đọc hiragana và nghĩa (tiếng Việt).",
        );
      }
      order += 1;
      const base = {
        word: r.word.trim(),
        reading: r.reading.trim(),
        meaning: r.meaning.trim(),
        meaningJa: r.meaningJa.trim() || undefined,
        example: r.example.trim() || undefined,
        exampleMeaning: r.exampleMeaning.trim() || undefined,
        partOfSpeech: "noun",
        displayOrder: order,
        isActive: true,
      };
      if (r.serverId) {
        await updateVocab(r.serverId, base);
      } else {
        await createVocab({ deckId: id, ...base });
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;

    if (!title.trim()) {
      toast.error("Thiếu thông tin", {
        description: "Vui lòng nhập tiêu đề deck.",
      });
      return;
    }

    setSaving(true);
    try {
      const deckPayload = buildDeckPayload();
      if (isCreate) {
        const { deck } = await createVocabularyDeck(deckPayload);
        const id = deck?._id;
        if (!id) throw new Error("Không nhận được ID deck từ server.");
        await syncWordsForDeck(String(id));
        toast.success("Đã tạo deck", {
          description: "Deck và từ vựng đã lưu.",
        });
        navigate("/admin/vocabulary", { replace: true });
      } else {
        await updateVocabularyDeck(deckId, deckPayload);
        await syncWordsForDeck(deckId);
        toast.success("Đã lưu", {
          description: "Deck và từ vựng đã cập nhật.",
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

  const titleCount = title.length;

  if (!isCreate && loading) {
    return (
      <div className="vdeck-page">
        <p className="vdeck-load-msg">Đang tải deck…</p>
      </div>
    );
  }

  if (!isCreate && loadError) {
    return (
      <div className="vdeck-page">
        <p className="vdeck-load-msg vdeck-load-msg--error" role="alert">
          {loadError}
        </p>
        <button
          type="button"
          className="vdeck-btn vdeck-btn--muted"
          onClick={() => navigate("/admin/vocabulary")}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="vdeck-page">
      <div className="vdeck-topbar vdeck-topbar--simple">
        <nav className="vdeck-breadcrumb" aria-label="Breadcrumb">
          <Link to="/admin/vocabulary">Từ vựng</Link>
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
                to={`/admin/vocabulary/decks/${encodeURIComponent(deckId)}`}
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
                    <label className="vdeck-label" htmlFor={`${baseId}-title`}>
                      Tiêu đề <span className="vdeck-req">*</span>
                    </label>
                    <input
                      id={`${baseId}-title`}
                      className="vdeck-input"
                      maxLength={200}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="VD: Từ vựng N5 — Bài 1"
                    />
                    <span className="vdeck-counter">{titleCount}/200</span>
                  </div>
                  <div className="vdeck-field vdeck-field--full">
                    <label
                      className="vdeck-label"
                      htmlFor={`${baseId}-titleJa`}
                    >
                      Tiêu đề (JP)
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
                  <div className="vdeck-field vdeck-field--full vdeck-field--loc">
                    <GrammarLocFields
                      label="Mô tả"
                      rows={3}
                      value={{ ja: descriptionJa, vi: description }}
                      onChange={(loc) => {
                        setDescriptionJa(loc.ja ?? "");
                        setDescription(loc.vi ?? "");
                      }}
                    />
                    <span className="vdeck-counter vdeck-counter--loc">
                      VI {description.length}/2000 · JA {descriptionJa.length}/2000
                    </span>
                  </div>
                  <div className="vdeck-field">
                    <label className="vdeck-label" htmlFor={`${baseId}-level`}>
                      Cấp độ <span className="vdeck-req">*</span>
                    </label>
                    <select
                      id={`${baseId}-level`}
                      className="vdeck-select"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      {JLPT_LEVEL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="vdeck-field">
                    <label className="vdeck-label" htmlFor={`${baseId}-cat`}>
                      Chủ đề
                    </label>
                    <select
                      id={`${baseId}-cat`}
                      className="vdeck-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {VOCAB_CATEGORY_OPTIONS.map((o) => (
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
                    <span className="vdeck-label" id={`${baseId}-thumb-label`}>
                      Ảnh bìa
                    </span>
                    <p className="vdeck-hint">
                      Chọn ảnh có sẵn, tải lên từ máy, hoặc dán URL. Upload được
                      nén thành JPEG (tối đa ~720px cạnh dài).
                    </p>
                    {thumbnail ? (
                      <div className="vdeck-thumb-preview">
                        <img src={thumbnail} alt="" decoding="async" />
                      </div>
                    ) : null}
                    <input
                      ref={thumbFileInputRef}
                      id={`${baseId}-thumb-file`}
                      type="file"
                      className="vdeck-file-input-hidden"
                      accept="image/*"
                      onChange={onThumbnailFileChange}
                      aria-labelledby={`${baseId}-thumb-label`}
                    />
                    <button
                      type="button"
                      className={`vdeck-cover-upload vdeck-cover-upload--btn${thumbDragOver ? " vdeck-cover-upload--drag" : ""}`}
                      onClick={() => thumbFileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setThumbDragOver(true);
                      }}
                      onDragLeave={() => setThumbDragOver(false)}
                      onDrop={onThumbDrop}
                    >
                      Kéo thả ảnh vào đây hoặc bấm để chọn file
                    </button>
                    <p className="vdeck-thumb-presets-title">Ảnh có sẵn</p>
                    <div
                      className="vdeck-cover-scroll"
                      role="listbox"
                      aria-label="Chọn ảnh bìa có sẵn"
                    >
                      {THUMBNAIL_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          role="option"
                          aria-selected={thumbnail === p.src}
                          className={`vdeck-cover-item${thumbnail === p.src ? " vdeck-cover-item--selected" : ""}`}
                          onClick={() => pickPresetThumbnail(p.src)}
                        >
                          <img
                            src={p.src}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        </button>
                      ))}
                    </div>
                    <label
                      className="vdeck-label vdeck-label--spaced"
                      htmlFor={`${baseId}-thumb-url`}
                    >
                      Hoặc dán URL
                    </label>
                    <input
                      id={`${baseId}-thumb-url`}
                      className="vdeck-input"
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      placeholder="https://… hoặc để trống"
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
                aria-labelledby={`${baseId}-words`}
              >
                <h2 id={`${baseId}-words`} className="vdeck-card-title">
                  Từ vựng
                </h2>
                <div className="vdeck-table-tools">
                  <button
                    type="button"
                    className="vdeck-btn vdeck-btn--ghost"
                    onClick={() => setGenerateOpen(true)}
                    disabled={isView || saving || isCreate || slotsLeft <= 0}
                    title={
                      isCreate
                        ? "Lưu deck trước để generate AI."
                        : slotsLeft <= 0
                          ? "Deck đã đủ 25 từ."
                          : "Generate từ vựng bằng Gemini"
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
                          : "Nhập nhiều từ từ file JSON"
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
                        <th>Từ</th>
                        <th>Đọc</th>
                        <th>Nghĩa</th>
                        <th>Nghĩa JP</th>
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
                              value={r.word}
                              onChange={(e) =>
                                updateRow(r.clientId, "word", e.target.value)
                              }
                              placeholder="語"
                              lang="ja"
                            />
                          </td>
                          <td>
                            <input
                              value={r.reading}
                              onChange={(e) =>
                                updateRow(r.clientId, "reading", e.target.value)
                              }
                              placeholder="よみ"
                              lang="ja"
                            />
                          </td>
                          <td>
                            <input
                              value={r.meaning}
                              onChange={(e) =>
                                updateRow(r.clientId, "meaning", e.target.value)
                              }
                              placeholder="Tiếng Việt"
                            />
                          </td>
                          <td>
                            <input
                              value={r.meaningJa}
                              onChange={(e) =>
                                updateRow(
                                  r.clientId,
                                  "meaningJa",
                                  e.target.value,
                                )
                              }
                              placeholder="日本語"
                              lang="ja"
                            />
                          </td>
                          <td>
                            <input
                              value={r.example}
                              onChange={(e) =>
                                updateRow(r.clientId, "example", e.target.value)
                              }
                              placeholder="例文"
                              lang="ja"
                            />
                          </td>
                          <td>
                            <input
                              value={r.exampleMeaning}
                              onChange={(e) =>
                                updateRow(
                                  r.clientId,
                                  "exampleMeaning",
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
                  {rows.length} dòng · tối đa 25 từ/deck
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
            onClick={() => navigate("/admin/vocabulary")}
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
                Nhập từ vựng (JSON)
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
              <code className="vdeck-modal-code">{"{ \"vocabularyList\": [...] }"}</code>
              . Mỗi mục cần <strong>word</strong>, <strong>reading</strong>,{" "}
              <strong>meaning</strong> (hoặc <strong>meaningVi</strong>). Có thể
              thêm: meaningJa, example, exampleMeaning…
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
              placeholder='[ { "word": "…", "reading": "…", "meaning": "…" } ]'
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
        config={VOCABULARY_AI_GENERATE}
        deckId={isCreate ? undefined : deckId}
        slotsLeft={slotsLeft}
        levelKey={level}
        onApplied={loadDeck}
      />
    </div>
  );
}
