import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export const SENTENCE_ROLES = [
  "topic",
  "subject",
  "predicate",
  "object",
  "complement",
  "modifier",
  "adverbial",
  "connector",
  "clause",
];

/**
 * Cắt câu thành các đoạn để tô màu theo vai trò. Cụm nào AI trả về không khớp nguyên văn thì bỏ qua.
 * @param {string} text
 * @param {{ ja: string, role: string, vi: string }[]} components
 */
function buildSegments(text, components) {
  const segments = [];
  let cursor = 0;
  for (const component of components) {
    const pos = text.indexOf(component.ja, cursor);
    if (pos < 0) continue;
    if (pos > cursor) segments.push({ text: text.slice(cursor, pos) });
    segments.push({ text: component.ja, role: component.role, vi: component.vi });
    cursor = pos + component.ja.length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

function FeedbackBlock({ feedback }) {
  const { t } = useTranslation();
  const k = (key, opts) => t(`readingArticlePage.translation.${key}`, opts);
  return (
    <div className="reading-sentence-feedback">
      <div className="reading-sentence-score-row">
        <span className={`reading-sentence-score reading-sentence-score--${feedback.verdict}`}>
          <strong>{feedback.score}</strong>/100
        </span>
        <span className="reading-sentence-verdict">{k(`verdict.${feedback.verdict}`)}</span>
        <span className={`reading-sentence-check${feedback.subjectOk ? " is-ok" : ""}`}>
          {feedback.subjectOk ? "✓" : "✗"} {k("subjectCheck")}
        </span>
        <span className={`reading-sentence-check${feedback.predicateOk ? " is-ok" : ""}`}>
          {feedback.predicateOk ? "✓" : "✗"} {k("predicateCheck")}
        </span>
      </div>
      {feedback.commentVi ? <p className="reading-sentence-comment">{feedback.commentVi}</p> : null}
      {feedback.issues.length ? (
        <div className="reading-ai-issues">
          <h5>{k("issues")}</h5>
          {feedback.issues.map((issue, i) => (
            <div className={`reading-ai-issue reading-ai-issue--${issue.severity}`} key={`${issue.quote}-${i}`}>
              <p><strong>{issue.quote}</strong> → {issue.correctionVi}</p>
              <small>{issue.explanationVi}</small>
            </div>
          ))}
        </div>
      ) : null}
      {feedback.suggestionVi ? (
        <p className="reading-sentence-suggestion">
          <span>{k("suggestion")}</span> {feedback.suggestionVi}
        </p>
      ) : null}
    </div>
  );
}

FeedbackBlock.propTypes = {
  feedback: PropTypes.shape({
    score: PropTypes.number,
    verdict: PropTypes.string,
    subjectOk: PropTypes.bool,
    predicateOk: PropTypes.bool,
    commentVi: PropTypes.string,
    issues: PropTypes.arrayOf(PropTypes.object),
    suggestionVi: PropTypes.string,
  }).isRequired,
};

function PartRow({ label, part }) {
  const { t } = useTranslation();
  return (
    <div className="reading-sentence-part">
      <span className="reading-sentence-part-label">{label}</span>
      <div>
        <p>
          {part.implied ? (
            <em>({t("readingArticlePage.translation.implied")})</em>
          ) : (
            <strong lang="ja">{part.ja}</strong>
          )}
          {part.vi ? <> — {part.vi}</> : null}
        </p>
        {part.noteVi ? <small>{part.noteVi}</small> : null}
      </div>
    </div>
  );
}

PartRow.propTypes = {
  label: PropTypes.string.isRequired,
  part: PropTypes.shape({
    ja: PropTypes.string,
    vi: PropTypes.string,
    implied: PropTypes.bool,
    noteVi: PropTypes.string,
  }).isRequired,
};

function AnalysisBlock({ analysis }) {
  const { t } = useTranslation();
  const k = (key) => t(`readingArticlePage.translation.${key}`);
  const segments = buildSegments(analysis.textJa, analysis.components);
  const usedRoles = SENTENCE_ROLES.filter((role) => analysis.components.some((c) => c.role === role));

  return (
    <div className="reading-sentence-analysis">
      <h5>{k("analysisTitle")}</h5>
      <p className="reading-sentence-colored" lang="ja">
        {segments.map((seg, i) =>
          seg.role ? (
            <span key={i} className={`reading-role reading-role--${seg.role}`} title={seg.vi}>
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </p>
      {usedRoles.length ? (
        <ul className="reading-role-legend" aria-label={k("legend")}>
          {usedRoles.map((role) => (
            <li key={role} className={`reading-role reading-role--${role}`}>{k(`roles.${role}`)}</li>
          ))}
        </ul>
      ) : null}
      <PartRow label={k("subject")} part={analysis.subject} />
      <PartRow label={k("predicate")} part={analysis.predicate} />
      {analysis.components.length ? (
        <details className="reading-sentence-components">
          <summary>{k("components")}</summary>
          <ul>
            {analysis.components.map((c, i) => (
              <li key={`${c.ja}-${i}`}>
                <span className={`reading-role reading-role--${c.role}`} lang="ja">{c.ja}</span>
                <small>{k(`roles.${c.role}`)}</small> {c.vi}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {analysis.structureVi ? (
        <p className="reading-sentence-structure"><span>{k("structure")}</span> {analysis.structureVi}</p>
      ) : null}
      {analysis.grammarPoints.length ? (
        <div className="reading-sentence-grammar">
          <h5>{k("grammar")}</h5>
          {analysis.grammarPoints.map((g) => (
            <p key={g.pattern}>
              <strong lang="ja">{g.pattern}</strong> — {g.meaningVi}
              {g.usageVi ? <><br /><small>{g.usageVi}</small></> : null}
            </p>
          ))}
        </div>
      ) : null}
      <div className="reading-ai-reference">
        <h5>{k("reference")}</h5>
        <p>{analysis.referenceVi}</p>
      </div>
    </div>
  );
}

AnalysisBlock.propTypes = {
  analysis: PropTypes.shape({
    textJa: PropTypes.string,
    referenceVi: PropTypes.string,
    subject: PropTypes.object,
    predicate: PropTypes.object,
    components: PropTypes.arrayOf(PropTypes.object),
    structureVi: PropTypes.string,
    grammarPoints: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
};

export default function ReadingSentenceResult({ result, outdated }) {
  const { t } = useTranslation();
  const k = (key) => t(`readingArticlePage.translation.${key}`);
  return (
    <div className="reading-sentence-result" aria-live="polite">
      {outdated ? <p className="reading-sentence-outdated">{k("outdated")}</p> : null}
      {result.feedback ? (
        <FeedbackBlock feedback={result.feedback} />
      ) : (
        <p className="reading-translation-error">
          {result.analysis ? k("feedbackUnavailable") : k("aiUnavailable")}
        </p>
      )}
      {result.analysis ? <AnalysisBlock analysis={result.analysis} /> : null}
    </div>
  );
}

ReadingSentenceResult.propTypes = {
  result: PropTypes.shape({
    index: PropTypes.number,
    translationVi: PropTypes.string,
    feedback: PropTypes.object,
    analysis: PropTypes.object,
  }).isRequired,
  outdated: PropTypes.bool,
};
