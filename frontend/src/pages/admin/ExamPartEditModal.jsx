import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { buildPartImportSample } from "../../constants/examPaperStructure.js";
import {
  EXAM_LISTENING_DEFAULT_QUESTION_JA,
  EXAM_QUESTION_TYPE_OPTIONS,
} from "../../constants/examPaperFieldMeta.js";
import ExamMediaZoomImage from "../../components/exam/ExamMediaZoomImage.jsx";
import ExamPassageMarkupHelp from "../../components/exam/ExamPassageMarkupHelp.jsx";
import ExamMarkupPreview from "../../components/exam/ExamMarkupPreview.jsx";
import ExamPassageText from "../../components/exam/ExamPassageText.jsx";
import ExamStarQuestionPrompt from "../../components/exam/ExamStarQuestionPrompt.jsx";
import {
  countSectionQuestions,
  emptyReadingPassageBlock,
  getReadingPassageBlocks,
  prepareListeningDraftForManual,
  prepareReadingDraftForManual,
  resolveBlockImageUrl,
  sectionHasReadingPassages,
  syncReadingPassagesQuestions,
} from "../../utils/examReadingPassages.js";
import { isStarQuestion } from "../../utils/examStarQuestion.js";
import {
  partNeedsMediaFromMeta,
  partNeedsPassageFromMeta,
} from "../../hooks/useExamStructureMeta.js";
import { uploadExamMedia } from "../../services/adminExamPaperService.js";
import { getApiErrorMessage } from "../../utils/apiErrorMessage.js";
import { resolvePublicMediaUrl } from "../../utils/resolveAvatarUrl.js";
import {
  buildPartExportFromDraft,
  cloneExamSection,
  applyListeningQuestionDefaults,
  emptyExamQuestion,
  findSectionIndex,
  mergeImportTextIntoDraft,
  normalizeSectionForSave,
  parsePartImportJson,
  sectionHasSaveableContent,
  validateExamSectionDraft,
} from "../../utils/examPartEditorHelpers.js";
import "./AdminGrammarPage.css";
import "./AdminListeningPage.css";
import "../../components/exam/ExamPassageText.css";

function getDraftMedia(draft) {
  const audioUrl = String(draft?.audioUrl ?? "").trim();
  const imageUrl = String(draft?.imageUrl ?? "").trim();
  if (audioUrl) return { url: audioUrl, type: "audio" };
  if (imageUrl) return { url: imageUrl, type: "image" };
  return null;
}

function getBlockMedia(block) {
  const audioUrl = String(block?.audioUrl ?? "").trim();
  const imageUrl = resolveBlockImageUrl(block);
  if (audioUrl) return { url: audioUrl, type: "audio" };
  if (imageUrl) return { url: imageUrl, type: "image" };
  return null;
}

function QuestionCard({
  question,
  index,
  sectionType,
  onChange,
  onRemove,
  allowQuestionMedia = false,
}) {
  const [uploadingQuestionMedia, setUploadingQuestionMedia] = useState(false);
  const choices =
    question.choices?.length >= 4
      ? question.choices
      : [...(question.choices ?? []), "", "", "", ""].slice(0, 4);
  const questionMediaUrl = String(
    question.mediaUrl ?? question.imageUrl ?? "",
  ).trim();
  const questionMediaPreview = questionMediaUrl
    ? resolvePublicMediaUrl(questionMediaUrl)
    : null;

  const setChoice = (ci, value) => {
    const next = [...choices];
    next[ci] = value;
    onChange({ ...question, choices: next });
  };

  const handleQuestionMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh minh họa tối đa 2MB");
      e.target.value = "";
      return;
    }
    setUploadingQuestionMedia(true);
    try {
      const { url } = await uploadExamMedia(file);
      onChange({ ...question, mediaUrl: url, imageUrl: "" });
      toast.success("Đã tải ảnh câu hỏi");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploadingQuestionMedia(false);
      e.target.value = "";
    }
  };

  const answerIndex = Math.min(
    3,
    Math.max(0, Number(question.answerIndex) || 0),
  );
  const questionType = question.questionType || "multiple_choice";
  const starQ = questionType === "star_question" || isStarQuestion(question);

  return (
    <article className="exam-q-card">
      <header className="exam-q-card-head">
        <span className="exam-q-badge">Câu {index + 1}</span>
        <div className="exam-q-card-tools">
          <label className="exam-q-num-field">
            <span>Câu hỏi</span>
            <input
              type="number"
              min={1}
              value={question.questionNumber || index + 1}
              onChange={(e) =>
                onChange({
                  ...question,
                  questionNumber: Number(e.target.value) || index + 1,
                })
              }
            />
          </label>
          <button type="button" className="exam-q-remove" onClick={onRemove}>
            Xóa
          </button>
        </div>
      </header>

      <div className="exam-q-body">
        <label className="exam-field">
          <span className="exam-field-label">Loại câu hỏi</span>
          <select
            className="exam-field-input"
            value={questionType}
            onChange={(e) =>
              onChange({ ...question, questionType: e.target.value })
            }
          >
            {EXAM_QUESTION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="exam-field">
          <span className="exam-field-label">Câu hỏi (JA)</span>
          <textarea
            className="exam-field-input exam-field-input--ja"
            rows={2}
            value={question.questionJa ?? ""}
            onChange={(e) =>
              onChange({ ...question, questionJa: e.target.value })
            }
            lang="ja"
            placeholder={
              starQ
                ? "きょうは ____ ____ ★ ____ 。"
                : sectionType === "listening"
                  ? EXAM_LISTENING_DEFAULT_QUESTION_JA
                  : "例：***先生***の読み方は？"
            }
          />
          {starQ ? (
            <ExamStarQuestionPrompt
              text={question.questionJa}
              className="exam-star-q-preview"
            />
          ) : (
            <ExamMarkupPreview text={question.questionJa} lang="ja" compact />
          )}
        </label>

        {allowQuestionMedia ? (
          <div className="exam-field exam-field--full exam-q-media-field">
            <span className="exam-field-label">Ảnh minh họa câu hỏi</span>
            <p className="exam-field-hint">
              Biểu đồ, hình tình huống… (tùy chọn — audio chung ở trên).
            </p>
            <label
              className={`admin-grammar-file-upload exam-media-upload-btn${uploadingQuestionMedia ? " admin-grammar-file-upload--loading" : ""}`}
            >
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploadingQuestionMedia}
                onChange={(e) => void handleQuestionMediaUpload(e)}
              />
              {uploadingQuestionMedia ? (
                <span className="admin-grammar-upload-spinner" aria-hidden />
              ) : null}
              <span>
                {uploadingQuestionMedia
                  ? "Đang tải lên…"
                  : questionMediaPreview
                    ? "✓ Đã có ảnh — chọn để thay"
                    : "Tải ảnh minh họa"}
              </span>
            </label>
            {questionMediaPreview ? (
              <div className="exam-media-preview-wrap">
                <ExamMediaZoomImage
                  src={questionMediaPreview}
                  alt={`Minh họa câu ${index + 1}`}
                  className="exam-editor-q-media-img"
                />
                <button
                  type="button"
                  className="admin-grammar-btn admin-grammar-btn--ghost exam-media-clear"
                  onClick={() =>
                    onChange({ ...question, mediaUrl: "", imageUrl: "" })
                  }
                >
                  Xóa ảnh
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="exam-choices-grid">
          {choices.map((choice, ci) => (
            <label
              key={`c-${ci}`}
              className={`exam-choice${answerIndex === ci ? " exam-choice--correct" : ""}`}
            >
              <input
                type="radio"
                name={`answer-${index}`}
                checked={answerIndex === ci}
                onChange={() => onChange({ ...question, answerIndex: ci })}
              />
              <span className="exam-choice-num">{ci + 1}</span>
              <div className="exam-choice-input-wrap">
                <input
                  className="exam-choice-input"
                  value={choice}
                  onChange={(e) => setChoice(ci, e.target.value)}
                  lang="ja"
                  placeholder={`Lựa chọn ${ci + 1}`}
                />
              </div>
            </label>
          ))}
        </div>

        <label className="exam-field">
          <span className="exam-field-label">Giải thích (VI)</span>
          <textarea
            className="exam-field-input"
            rows={2}
            value={question.explainVi ?? ""}
            onChange={(e) =>
              onChange({ ...question, explainVi: e.target.value })
            }
          />
        </label>
      </div>
    </article>
  );
}

function filterEmptyQuestions(questions) {
  return (questions ?? []).filter((q) => {
    const hasQuestion =
      String(q.questionJa ?? "").trim() || String(q.questionVi ?? "").trim();
    const hasChoices = (q.choices ?? []).some((c) => String(c ?? "").trim());
    const hasQuestionMedia = String(q.mediaUrl ?? q.imageUrl ?? "").trim();
    return hasQuestion || hasChoices || hasQuestionMedia;
  });
}

function ReadingPassageBlockEditor({
  blockIndex,
  block,
  totalBlocks,
  sectionType = "reading",
  blockLabel = "Đoạn",
  showPassage = true,
  showMedia = false,
  mediaAccept = "image/*",
  mediaLabel = "Ảnh tài liệu",
  uploadingMedia = false,
  onPatchPassage,
  onBlockMediaUpload,
  onClearBlockMedia,
  onUpdateQuestion,
  onAddQuestion,
  onRemoveQuestion,
  onRemoveBlock,
}) {
  const passageJa = block.passageJa ?? "";
  const questions = block.questions ?? [];
  const blockMedia = getBlockMedia(block);
  const mediaPreviewSrc = blockMedia?.url
    ? resolvePublicMediaUrl(blockMedia.url)
    : null;
  const blockLabelLower = blockLabel.toLowerCase();

  return (
    <div
      className={`exam-reading-manual-block${blockIndex > 0 ? " exam-reading-block--spaced" : ""}`}
    >
      <header className="exam-reading-manual-head">
        <h4 className="exam-reading-manual-title">
          {blockLabel} {blockIndex + 1}
        </h4>
        {totalBlocks > 1 ? (
          <button
            type="button"
            className="exam-q-remove"
            onClick={onRemoveBlock}
          >
            Xóa {blockLabelLower}
          </button>
        ) : null}
      </header>

      {showMedia ? (
        <div className="exam-field exam-field--full exam-media-upload">
          <span className="exam-field-label">{mediaLabel}</span>
          <label
            className={`admin-grammar-file-upload exam-media-upload-btn${uploadingMedia ? " admin-grammar-file-upload--loading" : ""}`}
          >
            <input
              type="file"
              accept={mediaAccept}
              hidden
              disabled={uploadingMedia}
              onChange={onBlockMediaUpload}
            />
            {uploadingMedia ? (
              <span
                className="admin-grammar-upload-spinner"
                aria-hidden
              />
            ) : null}
            <span>
              {uploadingMedia
                ? "Đang tải lên…"
                : blockMedia
                  ? "✓ Đã có media — chọn để thay"
                  : "Chọn ảnh tài liệu"}
            </span>
          </label>
          {blockMedia && mediaPreviewSrc ? (
            <div className="exam-media-preview-wrap">
              {blockMedia.type === "audio" ? (
                <audio controls preload="metadata" src={mediaPreviewSrc} />
              ) : (
                <ExamMediaZoomImage
                  src={mediaPreviewSrc}
                  alt="Tài liệu minh họa"
                />
              )}
              <button
                type="button"
                className="admin-grammar-btn admin-grammar-btn--ghost exam-media-clear"
                onClick={onClearBlockMedia}
              >
                Xóa media
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {showPassage ? (
        <div className="exam-field exam-field--full">
          <label
            className="exam-field-label"
            htmlFor={`exam-passage-ja-${blockIndex}`}
          >
            Đoạn văn (JA)
          </label>
          <textarea
            id={`exam-passage-ja-${blockIndex}`}
            className="exam-field-input exam-field-input--ja exam-field-textarea"
            rows={6}
            value={passageJa}
            onChange={(e) => onPatchPassage({ passageJa: e.target.value })}
            lang="ja"
            placeholder="例：田中さんは中学校の***先生***です。"
          />
          {passageJa.trim() ? (
            <div className="exam-passage-preview-panel">
              <span className="exam-passage-preview-label">Xem trước</span>
              <div className="exam-passage-preview-modes">
                <div className="exam-passage-preview-col">
                  <p className="exam-passage-preview-col-title">
                    Soạn / đáp án (preview)
                  </p>
                  <ExamPassageText text={passageJa} mode="preview" />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="exam-q-toolbar exam-q-toolbar--nested">
        <h5 className="exam-reading-manual-q-title">
          Câu hỏi {blockLabelLower} {blockIndex + 1}
          {questions.length > 0 ? (
            <span className="exam-part-tab-count">{questions.length}</span>
          ) : null}
        </h5>
        <button
          type="button"
          className="admin-grammar-btn admin-grammar-btn--ghost"
          onClick={onAddQuestion}
        >
          + Thêm câu
        </button>
      </div>

      {questions.length === 0 ? (
        <p className="exam-part-empty exam-part-empty--nested">
          Chưa có câu cho {blockLabelLower} này.
        </p>
      ) : (
        <div className="exam-q-list">
          {questions.map((q, qi) => (
            <QuestionCard
              key={`reading-q-${blockIndex}-${qi}-${q.questionNumber ?? qi}`}
              question={q}
              index={qi}
              sectionType={sectionType}
              onChange={(next) => onUpdateQuestion(qi, next)}
              onRemove={() => onRemoveQuestion(qi)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExamPartImportPreview({ importText, sectionType, partType }) {
  const parsed = useMemo(() => {
    try {
      return parsePartImportJson(importText, sectionType, partType);
    } catch {
      return null;
    }
  }, [importText, sectionType, partType]);

  if (!parsed) return null;

  const blocks =
    (sectionType === "reading" || sectionType === "listening") &&
    sectionHasReadingPassages(parsed)
      ? parsed.passages
      : getReadingPassageBlocks(parsed);
  const totalQuestions = blocks.reduce(
    (n, b) => n + (b.questions?.length ?? 0),
    0,
  );

  return (
    <div className="exam-import-live-preview">
      <p className="exam-passage-preview-label">Xem trước JSON (chưa lưu)</p>
      {(sectionType === "reading" || sectionType === "listening") &&
      blocks.length > 1 ? (
        <p className="exam-passage-preview-col-title">
          {blocks.length}{" "}
          {sectionType === "listening" ? "đoạn nghe" : "đoạn văn"} ·{" "}
          {totalQuestions} câu hỏi
        </p>
      ) : null}
      {blocks.map((block, bi) => {
        const passage = String(block.passageJa ?? "").trim();
        const questions = block.questions ?? [];
        return (
          <div
            key={`import-preview-block-${bi}`}
            className={`exam-reading-block${bi > 0 ? " exam-reading-block--spaced" : ""}`}
          >
            {passage ? (
              <div className="exam-passage-preview-panel">
                <p className="exam-passage-preview-col-title">
                  {blocks.length > 1 ? `Đoạn ${bi + 1}` : "Đoạn văn"}
                </p>
                <ExamPassageText text={passage} mode="preview" />
              </div>
            ) : null}
            {questions.length > 0 ? (
              <div className="exam-import-preview-questions">
                {blocks.length <= 1 ? (
                  <p className="exam-passage-preview-col-title">
                    {questions.length} câu hỏi
                  </p>
                ) : null}
                <ul className="exam-import-preview-q-list">
                  {questions.slice(0, 5).map((q, idx) => (
                    <li key={`import-preview-q-${bi}-${idx}`}>
                      <span className="exam-q-preview-num">
                        Câu {q.questionNumber ?? idx + 1}
                      </span>
                      {isStarQuestion(q) ? (
                        <ExamStarQuestionPrompt
                          text={q.questionJa || q.questionVi || "—"}
                          className="exam-star-q-preview exam-passage-inline"
                        />
                      ) : (
                        <ExamPassageText
                          text={q.questionJa || q.questionVi || "—"}
                          mode="preview"
                          as="span"
                          className="exam-passage-inline"
                          lang={q.questionJa ? "ja" : undefined}
                        />
                      )}
                    </li>
                  ))}
                  {questions.length > 5 ? (
                    <li className="exam-preview-more">
                      +{questions.length - 5} câu nữa
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function ExamPartEditModal({
  isOpen,
  onClose,
  sections,
  sectionType,
  partType,
  partMetaMap = {},
  sectionMetaMap = {},
  onSave,
}) {
  const [draft, setDraft] = useState(null);
  const [activeTab, setActiveTab] = useState("manual");
  const [importText, setImportText] = useState("");
  const [replaceOnImport, setReplaceOnImport] = useState(true);
  const [importErrors, setImportErrors] = useState([]);
  const [saveErrors, setSaveErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingMediaBlockIndex, setUploadingMediaBlockIndex] = useState(null);
  const drawerBodyRef = useRef(null);
  const openedPartKeyRef = useRef(null);

  const sectionIndex = findSectionIndex(sections, sectionType, partType);
  const partMeta = partMetaMap[partType] ?? {};
  const sectionMeta = sectionMetaMap[sectionType] ?? {};

  useEffect(() => {
    if (!isOpen || sectionIndex < 0) {
      setDraft(null);
      setActiveTab("manual");
      setImportErrors([]);
      setSaveErrors([]);
      openedPartKeyRef.current = null;
      return;
    }

    const partKey = `${sectionType}:${partType}`;
    const isNewPartSession = openedPartKeyRef.current !== partKey;

    if (isNewPartSession) {
      openedPartKeyRef.current = partKey;
      let cloned = cloneExamSection(sections[sectionIndex]);
      if (sectionType === "reading") {
        cloned = prepareReadingDraftForManual(cloned);
      } else if (sectionType === "listening") {
        cloned = prepareListeningDraftForManual(cloned);
        cloned = applyListeningQuestionDefaults(cloned);
      }
      setDraft(cloned);
      const exportPayload = sectionHasSaveableContent(cloned)
        ? buildPartExportFromDraft(cloned)
        : buildPartImportSample(sectionType, partType);
      setImportText(JSON.stringify(exportPayload, null, 2));
      setReplaceOnImport(true);
      setImportErrors([]);
      setSaveErrors([]);
      setActiveTab("manual");
    }
  }, [isOpen, sectionIndex, sections, sectionType, partType]);

  const syncImportIntoDraft = (options = {}) => {
    const { silent = false } = options;
    const {
      draft: mergedDraft,
      error,
      applied,
    } = mergeImportTextIntoDraft(
      draft,
      importText,
      sectionType,
      partType,
      replaceOnImport,
    );
    if (error) {
      setImportErrors([error]);
      if (!silent) {
        toast.error("JSON không hợp lệ", { description: error });
      }
      return { ok: false, draft: mergedDraft };
    }
    if (applied) {
      setDraft(
        sectionType === "reading"
          ? prepareReadingDraftForManual(mergedDraft)
          : sectionType === "listening"
            ? applyListeningQuestionDefaults(
                prepareListeningDraftForManual(mergedDraft),
              )
            : mergedDraft,
      );
      setImportErrors([]);
      if (!silent) {
        toast.success("Đã đồng bộ JSON vào form soạn tay");
      }
    }
    return { ok: true, draft: mergedDraft };
  };

  const handleSwitchTab = (tab) => {
    if (tab === "import" && activeTab === "manual" && draft) {
      setImportText(JSON.stringify(buildPartExportFromDraft(draft), null, 2));
      setImportErrors([]);
    }
    if (tab === "manual" && activeTab === "import") {
      const result = syncImportIntoDraft({ silent: !importText.trim() });
      if (!result.ok) return;
      if (sectionType === "reading") {
        setDraft((prev) => prepareReadingDraftForManual(prev));
      } else if (sectionType === "listening") {
        setDraft((prev) =>
          applyListeningQuestionDefaults(prepareListeningDraftForManual(prev)),
        );
      }
    }
    setActiveTab(tab);
  };

  const title = useMemo(
    () => draft?.titleVi || partMeta.titleVi || partType,
    [draft, partMeta.titleVi, partType],
  );

  if (!isOpen || sectionIndex < 0 || !draft) return null;

  const showPassage = partNeedsPassageFromMeta(
    partMetaMap,
    sectionType,
    partType,
  );
  const showMedia = partNeedsMediaFromMeta(partMetaMap, sectionType, partType);
  const isPassageBlockManual = sectionType === "reading";
  const readingBlockLabel =
    showMedia && !showPassage ? "Tài liệu" : "Đoạn";
  const readingMediaAccept = "image/*,audio/*";
  const blockMediaLabel = "Ảnh tài liệu";
  const showPassageInBlock = sectionType === "reading" && showPassage;
  const isListeningManual = sectionType === "listening";
  const questionCount = countSectionQuestions(draft);
  const draftMedia = getDraftMedia(draft);
  const mediaPreviewSrc = draftMedia?.url
    ? resolvePublicMediaUrl(draftMedia.url)
    : null;

  const patchDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isAudio = file.type.startsWith("audio/");
    const maxSize = isAudio ? 8 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(isAudio ? "Audio tối đa 8MB" : "Ảnh tối đa 2MB");
      e.target.value = "";
      return;
    }
    setUploadingMedia(true);
    try {
      const { url, mediaType } = await uploadExamMedia(file);
      if (mediaType === "audio") {
        patchDraft({ audioUrl: url, imageUrl: "" });
      } else {
        patchDraft({ imageUrl: url, audioUrl: "" });
      }
      toast.success("Đã tải media lên");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const clearMedia = () => patchDraft({ audioUrl: "", imageUrl: "" });

  const updateQuestion = (qi, patch) => {
    setDraft((prev) => {
      const questions = [...(prev.questions ?? [])];
      questions[qi] = { ...questions[qi], ...patch };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setDraft((prev) => {
      const questions = [...(prev.questions ?? [])];
      const nextNum =
        questions.reduce(
          (max, q) => Math.max(max, Number(q.questionNumber) || 0),
          0,
        ) + 1;
      questions.push(emptyExamQuestion(nextNum, sectionType));
      return { ...prev, questions };
    });
  };

  const removeQuestion = (qi) => {
    if (!window.confirm(`Xóa câu ${qi + 1}?`)) return;
    setDraft((prev) => ({
      ...prev,
      questions: (prev.questions ?? []).filter((_, i) => i !== qi),
    }));
  };

  const patchReadingPassages = (updater) => {
    setDraft((prev) => {
      const passages = [...(prev.passages ?? [])];
      const nextPassages =
        typeof updater === "function" ? updater(passages) : updater;
      const synced = syncReadingPassagesQuestions(nextPassages);
      return {
        ...prev,
        ...synced,
        passageJa: "",
        passageVi: "",
        audioUrl: "",
        imageUrl: "",
      };
    });
  };

  const updateReadingBlock = (bi, patch) => {
    patchReadingPassages((passages) => {
      const next = [...passages];
      next[bi] = { ...next[bi], ...patch };
      return next;
    });
  };

  const handleBlockMediaUpload = async (bi, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isAudio = file.type.startsWith("audio/");
    const maxSize = isAudio ? 8 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(isAudio ? "Audio tối đa 8MB" : "Ảnh tối đa 2MB");
      e.target.value = "";
      return;
    }
    setUploadingMediaBlockIndex(bi);
    try {
      const { url, mediaType } = await uploadExamMedia(file);
      if (mediaType === "audio") {
        updateReadingBlock(bi, { audioUrl: url, mediaUrl: "", imageUrl: "" });
      } else {
        updateReadingBlock(bi, { mediaUrl: url, imageUrl: "", audioUrl: "" });
      }
      toast.success("Đã tải media lên");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploadingMediaBlockIndex(null);
      e.target.value = "";
    }
  };

  const clearBlockMedia = (bi) => {
    updateReadingBlock(bi, { audioUrl: "", mediaUrl: "", imageUrl: "" });
  };

  const addReadingPassage = () => {
    patchReadingPassages((passages) => [
      ...passages,
      emptyReadingPassageBlock(),
    ]);
  };

  const removeReadingPassage = (bi) => {
    if (!window.confirm(`Xóa đoạn ${bi + 1}?`)) return;
    patchReadingPassages((passages) => passages.filter((_, i) => i !== bi));
  };

  const updateReadingBlockQuestion = (bi, qi, next) => {
    patchReadingPassages((passages) => {
      const nextPassages = [...passages];
      const questions = [...(nextPassages[bi].questions ?? [])];
      questions[qi] = next;
      nextPassages[bi] = { ...nextPassages[bi], questions };
      return nextPassages;
    });
  };

  const addReadingBlockQuestion = (bi) => {
    patchReadingPassages((passages) => {
      const nextPassages = [...passages];
      const questions = [...(nextPassages[bi].questions ?? [])];
      questions.push(emptyExamQuestion(questions.length + 1, sectionType));
      nextPassages[bi] = { ...nextPassages[bi], questions };
      return nextPassages;
    });
  };

  const removeReadingBlockQuestion = (bi, qi) => {
    if (!window.confirm(`Xóa câu ${qi + 1} (đoạn ${bi + 1})?`)) return;
    patchReadingPassages((passages) => {
      const nextPassages = [...passages];
      nextPassages[bi] = {
        ...nextPassages[bi],
        questions: (nextPassages[bi].questions ?? []).filter(
          (_, i) => i !== qi,
        ),
      };
      return nextPassages;
    });
  };

  const applyPartImport = () => {
    const result = syncImportIntoDraft({ silent: false });
    if (result.ok) {
      setSaveErrors([]);
      if (sectionType === "reading") {
        setDraft((prev) => prepareReadingDraftForManual(prev));
      } else if (sectionType === "listening") {
        setDraft((prev) =>
          applyListeningQuestionDefaults(prepareListeningDraftForManual(prev)),
        );
      }
      setActiveTab("manual");
    }
  };

  const handleSave = async () => {
    let currentDraft = draft;
    if (activeTab === "import") {
      const syncResult = syncImportIntoDraft({ silent: true });
      if (!syncResult.ok) {
        return;
      }
      currentDraft = syncResult.draft;
    }
    if (sectionType === "listening") {
      currentDraft = applyListeningQuestionDefaults(
        prepareListeningDraftForManual(currentDraft),
      );
      currentDraft = {
        ...currentDraft,
        questions: filterEmptyQuestions(currentDraft.questions),
      };
    } else if (
      sectionType === "reading" &&
      sectionHasReadingPassages(currentDraft)
    ) {
      const passages = (currentDraft.passages ?? []).map((block) => ({
        ...block,
        questions: filterEmptyQuestions(block.questions),
      }));
      const synced = syncReadingPassagesQuestions(passages);
      currentDraft = { ...currentDraft, ...synced };
    } else {
      currentDraft = {
        ...currentDraft,
        questions: filterEmptyQuestions(currentDraft.questions),
      };
    }
    const draftForSave = currentDraft;

    if (!sectionHasSaveableContent(draftForSave)) {
      toast.error("Không có nội dung để lưu", {
        description:
          "Thêm câu hỏi, đoạn văn hoặc media — hoặc dán JSON hợp lệ ở tab Import.",
      });
      setSaveErrors([
        "Phần này đang trống — chưa có câu hỏi, đoạn văn hoặc media.",
      ]);
      return;
    }

    const validationErrors = validateExamSectionDraft(draftForSave);
    if (validationErrors.length) {
      setSaveErrors(validationErrors);
      setActiveTab("manual");
      toast.error("Chưa lưu được — kiểm tra câu hỏi", {
        description: validationErrors[0],
      });
      drawerBodyRef.current?.scrollTo({
        top: drawerBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
      return;
    }
    setSubmitting(true);
    setSaveErrors([]);
    try {
      const normalized = normalizeSectionForSave(draftForSave);
      const partKey = `${normalized.sectionType}:${normalized.partType}`;
      const nextSections = sections.map((s) =>
        `${s.sectionType}:${s.partType}` === partKey ? normalized : s,
      );
      const saved = await onSave(nextSections);
      if (saved === false) {
        throw new Error("Không lưu được phần đề");
      }
      toast.success("Đã lưu phần đề");
      onClose();
    } catch (err) {
      const apiErrors = err?.apiErrors;
      if (Array.isArray(apiErrors) && apiErrors.length) {
        const messages = apiErrors.map((item) => item.message || String(item));
        setSaveErrors(messages);
        toast.error("Không lưu được", { description: messages[0] });
      } else {
        const msg = getApiErrorMessage(err);
        setSaveErrors([msg]);
        toast.error("Không lưu được", { description: msg });
      }
      drawerBodyRef.current?.scrollTo({
        top: drawerBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="exam-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="exam-part-drawer"
        onClick={(ev) => ev.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="exam-part-drawer-head">
          <div className="exam-part-drawer-title-wrap">
            <div className="exam-part-badges">
              <span
                className={`exam-section-badge exam-section-badge--${sectionType}`}
              >
                {sectionMeta.titleVi}
              </span>
              <span className="exam-part-type-badge">{partType}</span>
            </div>
            <h2 className="exam-part-drawer-title">{title}</h2>
            {partMeta.titleJa ? (
              <p className="exam-part-drawer-sub" lang="ja">
                {partMeta.titleJa}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="exam-modal-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </header>

        <nav className="exam-part-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={`exam-part-tab${activeTab === "manual" ? " exam-part-tab--active" : ""}`}
            onClick={() => handleSwitchTab("manual")}
          >
            Soạn tay
            {questionCount > 0 ? (
              <span className="exam-part-tab-count">{questionCount}</span>
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            className={`exam-part-tab${activeTab === "import" ? " exam-part-tab--active" : ""}`}
            onClick={() => handleSwitchTab("import")}
          >
            Import phần này
          </button>
        </nav>

        <div className="exam-part-drawer-body" ref={drawerBodyRef}>
          {activeTab === "manual" ? (
            <div className="exam-part-manual">
              <section className="exam-part-panel">
                <h3 className="exam-part-panel-title">Nội dung phần</h3>
                {isPassageBlockManual ? (
                  <>
                    {showPassageInBlock ? <ExamPassageMarkupHelp /> : null}
                    <div className="exam-reading-manual-list">
                      {(draft.passages ?? []).map((block, bi) => (
                        <ReadingPassageBlockEditor
                          key={`reading-block-${bi}`}
                          blockIndex={bi}
                          block={block}
                          totalBlocks={(draft.passages ?? []).length}
                          sectionType={sectionType}
                          blockLabel={readingBlockLabel}
                          showPassage={showPassageInBlock}
                          showMedia={showMedia}
                          mediaLabel={blockMediaLabel}
                          mediaAccept={readingMediaAccept}
                          uploadingMedia={uploadingMediaBlockIndex === bi}
                          onPatchPassage={(patch) =>
                            updateReadingBlock(bi, patch)
                          }
                          onBlockMediaUpload={(e) =>
                            void handleBlockMediaUpload(bi, e)
                          }
                          onClearBlockMedia={() => clearBlockMedia(bi)}
                          onUpdateQuestion={(qi, next) =>
                            updateReadingBlockQuestion(bi, qi, next)
                          }
                          onAddQuestion={() => addReadingBlockQuestion(bi)}
                          onRemoveQuestion={(qi) =>
                            removeReadingBlockQuestion(bi, qi)
                          }
                          onRemoveBlock={() => removeReadingPassage(bi)}
                        />
                      ))}
                    </div>
                    <div className="exam-reading-manual-actions">
                      <button
                        type="button"
                        className="admin-grammar-btn admin-grammar-btn--ghost"
                        onClick={addReadingPassage}
                      >
                        + Thêm {readingBlockLabel.toLowerCase()}
                      </button>
                    </div>
                    {questionCount === 0 ? (
                      <p className="exam-part-empty">
                        Chưa có câu — thêm thủ công hoặc chuyển sang tab Import
                        phần này.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="exam-part-panel-grid">
                      {showPassage ? (
                        <div className="exam-field exam-field--full">
                          <label
                            className="exam-field-label"
                            htmlFor="exam-passage-ja"
                          >
                            Đoạn văn (JA)
                          </label>
                          <textarea
                            id="exam-passage-ja"
                            className="exam-field-input exam-field-input--ja exam-field-textarea"
                            rows={6}
                            value={draft.passageJa ?? ""}
                            onChange={(e) =>
                              patchDraft({ passageJa: e.target.value })
                            }
                            lang="ja"
                            placeholder="例：田中さんは中学校の***先生***です。"
                          />
                          <ExamPassageMarkupHelp />
                          {(draft.passageJa ?? "").trim() ? (
                            <div className="exam-passage-preview-panel">
                              <span className="exam-passage-preview-label">
                                Xem trước
                              </span>
                              <div className="exam-passage-preview-modes">
                                <div className="exam-passage-preview-col">
                                  <p className="exam-passage-preview-col-title">
                                    Soạn / đáp án (preview)
                                  </p>
                                  <ExamPassageText
                                    text={draft.passageJa}
                                    mode="preview"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {showMedia && !isListeningManual ? (
                        <div className="exam-field exam-field--full exam-media-upload">
                          <span className="exam-field-label">
                            Media (ảnh hoặc audio)
                          </span>
                          <label
                            className={`admin-grammar-file-upload exam-media-upload-btn${uploadingMedia ? " admin-grammar-file-upload--loading" : ""}`}
                          >
                            <input
                              type="file"
                              accept="image/*,audio/*"
                              hidden
                              disabled={uploadingMedia}
                              onChange={(e) => void handleMediaUpload(e)}
                            />
                            {uploadingMedia ? (
                              <span
                                className="admin-grammar-upload-spinner"
                                aria-hidden
                              />
                            ) : null}
                            <span>
                              {uploadingMedia
                                ? "Đang tải lên…"
                                : draftMedia
                                  ? "✓ Đã có media — chọn để thay"
                                  : "Chọn ảnh hoặc file audio"}
                            </span>
                          </label>
                          {draftMedia ? (
                            <div className="exam-media-preview-wrap">
                              {draftMedia.type === "audio" &&
                              mediaPreviewSrc ? (
                                <audio
                                  controls
                                  preload="metadata"
                                  src={mediaPreviewSrc}
                                />
                              ) : null}
                              {draftMedia.type === "image" &&
                              mediaPreviewSrc ? (
                                <ExamMediaZoomImage
                                  src={mediaPreviewSrc}
                                  alt="Media minh họa"
                                />
                              ) : null}
                              <button
                                type="button"
                                className="admin-grammar-btn admin-grammar-btn--ghost exam-media-clear"
                                onClick={clearMedia}
                              >
                                Xóa media
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="exam-q-toolbar">
                      <h3 className="exam-part-panel-title">Câu hỏi</h3>
                      <button
                        type="button"
                        className="admin-grammar-btn admin-grammar-btn--ghost"
                        onClick={addQuestion}
                      >
                        + Thêm câu
                      </button>
                    </div>

                    {questionCount === 0 ? (
                      <p className="exam-part-empty">
                        Chưa có câu — thêm thủ công hoặc chuyển sang tab Import
                        phần này.
                      </p>
                    ) : (
                      <div className="exam-q-list">
                        {(draft.questions ?? []).map((q, qi) => (
                          <QuestionCard
                            key={`q-${qi}-${q.questionNumber ?? qi}`}
                            question={q}
                            index={qi}
                            sectionType={sectionType}
                            allowQuestionMedia={isListeningManual}
                            onChange={(next) => updateQuestion(qi, next)}
                            onRemove={() => removeQuestion(qi)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          ) : (
            <section className="exam-part-import-panel">
              <p className="exam-part-import-lead">
                Dán JSON cho phần <strong>{partType}</strong>. Khi chuyển sang
                tab <strong>Soạn tay</strong> hoặc bấm <strong>Lưu</strong>,
                JSON sẽ tự đồng bộ vào form.{" "}
                {sectionType === "reading" ? (
                  <>
                    Đọc hiểu: dán mảng{" "}
                    <code>
                      {'[{ "passageJa": "...", "questions": [...] }, ...]'}
                    </code>{" "}
                    hoặc object một đoạn{" "}
                    <code>{'{ "passageJa": "...", "questions": [...] }'}</code>
                  </>
                ) : sectionType === "listening" ? (
                  <>
                    Nghe hiểu:{" "}
                    <code>
                      {'{ "questions": [{ "mediaUrl": "...", "choices": [...] }, ...] }'}
                    </code>
                    — audio toàn khối nghe tải ở tab Nghe hiểu (ngoài part).
                  </>
                ) : (
                  <>
                    Dạng rút gọn:{" "}
                    <code>{'{ "passageJa": "...", "questions": [...] }'}</code>
                  </>
                )}
              </p>
              <ExamPassageMarkupHelp />
              <label className="exam-import-merge">
                <input
                  type="checkbox"
                  checked={replaceOnImport}
                  onChange={(e) => setReplaceOnImport(e.target.checked)}
                />
                <span>
                  Thay thế toàn bộ câu hỏi hiện tại (bỏ chọn = gộp thêm)
                </span>
              </label>
              <textarea
                className="exam-import-code exam-import-code--part"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                spellCheck={false}
              />
              {importErrors.length > 0 ? (
                <ul className="exam-import-errors">
                  {importErrors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              ) : null}
              <ExamPartImportPreview
                importText={importText}
                sectionType={sectionType}
                partType={partType}
              />
              <button
                type="button"
                className="admin-grammar-btn admin-grammar-btn--primary"
                onClick={applyPartImport}
              >
                Áp dụng và xem Soạn tay
              </button>
            </section>
          )}

          {saveErrors.length > 0 ? (
            <ul className="exam-import-errors exam-import-errors--save">
              {saveErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <footer className="exam-part-drawer-foot">
          <button
            type="button"
            className="admin-grammar-btn admin-grammar-btn--muted"
            onClick={onClose}
            disabled={submitting}
          >
            Đóng
          </button>
          <button
            type="button"
            className="admin-grammar-btn admin-grammar-btn--primary"
            onClick={() => void handleSave()}
            disabled={submitting}
          >
            {submitting ? "Đang lưu…" : "Lưu phần này"}
          </button>
        </footer>
      </div>
    </div>
  );
}
