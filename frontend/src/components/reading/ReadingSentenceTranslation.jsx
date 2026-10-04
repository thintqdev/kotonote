import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { analyzeSentenceTranslations } from "../../services/readingService.js";
import { getApiErrorMessage } from "../../utils/apiErrorMessage.js";
import { hashText } from "../../utils/hashText.js";
import RichText from "./ReadingRichText.jsx";
import ReadingSentenceResult from "./ReadingSentenceResult.jsx";
import ReadingTranslationSummary from "./ReadingTranslationSummary.jsx";
import "./ReadingSentenceTranslation.css";

const STORAGE_PREFIX = "kn_reading_sentences:";
const MAX_ITEMS_PER_REQUEST = 10;

/** Đổi khi nội dung bài đổi → bỏ nháp cũ vì chỉ số câu không còn khớp. */
const sentencesSignature = (sentences) => hashText(sentences.map((s) => s.textJa).join("\n"));

function loadSaved(slug, signature) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_PREFIX + slug) ?? "null");
    if (data?.signature === signature) {
      return { drafts: data.drafts ?? {}, results: data.results ?? {}, summary: data.summary ?? null };
    }
  } catch {
    // nháp hỏng thì bỏ qua
  }
  return { drafts: {}, results: {}, summary: null };
}

function SentenceItem({ sentence, markup, paragraphStart, draft, result, pending, error, onChange, onSubmit }) {
  const { t } = useTranslation();
  const k = (key, opts) => t(`readingArticlePage.translation.${key}`, opts);
  const inputId = `reading-sentence-${sentence.index}`;
  const outdated = Boolean(result) && result.translationVi !== draft.trim();

  return (
    <li className={`reading-sentence${result?.feedback ? ` reading-sentence--${result.feedback.verdict}` : ""}`}>
      {paragraphStart ? (
        <p className="reading-sentence-paragraph">{k("paragraph", { n: sentence.paragraphIndex + 1 })}</p>
      ) : null}
      <label htmlFor={inputId} className="reading-sentence-ja grammar-jp-line" lang="ja">
        <span className="reading-sentence-no">{sentence.index + 1}</span>
        <span><RichText text={sentence.textJa} markup={markup} /></span>
      </label>
      <textarea
        id={inputId}
        rows={2}
        maxLength={1000}
        value={draft}
        disabled={pending}
        placeholder={k("placeholder")}
        onChange={(e) => onChange(sentence.index, e.target.value)}
      />
      <div className="reading-sentence-actions">
        {error ? <p className="reading-translation-error" role="alert">{error}</p> : null}
        <button
          type="button"
          className="reading-sentence-submit"
          disabled={pending || !draft.trim() || (Boolean(result?.feedback) && !outdated)}
          onClick={() => onSubmit([sentence.index])}
        >
          {pending ? k("submitting") : result ? k("resubmit") : k("submit")}
        </button>
      </div>
      {result ? <ReadingSentenceResult result={result} outdated={outdated} /> : null}
    </li>
  );
}

SentenceItem.propTypes = {
  sentence: PropTypes.shape({
    index: PropTypes.number.isRequired,
    paragraphIndex: PropTypes.number,
    textJa: PropTypes.string.isRequired,
  }).isRequired,
  markup: PropTypes.bool,
  paragraphStart: PropTypes.bool,
  draft: PropTypes.string.isRequired,
  result: PropTypes.object,
  pending: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default function ReadingSentenceTranslation({ slug, sentences, markup = false }) {
  const { t } = useTranslation();
  const k = (key, opts) => t(`readingArticlePage.translation.${key}`, opts);
  const signature = useMemo(() => sentencesSignature(sentences), [sentences]);
  const [saved] = useState(() => loadSaved(slug, signature));
  const [drafts, setDrafts] = useState(saved.drafts);
  const [results, setResults] = useState(saved.results);
  const [summary, setSummary] = useState(saved.summary);
  const [pending, setPending] = useState(() => new Set());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_PREFIX + slug,
        JSON.stringify({ signature, drafts, results, summary }),
      );
    } catch {
      // hết dung lượng localStorage — vẫn dùng được trong phiên hiện tại
    }
  }, [slug, signature, drafts, results, summary]);

  const handleChange = useCallback((index, value) => {
    setDrafts((prev) => ({ ...prev, [index]: value }));
    setErrors((prev) => ({ ...prev, [index]: "" }));
  }, []);

  const submit = useCallback(
    async (indices) => {
      const items = indices
        .map((index) => ({ index, translationVi: (drafts[index] ?? "").trim() }))
        .filter((item) => item.translationVi);
      if (!items.length) return;
      const ids = items.map((item) => item.index);
      setPending((prev) => new Set([...prev, ...ids]));
      for (let i = 0; i < items.length; i += MAX_ITEMS_PER_REQUEST) {
        const batch = items.slice(i, i + MAX_ITEMS_PER_REQUEST);
        try {
          const data = await analyzeSentenceTranslations(slug, batch);
          const next = {};
          for (const row of data?.results ?? []) next[row.index] = row;
          setResults((prev) => ({ ...prev, ...next }));
        } catch (err) {
          const message = getApiErrorMessage(err, t);
          setErrors((prev) => ({ ...prev, ...Object.fromEntries(batch.map((b) => [b.index, message])) }));
        } finally {
          setPending((prev) => {
            const next = new Set(prev);
            batch.forEach((b) => next.delete(b.index));
            return next;
          });
        }
      }
    },
    [drafts, slug, t],
  );

  const graded = sentences.filter((s) => results[s.index]?.feedback);
  const average = graded.length
    ? Math.round(graded.reduce((sum, s) => sum + results[s.index].feedback.score, 0) / graded.length)
    : null;
  const readyToSubmit = sentences
    .map((s) => s.index)
    .filter((i) => {
      const draft = (drafts[i] ?? "").trim();
      return draft && (!results[i]?.feedback || results[i].translationVi !== draft);
    });

  return (
    <section className="grammar-block reading-translation" aria-labelledby="reading-translation-title">
      <h2 id="reading-translation-title" className="grammar-h">{k("title")}</h2>
      <div className="grammar-box reading-translation-guide">
        <h3>{k("stepsTitle")}</h3>
        <ol>
          <li>{k("step1")}</li>
          <li>{k("step2")}</li>
          <li>{k("step3")}</li>
          <li>{k("step4")}</li>
        </ol>
        <p className="reading-sentence-draft-note">{k("draftNote")}</p>
      </div>

      {sentences.length ? (
        <>
          <div className="reading-sentence-toolbar">
            <span>
              {average === null
                ? k("progressNoAvg", { done: graded.length, total: sentences.length })
                : k("progress", { done: graded.length, total: sentences.length, avg: average })}
            </span>
            <button
              type="button"
              className="reading-translation-submit"
              disabled={!readyToSubmit.length || pending.size > 0}
              onClick={() => void submit(readyToSubmit)}
            >
              {pending.size > 0 ? k("submitting") : k("submitAll", { count: readyToSubmit.length })}
            </button>
          </div>
          <ol className="reading-sentence-list">
            {sentences.map((sentence, i) => (
              <SentenceItem
                key={sentence.index}
                sentence={sentence}
                markup={markup}
                paragraphStart={i === 0 || sentences[i - 1].paragraphIndex !== sentence.paragraphIndex}
                draft={drafts[sentence.index] ?? ""}
                result={results[sentence.index] ?? null}
                pending={pending.has(sentence.index)}
                error={errors[sentence.index] ?? ""}
                onChange={handleChange}
                onSubmit={(indices) => void submit(indices)}
              />
            ))}
          </ol>
          <ReadingTranslationSummary
            slug={slug}
            sentences={sentences}
            results={results}
            hasUnsubmittedEdits={readyToSubmit.some((i) => results[i]?.feedback)}
            savedSummary={summary}
            onSummaryChange={setSummary}
          />
        </>
      ) : (
        <p className="vocab-empty">{k("noSentences")}</p>
      )}
    </section>
  );
}

ReadingSentenceTranslation.propTypes = {
  slug: PropTypes.string.isRequired,
  sentences: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.number.isRequired,
      paragraphIndex: PropTypes.number,
      textJa: PropTypes.string.isRequired,
    }),
  ).isRequired,
  markup: PropTypes.bool,
};
