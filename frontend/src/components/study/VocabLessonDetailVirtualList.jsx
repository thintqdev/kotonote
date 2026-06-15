import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { vocabMeaningLine } from "../../data/vocabularyMock.js";

const ROW_GAP = 16;
const ROW_BODY = 184;
const ROW_STRIDE = ROW_BODY + ROW_GAP;
const OVERSCAN = 5;
const VIRTUALIZE_MIN = 20;
const LIST_MAX_HEIGHT = "min(70vh, 720px)";

function VocabLessonDetailRow({ row, lang, showViGloss, style }) {
  const rowMean = vocabMeaningLine(row, lang);
  return (
    <li
      className={`vocab-lesson-detail-card${style ? " vocab-lesson-detail-card--virtual" : ""}`}
      style={style}
    >
      <div className="vocab-lesson-detail-top" lang="ja">
        <span className="vocab-lesson-detail-word">{row.surface}</span>
        <span className="vocab-lesson-detail-read">{row.reading}</span>
      </div>
      <p className="vocab-lesson-detail-mean">{rowMean}</p>
      <div
        className="vocab-lesson-detail-ex"
        lang="ja"
        dangerouslySetInnerHTML={{ __html: row.exampleJaHtml }}
      />
      {showViGloss ? (
        <p className="vocab-lesson-detail-exvi" lang="vi">
          {row.exampleVi}
        </p>
      ) : null}
    </li>
  );
}

VocabLessonDetailRow.propTypes = {
  row: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
  showViGloss: PropTypes.bool.isRequired,
  style: PropTypes.object,
};

export default function VocabLessonDetailVirtualList({
  items,
  lang,
  showViGloss,
}) {
  const useVirtual = items.length >= VIRTUALIZE_MIN;
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(480);

  const syncViewport = useCallback(() => {
    const el = containerRef.current;
    if (el) setViewportHeight(el.clientHeight || 480);
  }, []);

  useEffect(() => {
    if (!useVirtual) return undefined;
    syncViewport();
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(syncViewport);
    ro.observe(el);
    return () => ro.disconnect();
  }, [useVirtual, syncViewport, items.length]);

  const { start, end } = useMemo(() => {
    if (!useVirtual) return { start: 0, end: items.length };
    const startIdx = Math.max(0, Math.floor(scrollTop / ROW_STRIDE) - OVERSCAN);
    const endIdx = Math.min(
      items.length,
      Math.ceil((scrollTop + viewportHeight) / ROW_STRIDE) + OVERSCAN,
    );
    return { start: startIdx, end: endIdx };
  }, [useVirtual, scrollTop, viewportHeight, items.length]);

  const visible = useMemo(
    () => items.slice(start, end),
    [items, start, end],
  );

  if (!useVirtual) {
    return (
      <ul className="vocab-lesson-detail-list">
        {items.map((row) => (
          <VocabLessonDetailRow
            key={row.id}
            row={row}
            lang={lang}
            showViGloss={showViGloss}
          />
        ))}
      </ul>
    );
  }

  const totalHeight =
    items.length > 0 ? items.length * ROW_STRIDE - ROW_GAP : 0;

  return (
    <div
      ref={containerRef}
      className="vocab-lesson-detail-virtual-scroll"
      style={{ maxHeight: LIST_MAX_HEIGHT }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <ul
        className="vocab-lesson-detail-list vocab-lesson-detail-list--virtual"
        style={{ height: totalHeight, position: "relative" }}
      >
        {visible.map((row, i) => (
          <VocabLessonDetailRow
            key={row.id}
            row={row}
            lang={lang}
            showViGloss={showViGloss}
            style={{
              position: "absolute",
              top: (start + i) * ROW_STRIDE,
              left: 0,
              right: 0,
              height: ROW_BODY,
              boxSizing: "border-box",
            }}
          />
        ))}
      </ul>
    </div>
  );
}

VocabLessonDetailVirtualList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  lang: PropTypes.string.isRequired,
  showViGloss: PropTypes.bool.isRequired,
};
