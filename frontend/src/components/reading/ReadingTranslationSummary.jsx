import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { summarizeReadingTranslation } from "../../services/readingService.js";
import { getApiErrorMessage } from "../../utils/apiErrorMessage.js";
import { hashText } from "../../utils/hashText.js";

const TABS = [
  { id: "mine", pick: (r) => r.translationVi },
  { id: "corrected", pick: (r) => r.feedback?.suggestionVi || r.translationVi },
  { id: "reference", pick: (r) => r.analysis?.referenceVi || "" },
];

/** Ghép câu theo đoạn gốc của bài. */
function joinByParagraph(sentences, results, pick) {
  const paragraphs = [];
  for (const s of sentences) {
    const text = pick(results[s.index]).trim();
    if (!text) continue;
    const last = paragraphs[paragraphs.length - 1];
    if (last && last.paragraphIndex === s.paragraphIndex) last.text += ` ${text}`;
    else paragraphs.push({ paragraphIndex: s.paragraphIndex, text });
  }
  return paragraphs;
}

function computeStats(sentences, results) {
  const feedbacks = sentences.map((s) => results[s.index].feedback);
  const count = (fn) => feedbacks.filter(fn).length;
  return {
    total: feedbacks.length,
    average: Math.round(feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length),
    correct: count((f) => f.verdict === "correct"),
    partial: count((f) => f.verdict === "partial"),
    incorrect: count((f) => f.verdict === "incorrect"),
    subjectOk: count((f) => f.subjectOk),
    predicateOk: count((f) => f.predicateOk),
  };
}

function SummaryList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="grammar-box">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

SummaryList.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string),
};

function AiSummary({ summary }) {
  const { t } = useTranslation();
  const k = (key) => t(`readingArticlePage.translation.summary.${key}`);
  return (
    <div className="reading-summary-ai">
      <p className="reading-summary-ai-lead">{summary.summaryVi}</p>
      <div className="reading-summary-ai-grid">
        <SummaryList title={k("strengths")} items={summary.strengthsVi} />
        <SummaryList title={k("weaknesses")} items={summary.weaknessesVi} />
      </div>
      {summary.grammarToReview.length ? (
        <div className="grammar-box">
          <h4>{k("grammar")}</h4>
          {summary.grammarToReview.map((g) => (
            <p key={g.pattern} className="reading-summary-grammar">
              <strong lang="ja">{g.pattern}</strong> — {g.reasonVi}
            </p>
          ))}
        </div>
      ) : null}
      <SummaryList title={k("advice")} items={summary.adviceVi} />
    </div>
  );
}

AiSummary.propTypes = {
  summary: PropTypes.shape({
    summaryVi: PropTypes.string,
    strengthsVi: PropTypes.arrayOf(PropTypes.string),
    weaknessesVi: PropTypes.arrayOf(PropTypes.string),
    grammarToReview: PropTypes.arrayOf(PropTypes.object),
    adviceVi: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

function ComparisonTabs({ sentences, results }) {
  const { t } = useTranslation();
  const k = (key) => t(`readingArticlePage.translation.summary.${key}`);
  const [active, setActive] = useState("mine");
  const tab = TABS.find((item) => item.id === active);
  const paragraphs = joinByParagraph(sentences, results, tab.pick);

  return (
    <div className="reading-summary-compare">
      <div className="reading-summary-tabs" role="tablist" aria-label={k("tabsAria")}>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`reading-summary-tab-${item.id}`}
            aria-selected={active === item.id}
            aria-controls="reading-summary-panel"
            className={`reading-summary-tab${active === item.id ? " is-active" : ""}`}
            onClick={() => setActive(item.id)}
          >
            {k(`tab.${item.id}`)}
          </button>
        ))}
      </div>
      <div
        id="reading-summary-panel"
        role="tabpanel"
        aria-labelledby={`reading-summary-tab-${active}`}
        className={`grammar-box reading-summary-panel reading-summary-panel--${active}`}
      >
        <p className="reading-summary-panel-hint">{k(`tabHint.${active}`)}</p>
        {paragraphs.map((p) => (
          <p key={p.paragraphIndex} className="reading-summary-paragraph">{p.text}</p>
        ))}
      </div>
    </div>
  );
}

ComparisonTabs.propTypes = {
  sentences: PropTypes.arrayOf(PropTypes.object).isRequired,
  results: PropTypes.object.isRequired,
};

export default function ReadingTranslationSummary({
  slug,
  sentences,
  results,
  hasUnsubmittedEdits = false,
  savedSummary,
  onSummaryChange,
}) {
  const { t } = useTranslation();
  const k = (key, opts) => t(`readingArticlePage.translation.summary.${key}`, opts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const graded = sentences.filter((s) => results[s.index]?.feedback);
  const complete = sentences.length > 0 && graded.length === sentences.length;

  if (!complete) {
    return (
      <div className="grammar-box reading-summary reading-summary--locked">
        <h3>{k("title")}</h3>
        <p>{k("locked", { done: graded.length, total: sentences.length })}</p>
      </div>
    );
  }

  const items = sentences.map((s) => ({
    index: s.index,
    translationVi: results[s.index].translationVi,
    score: results[s.index].feedback.score,
  }));
  const basis = hashText(JSON.stringify(items));
  const stale = Boolean(savedSummary) && savedSummary.basis !== basis;
  const stats = computeStats(sentences, results);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await summarizeReadingTranslation(slug, items);
      if (data?.summary) onSummaryChange({ data: data.summary, basis });
      else setError(k("aiUnavailable"));
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reading-summary" aria-live="polite">
      <h3>{k("title")}</h3>
      {hasUnsubmittedEdits ? <p className="reading-sentence-outdated">{k("unsubmittedNote")}</p> : null}
      <ComparisonTabs sentences={sentences} results={results} />

      <div className="grammar-box reading-summary-overall">
        <h4>{k("overallTitle")}</h4>
        <dl className="reading-summary-stats">
          <div><dt>{k("statAvg")}</dt><dd>{stats.average}/100</dd></div>
          <div>
            <dt>{k("statVerdicts")}</dt>
            <dd>{stats.correct} / {stats.partial} / {stats.incorrect}</dd>
          </div>
          <div><dt>{k("statSubject")}</dt><dd>{stats.subjectOk}/{stats.total}</dd></div>
          <div><dt>{k("statPredicate")}</dt><dd>{stats.predicateOk}/{stats.total}</dd></div>
        </dl>
        {stale ? <p className="reading-sentence-outdated">{k("stale")}</p> : null}
        {savedSummary?.data ? <AiSummary summary={savedSummary.data} /> : null}
        {error ? <p className="reading-translation-error" role="alert">{error}</p> : null}
        {!savedSummary?.data || stale ? (
          <button
            type="button"
            className="reading-translation-submit"
            disabled={loading}
            onClick={() => void handleGenerate()}
          >
            {loading ? k("generating") : savedSummary?.data ? k("regenerate") : k("generate")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

ReadingTranslationSummary.propTypes = {
  slug: PropTypes.string.isRequired,
  sentences: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.number.isRequired,
      paragraphIndex: PropTypes.number,
      textJa: PropTypes.string,
    }),
  ).isRequired,
  results: PropTypes.object.isRequired,
  hasUnsubmittedEdits: PropTypes.bool,
  savedSummary: PropTypes.shape({
    data: PropTypes.object,
    basis: PropTypes.string,
  }),
  onSummaryChange: PropTypes.func.isRequired,
};
