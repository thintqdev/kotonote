const CDN_BASE = "https://cdn.jsdelivr.net/npm/kana-svg-data/dist";

/** Đổi cache khi đổi cách biên dịch đường nét. */
const CACHE_VERSION = "median-v2-smooth";

/** @type {Map<string, { paths: string[], fetchedAt: number }>} */
const cache = new Map();

function cacheKey(script, char) {
  return `${CACHE_VERSION}:${script}:${char}`;
}

/**
 * Lọc nét dự phần “b” (bản sao clip trong dữ liệu nguồn).
 * @param {{ id?: string|number, value: string }[]} strokes
 */
export function filterStrokePaths(strokes) {
  if (!Array.isArray(strokes)) return [];
  return strokes
    .filter((s) => s && typeof s.value === "string" && !String(s.id).endsWith("b"))
    .map((s) => s.value);
}

function normalizeMedianPoints(raw) {
  if (!Array.isArray(raw) || raw.length < 2) return null;
  const pts = raw.filter(
    (p) =>
      Array.isArray(p) &&
      p.length >= 2 &&
      Number.isFinite(Number(p[0])) &&
      Number.isFinite(Number(p[1])),
  );
  if (pts.length < 2) return null;
  return pts.map(([x, y]) => [Number(x), Number(y)]);
}

/**
 * Catmull-Rom (điểm đều) → chuỗi cubic Bézier nối tiếp, đầu mút ảo để không gãy.
 * @param {number[][]} pts — [[x,y], ...]
 * @param {number} tension — mặc định 6 = chuyển CR chuẩn sang C
 * @returns {string|null}
 */
function catmullRomToBezierD(pts, tension = 6) {
  const n = pts.length;
  if (n < 2) return null;
  if (n === 2) {
    const [a, b] = pts;
    return `M${a[0]},${a[1]}L${b[0]},${b[1]}`;
  }

  const p = pts.map(([x, y]) => ({ x, y }));

  const get = (idx) => {
    if (idx < 0) {
      return { x: 2 * p[0].x - p[1].x, y: 2 * p[0].y - p[1].y };
    }
    if (idx >= n) {
      return { x: 2 * p[n - 1].x - p[n - 2].x, y: 2 * p[n - 1].y - p[n - 2].y };
    }
    return p[idx];
  };

  const r = (v) => Math.round(v * 100) / 100;

  const parts = [`M${r(p[0].x)},${r(p[0].y)}`];
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const cp1x = p1.x + (p2.x - p0.x) / tension;
    const cp1y = p1.y + (p2.y - p0.y) / tension;
    const cp2x = p2.x - (p3.x - p1.x) / tension;
    const cp2y = p2.y - (p3.y - p1.y) / tension;
    parts.push(
      `C${r(cp1x)},${r(cp1y)} ${r(cp2x)},${r(cp2y)} ${r(p2.x)},${r(p2.y)}`,
    );
  }
  return parts.join("");
}

/**
 * Chuỗi điểm trung tuyến → `d` SVG (đường cong Catmull-Rom / cubic).
 * @param {unknown} raw — thường là [[x,y], ...]
 * @returns {string|null}
 */
function medianPolylineToSmoothD(raw) {
  const pts = normalizeMedianPoints(raw);
  if (!pts) return null;
  return catmullRomToBezierD(pts);
}

/**
 * @param {{ id?: string|number, value?: unknown }[]} medians
 * @returns {string[]}
 */
function pathsFromMedians(medians) {
  if (!Array.isArray(medians)) return [];
  const out = [];
  for (const m of medians) {
    if (!m || String(m.id).endsWith("b")) continue;
    const d = medianPolylineToSmoothD(m.value);
    if (d) out.push(d);
  }
  return out;
}

/**
 * @param {'hiragana'|'katakana'} script
 * @param {string} char
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<string[]>}
 */
export async function loadKanaStrokePaths(script, char, opts = {}) {
  const key = cacheKey(script, char);
  if (cache.has(key)) {
    return cache.get(key).paths;
  }
  const folder = script === "hiragana" ? "hiragana" : "katakana";
  const enc = encodeURIComponent(char);
  const url = `${CDN_BASE}/${folder}/${enc}.json`;
  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok) {
    throw new Error(`stroke_fetch_${res.status}`);
  }
  const data = await res.json();
  const fromMedians = pathsFromMedians(data.medians);
  const paths =
    fromMedians.length > 0 ? fromMedians : filterStrokePaths(data.strokes);
  cache.set(key, { paths, fetchedAt: Date.now() });
  return paths;
}
