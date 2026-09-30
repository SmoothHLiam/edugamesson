// Small vector toolkit used to author the skeleton: splines, tapered tubes, blobs.
// Everything is authored in "lat / y" space (lat = distance from the body midline)
// and mapped to page x through CX + side * lat, so both sides share one definition.

export const CX = 450;

const r1 = (n) => Math.round(n * 10) / 10;
const fmt = (p) => `${r1(p[0])},${r1(p[1])}`;

/** Map lat/y to absolute coordinates for a side (-1 = viewer left, +1 = viewer right, 0 = midline). */
export const mapper = (s) => (lat, y) => [CX + (s || 1) * lat, y];

/** Catmull-Rom spline through pts, emitted as cubic Béziers. */
export function smoothPath(pts, closed = false) {
  const n = pts.length;
  if (n < 2) return '';
  const at = (i) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${fmt(pts[0])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${fmt(c1)} ${fmt(c2)} ${fmt(p2)}`;
  }
  return closed ? d + 'Z' : d;
}

export const polyPath = (pts, closed = true) =>
  'M' + pts.map(fmt).join('L') + (closed ? 'Z' : '');

function crPoint(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return [0, 1].map(
    (k) =>
      0.5 *
      (2 * p1[k] +
        (-p0[k] + p2[k]) * t +
        (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
        (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)
  );
}

/** Sample a Catmull-Rom spline through ctrl at n+1 arc-length-uniform points. */
export function sampleSpline(ctrl, n = 24) {
  if (ctrl.length === 2) {
    return Array.from({ length: n + 1 }, (_, i) => [
      ctrl[0][0] + ((ctrl[1][0] - ctrl[0][0]) * i) / n,
      ctrl[0][1] + ((ctrl[1][1] - ctrl[0][1]) * i) / n,
    ]);
  }
  const dense = [];
  const N = ctrl.length;
  for (let i = 0; i < N - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(N - 1, i + 2)];
    for (let j = 0; j < 24; j++) dense.push(crPoint(p0, p1, p2, p3, j / 24));
  }
  dense.push(ctrl[N - 1]);
  const cum = [0];
  for (let i = 1; i < dense.length; i++)
    cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const total = cum[cum.length - 1];
  const out = [];
  let j = 0;
  for (let i = 0; i <= n; i++) {
    const target = (total * i) / n;
    while (j < cum.length - 2 && cum[j + 1] < target) j++;
    const seg = cum[j + 1] - cum[j] || 1;
    const u = (target - cum[j]) / seg;
    out.push([dense[j][0] + (dense[j + 1][0] - dense[j][0]) * u, dense[j][1] + (dense[j + 1][1] - dense[j][1]) * u]);
  }
  return out;
}

const smoothstep = (u) => u * u * (3 - 2 * u);

/** Width profile: keys are [t, w] or [t, wLeft, wRight]. */
function widthFn(keys) {
  const k = keys.map((e) => (e.length === 2 ? [e[0], e[1], e[1]] : e));
  return (t) => {
    if (t <= k[0][0]) return [k[0][1], k[0][2]];
    for (let i = 0; i < k.length - 1; i++) {
      if (t <= k[i + 1][0]) {
        const u = smoothstep((t - k[i][0]) / (k[i + 1][0] - k[i][0]));
        return [k[i][1] + (k[i + 1][1] - k[i][1]) * u, k[i][2] + (k[i + 1][2] - k[i][2]) * u];
      }
    }
    const l = k[k.length - 1];
    return [l[1], l[2]];
  };
}

/**
 * A tapered tube along a spline: the workhorse for long bones, ribs, phalanges.
 * Returns the outline path, a flat "shade" sliver along the screen-right edge,
 * and a fat hit path for easy clicking.
 */
export function tube(ctrl, keys, opt = {}) {
  const { n = 26, cap0 = 0.55, cap1 = 0.55, shade = 0.34, hit = 14 } = opt;
  const cl = sampleSpline(ctrl, n);
  const W = widthFn(keys);
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const a = cl[Math.max(0, i - 1)], b = cl[Math.min(n, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const len = Math.hypot(tx, ty) || 1;
    tx /= len; ty /= len;
    const nx = -ty, ny = tx;
    const [wl, wr] = W(i / n);
    L.push([cl[i][0] + nx * wl, cl[i][1] + ny * wl]);
    R.push([cl[i][0] - nx * wr, cl[i][1] - ny * wr]);
  }
  const first = cl[0], last = cl[n];
  const t0 = [cl[0][0] - cl[1][0], cl[0][1] - cl[1][1]];
  const t1 = [cl[n][0] - cl[n - 1][0], cl[n][1] - cl[n - 1][1]];
  const n0 = Math.hypot(...t0) || 1, n1 = Math.hypot(...t1) || 1;
  const w0 = W(0), w1 = W(1);
  const capA = [first[0] + (t0[0] / n0) * (w0[0] + w0[1]) * cap0, first[1] + (t0[1] / n0) * (w0[0] + w0[1]) * cap0];
  const capB = [last[0] + (t1[0] / n1) * (w1[0] + w1[1]) * cap1, last[1] + (t1[1] / n1) * (w1[0] + w1[1]) * cap1];
  const outline = [...L, capB, ...R.slice().reverse(), capA];
  const d = smoothPath(outline, true);

  // shade sliver on the side that faces screen-right / down
  const avg = (arr) => arr.reduce((s, p) => s + p[0] + p[1] * 0.2, 0) / arr.length;
  const edge = avg(L) >= avg(R) ? L : R;
  const a = Math.floor(n * 0.05), b = Math.ceil(n * 0.95);
  const rim = [], inner = [];
  for (let i = a; i <= b; i++) {
    rim.push(edge[i]);
    inner.push([edge[i][0] + (cl[i][0] - edge[i][0]) * (1 - shade), edge[i][1] + (cl[i][1] - edge[i][1]) * (1 - shade)]);
  }
  const shadeD = smoothPath([...rim, ...inner.reverse()], true);

  return { d, shade: shadeD, hit: smoothPath(cl, false), hitW: hit, cl, first, last };
}

/** Organic blob; jit multiplies the radius around the loop for irregularity. */
export function blob(cx, cy, rx, ry, rot = 0, jit = [1], n = 10) {
  const pts = [];
  const cr = Math.cos(rot), sr = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const k = jit[i % jit.length];
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    pts.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return smoothPath(pts, true);
}

/** Super-ellipse: squarer than a blob, for vertebral bodies and orbits. */
export function squircle(cx, cy, rx, ry, pow = 3, rot = 0, n = 20) {
  const pts = [];
  const cr = Math.cos(rot), sr = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const c = Math.cos(a), s = Math.sin(a);
    const x = Math.sign(c) * Math.pow(Math.abs(c), 2 / pow) * rx;
    const y = Math.sign(s) * Math.pow(Math.abs(s), 2 / pow) * ry;
    pts.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return smoothPath(pts, true);
}

/** Closed symmetric outline from a half profile that starts and ends on the midline (lat = 0). */
export function sym(half) {
  const right = half.map(([l, y]) => [CX + l, y]);
  const left = half.slice(1, -1).reverse().map(([l, y]) => [CX - l, y]);
  return smoothPath([...right, ...left], true);
}

/** Same, but as a straight-edged polygon (for sharp suture lines). */
export function symPoly(half) {
  const right = half.map(([l, y]) => [CX + l, y]);
  const left = half.slice(1, -1).reverse().map(([l, y]) => [CX - l, y]);
  return polyPath([...right, ...left], true);
}

/** Side-aware closed spline through lat/y points. */
export function loop(s, pts) {
  const m = mapper(s);
  return smoothPath(pts.map(([l, y]) => m(l, y)), true);
}

/** Side-aware open spline. */
export function open(s, pts) {
  const m = mapper(s);
  return smoothPath(pts.map(([l, y]) => m(l, y)), false);
}

/**
 * Local coordinate frame for hands and feet: origin (lat0, y0), the long axis
 * points down and rotated `deg` toward lateral. u = across (lateral +), v = along.
 */
export function frame(lat0, y0, deg, s) {
  const a = (deg * Math.PI) / 180;
  const dl = Math.sin(a), dy = Math.cos(a), ll = Math.cos(a), ly = -Math.sin(a);
  return (u, v) => [CX + s * (lat0 + u * ll + v * dl), y0 + u * ly + v * dy];
}
