import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { loadKanaStrokePaths } from "../../services/kanaStrokeLoader.js";

const VIEW_BOX = "0 0 1099 1099";

function KanaStrokeAnimation({
  script,
  char = "",
  replayTick = 0,
  className = "",
  fallbackHint = "",
}) {
  const [paths, setPaths] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!char) {
      setPaths([]);
      setStatus("idle");
      return undefined;
    }

    const ac = new AbortController();
    let cancelled = false;

    const run = async () => {
      setPaths([]);
      setStatus("loading");
      setError(null);
      try {
        const next = await loadKanaStrokePaths(script, char, { signal: ac.signal });
        if (cancelled) return;
        setPaths(next);
        setStatus("ready");
      } catch (e) {
        if (e?.name === "AbortError" || cancelled) return;
        setPaths([]);
        setError(e);
        setStatus("error");
      }
    };

    run();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [script, char]);

  if (!char) return null;

  if (status === "loading") {
    return (
      <div className={`alpha-stroke-loading${className ? ` ${className}` : ""}`} aria-hidden="true">
        <span className="alpha-stroke-loading-dot" />
        <span className="alpha-stroke-loading-dot" />
        <span className="alpha-stroke-loading-dot" />
      </div>
    );
  }

  if (status === "error" || paths.length === 0) {
    return (
      <div className={`alpha-stroke-fallback${className ? ` ${className}` : ""}`}>
        <span className="alpha-stroke-fallback-char" lang="ja">
          {char}
        </span>
        {fallbackHint ? (
          <span className="alpha-stroke-fallback-hint" role="status">
            {fallbackHint}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <svg
      key={`${char}-${replayTick}`}
      className={`alpha-stroke-svg${className ? ` ${className}` : ""}`}
      viewBox={VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path
          key={`${char}-s${i}`}
          d={d}
          pathLength={1}
          className="alpha-stroke-path"
          style={{ animationDelay: `${i * 0.62}s` }}
        />
      ))}
    </svg>
  );
}

KanaStrokeAnimation.propTypes = {
  script: PropTypes.oneOf(["hiragana", "katakana"]).isRequired,
  char: PropTypes.string,
  replayTick: PropTypes.number,
  className: PropTypes.string,
  fallbackHint: PropTypes.string,
};

export default KanaStrokeAnimation;
