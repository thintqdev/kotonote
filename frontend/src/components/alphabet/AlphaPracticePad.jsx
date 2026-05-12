import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

function getCssPos(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

/**
 * Một ô luyện viết: chữ mẫu phía dưới + canvas vẽ tay (chuột / cảm ứng).
 */
function AlphaPracticePad({
  guideText,
  variant,
  clearTick,
  padIndex,
  showGuide = true,
}) {
  const { t } = useTranslation();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const dprRef = useRef(1);
  const drawing = useRef(false);
  const last = useRef(null);

  const applyBrush = useCallback((ctx) => {
    const dpr = dprRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.75;
    ctx.strokeStyle = "rgb(58, 53, 48)";
  }, []);

  const syncCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    dprRef.current = dpr;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    applyBrush(ctx);
  }, [applyBrush]);

  const clearInk = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyBrush(ctx);
  }, [applyBrush]);

  useLayoutEffect(() => {
    syncCanvas();
  }, [syncCanvas, guideText]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => {
      syncCanvas();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [syncCanvas]);

  useEffect(() => {
    clearInk();
  }, [clearInk, clearTick]);

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    canvas.setPointerCapture(e.pointerId);
    last.current = getCssPos(canvas, e.clientX, e.clientY);
  };

  const onPointerMove = (e) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas || !last.current) return;
    const ctx = canvas.getContext("2d");
    const p = getCssPos(canvas, e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const endStroke = (e) => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const canvas = canvasRef.current;
    if (canvas && e?.pointerId != null) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`alpha-practice-pad alpha-practice-pad--${variant}${
        showGuide ? "" : " alpha-practice-pad--no-guide"
      }`}
    >
      {showGuide ? (
        <span className="alpha-practice-pad-guide" lang="ja" aria-hidden="true">
          {guideText}
        </span>
      ) : null}
      <canvas
        ref={canvasRef}
        className="alpha-practice-pad-canvas"
        role="img"
        aria-label={t("alphabetPage.practicePadAria", {
          n: padIndex + 1,
          char: guideText,
        })}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") endStroke(e);
        }}
      />
    </div>
  );
}

AlphaPracticePad.propTypes = {
  guideText: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["bold", "trace"]).isRequired,
  clearTick: PropTypes.number.isRequired,
  padIndex: PropTypes.number.isRequired,
  showGuide: PropTypes.bool,
};

export default AlphaPracticePad;
