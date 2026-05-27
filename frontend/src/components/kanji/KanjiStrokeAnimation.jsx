import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { loadKanjiStrokePaths } from "../../services/kanjiStrokeLoader.js";

const VIEW_BOX = "0 0 1024 1024";

export default function KanjiStrokeAnimation({
  char = "",
  replayTick = 0,
  className = "",
  fallbackHint = "",
}) {
  const [strokes, setStrokes] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!char) {
      setStrokes([]);
      setStatus("idle");
      return undefined;
    }

    let cancelled = false;
    const ac = new AbortController();

    const run = async () => {
      setStatus("loading");
      setStrokes([]);
      try {
        const next = await loadKanjiStrokePaths(char, { signal: ac.signal });
        if (cancelled) return;
        setStrokes(next);
        setStatus("ready");
      } catch (e) {
        if (e?.name === "AbortError" || cancelled) return;
        setStatus("error");
        setStrokes([]);
      }
    };

    run();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [char]);

  if (!char) return null;

  if (status === "loading") {
    return (
      <div className={`kanji-stroke-loading${className ? ` ${className}` : ""}`} aria-hidden="true">
        <span className="kanji-stroke-loading-dot" />
        <span className="kanji-stroke-loading-dot" />
        <span className="kanji-stroke-loading-dot" />
      </div>
    );
  }

  if (status === "error" || strokes.length === 0) {
    return (
      <div className={`kanji-stroke-fallback${className ? ` ${className}` : ""}`}>
        <span className="kanji-stroke-fallback-char" lang="ja">
          {char}
        </span>
        {fallbackHint ? (
          <span className="kanji-stroke-fallback-hint" role="status">
            {fallbackHint}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <svg
      key={`${char}-${replayTick}`}
      className={`kanji-stroke-svg${className ? ` ${className}` : ""}`}
      viewBox={VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g className="kanji-stroke-ghost-layer">
        {strokes.map((s, i) => (
          <path key={`${char}-ghost-${i}`} d={s.d} className="kanji-stroke-ghost" />
        ))}
      </g>

      <g className="kanji-stroke-active-layer">
        {strokes.map((s, i) => (
          <path
            key={`${char}-active-${i}`}
            d={s.d}
            className="kanji-stroke-path"
            style={{ animationDelay: `${i * 0.55}s` }}
          />
        ))}
      </g>

      <g className="kanji-stroke-step-layer" aria-hidden="true">
        {strokes.map((s, i) => (
          <g
            key={`${char}-step-${i}`}
            className="kanji-stroke-step"
            transform={`translate(${s.startX}, ${s.startY})`}
          >
            <circle r="30" className="kanji-stroke-step-badge" />
            <text className="kanji-stroke-step-num" textAnchor="middle" dominantBaseline="central">
              {i + 1}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

KanjiStrokeAnimation.propTypes = {
  char: PropTypes.string,
  replayTick: PropTypes.number,
  className: PropTypes.string,
  fallbackHint: PropTypes.string,
};
