import { memo, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "./DailyNoteCard.css";

const STORAGE_KEY = "kotonote-daily-note-quote";

function loadStoredNote() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistNote(text) {
  try {
    localStorage.setItem(STORAGE_KEY, text);
  } catch {
    /* quota / private mode */
  }
}

function hasStoredNote() {
  return loadStoredNote() !== null;
}

const DailyNoteCard = ({
  quote,
  showTitle = true,
  titleId = "daily-note-heading",
  toolbarMountId,
}) => {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(() => {
    const s = loadStoredNote();
    return s !== null ? s : quote;
  });
  const [draft, setDraft] = useState(() => {
    const s = loadStoredNote();
    return s !== null ? s : quote;
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (hasStoredNote()) return;
    if (editing) return;
    setSaved(quote);
    setDraft(quote);
  }, [quote, editing]);

  const startEdit = useCallback(() => {
    setDraft(saved);
    setEditing(true);
  }, [saved]);

  const cancelEdit = useCallback(() => {
    setDraft(saved);
    setEditing(false);
  }, [saved]);

  const saveEdit = useCallback(() => {
    const next = draft.trim() || quote;
    setSaved(next);
    persistNote(next);
    setDraft(next);
    setEditing(false);
  }, [draft, quote]);

  const mountEl =
    typeof document !== "undefined" && toolbarMountId
      ? document.getElementById(toolbarMountId)
      : null;
  const portalToolbar = Boolean(toolbarMountId && mountEl);

  const toolbarClassName = [
    "daily-note-toolbar",
    !showTitle ? "daily-note-toolbar--actions-only" : "",
    portalToolbar ? "daily-note-toolbar--portaled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const toolbar = (
    <div className={toolbarClassName}>
      {showTitle ? (
        <h2 id={titleId} className="daily-note-title">
          <span className="daily-note-title-main">{t("dailyNote.title")}</span>
        </h2>
      ) : null}
      {!editing ? (
        <button
          type="button"
          className="daily-note-edit-btn"
          onClick={startEdit}
        >
          {t("dailyNote.edit")}
        </button>
      ) : (
        <div className="daily-note-actions">
          <button
            type="button"
            className="daily-note-action daily-note-action--primary"
            onClick={saveEdit}
          >
            {t("dailyNote.save")}
          </button>
          <button
            type="button"
            className="daily-note-action"
            onClick={cancelEdit}
          >
            {t("dailyNote.cancel")}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <section className="daily-note" aria-labelledby={titleId}>
      {!portalToolbar ? toolbar : null}
      {portalToolbar ? createPortal(toolbar, mountEl) : null}
      <div className="daily-note-paper">
        {editing ? (
          <textarea
            className="daily-note-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            spellCheck
            aria-label={t("dailyNote.editAria")}
          />
        ) : (
          <blockquote className="daily-note-quote">
            <p className="daily-note-text">{saved}</p>
          </blockquote>
        )}
      </div>
    </section>
  );
};

DailyNoteCard.propTypes = {
  quote: PropTypes.string.isRequired,
  showTitle: PropTypes.bool,
  titleId: PropTypes.string,
  /** DOM id for `createPortal` — park edit/save controls next to an external heading (e.g. dashboard title row) */
  toolbarMountId: PropTypes.string,
};

export default memo(DailyNoteCard);
