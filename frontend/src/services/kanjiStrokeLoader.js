const CDN_BASE = "https://cdn.jsdelivr.net/gh/parsimonhi/animCJK/svgsJa";
const CACHE_VERSION = "kanji-stroke-v4-animcjk";

/** @type {Map<string, { strokes: KanjiStrokeMeta[], fetchedAt: number }>} */
const cache = new Map();

function cacheKey(char) {
  return `${CACHE_VERSION}:${char}`;
}

/** @typedef {{ d: string, startX: number, startY: number }} KanjiStrokeMeta */

function parsePathStart(d) {
  if (typeof d !== "string") return null;
  const m = d.match(/[Mm]\s*([-\d.]+)[,\s]+([-\d.]+)/);
  if (!m) return null;
  const x = Number(m[1]);
  const y = Number(m[2]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function strokeNoFromId(id) {
  if (!id) return null;
  const m = String(id).match(/d(\d+)(m)?$/);
  if (!m) return null;
  return Number.parseInt(m[1], 10);
}

/**
 * Parse AnimCJK SVG into ordered stroke metadata.
 * - stroke path ids often end with d1, d2...
 * - median path ids often end with d1m, d2m...
 * @param {string} svgText
 * @returns {KanjiStrokeMeta[]}
 */
function parseAnimCjkSvg(svgText) {
  if (!svgText || typeof DOMParser === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const allPaths = Array.from(doc.querySelectorAll("path"));

  const strokeMap = new Map();
  const medianMap = new Map();

  for (const p of allPaths) {
    const d = p.getAttribute("d");
    if (!d) continue;
    const id = p.getAttribute("id") || "";
    const no = strokeNoFromId(id);
    if (!Number.isFinite(no)) continue;
    if (id.endsWith("m")) {
      medianMap.set(no, d);
    } else {
      strokeMap.set(no, d);
    }
  }

  const orderedNos = Array.from(strokeMap.keys()).sort((a, b) => a - b);
  const out = [];
  for (const no of orderedNos) {
    const d = strokeMap.get(no);
    if (!d) continue;
    const medianStart = parsePathStart(medianMap.get(no) || "");
    const pathStart = parsePathStart(d);
    const start = medianStart || pathStart || { x: 110, y: 130 };
    out.push({
      d: d.trim(),
      startX: start.x,
      startY: start.y,
    });
  }
  return out;
}

/**
 * Load Kanji stroke paths for SVG animation from AnimCJK.
 * @param {string} char
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<KanjiStrokeMeta[]>}
 */
export async function loadKanjiStrokePaths(char, opts = {}) {
  const key = cacheKey(char);
  if (cache.has(key)) {
    return cache.get(key).strokes;
  }

  const codePoint = char.codePointAt(0);
  if (!Number.isFinite(codePoint)) {
    throw new Error("kanji_codepoint_invalid");
  }
  const url = `${CDN_BASE}/${codePoint}.svg`;
  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok) {
    throw new Error(`kanji_stroke_fetch_${res.status}`);
  }

  const svgText = await res.text();
  const strokes = parseAnimCjkSvg(svgText);
  if (strokes.length === 0) {
    throw new Error("kanji_stroke_empty");
  }

  cache.set(key, { strokes, fetchedAt: Date.now() });
  return strokes;
}
