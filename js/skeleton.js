// Anterior view of the human skeleton, authored as vector geometry.
// Paired bones are defined once in lat/y space and mirrored. Each record is one
// drawable group; the renderer turns records into <g data-bone="..."> nodes.

import {
  CX, mapper, smoothPath, sampleSpline, tube, blob, squircle, sym, loop, open, frame, polyPath,
} from './geom.js';

export const VIEW = { w: 900, h: 1032 };

const SIDES = [-1, 1]; // -1 = viewer left (subject's right), the "primary" instance

export function buildSkeleton() {
  const out = [];
  const voids = [];
  const rims = [];

  /** Start a bone record. */
  function bone(id, side = 0, anchor = null) {
    const rec = { id, side, fills: [], lines: [], shades: [], details: [], hits: [], anchor };
    const api = {
      rec,
      fill(d, tone = 'bone') { rec.fills.push({ d, tone }); return api; },
      line(d, w, tone = 'cart') { rec.lines.push({ d, w, tone }); return api; },
      shade(d) { rec.shades.push(d); return api; },
      detail(d, w = 1) { rec.details.push({ d, w }); return api; },
      hit(d, w = 14) { rec.hits.push({ d, w }); return api; },
      tube(t, tone = 'bone', withShade = true) {
        rec.fills.push({ d: t.d, tone });
        if (withShade && t.shade) rec.shades.push(t.shade);
        if (t.hitW) rec.hits.push({ d: t.hit, w: t.hitW });
        return api;
      },
      at(x, y) { rec.anchor = [x, y]; return api; },
    };
    out.push(rec);
    return api;
  }

  /** Point on a sampled centerline (0..1) in absolute coords. */
  const along = (t, tb) => tb.cl[Math.round(t * (tb.cl.length - 1))];

  /* ------------------------------------------------------------------ */
  /* SCAPULA (behind everything, only the lateral part really shows)      */
  /* ------------------------------------------------------------------ */
  for (const s of SIDES) {
    const b = bone('scapula', s);
    b.fill(
      loop(s, [
        [42, 212], [52, 205], [66, 203], [78, 203], [86, 199], [95, 197], [98, 203], [91, 211],
        [95, 221], [91, 235], [82, 256], [75, 279], [67, 300], [57, 302], [49, 290], [45, 262], [41, 236],
      ])
    );
    // acromion + spine ridge
    b.fill(loop(s, [[74, 205], [92, 192], [107, 186], [113, 192], [106, 198], [92, 208]]));
    b.shade(loop(s, [[46, 240], [70, 222], [80, 250], [72, 282], [64, 298], [54, 288], [48, 262]]));
    b.detail(open(s, [[44, 224], [62, 218], [80, 212]]), 1.1);
    b.detail(open(s, [[60, 222], [66, 262], [64, 292]]), 0.9);
    if (s === -1) b.at(CX - 84, 246);
    else b.at(CX + 84, 246);
  }

  /* ------------------------------------------------------------------ */
  /* VERTEBRAL COLUMN                                                     */
  /* ------------------------------------------------------------------ */
  const vertebra = (b, y, hw, h, tpTo, tpW, tone = 'bone') => {
    for (const s of SIDES) {
      const m = mapper(s);
      const t = tube([m(hw * 0.5, y), m((hw + tpTo) / 2, y - 0.6), m(tpTo, y - 0.9)], [[0, tpW], [1, tpW * 0.6]], { n: 6, shade: 0, hit: 0 });
      b.fill(t.d, tone);
    }
    b.fill(squircle(CX, y, hw, h / 2, 3.2, 0, 18), tone);
    b.shade(
      polyPath([[CX + hw * 0.25, y - h / 2 + 1], [CX + hw - 1, y - h * 0.25], [CX + hw - 1, y + h * 0.25], [CX + hw * 0.25, y + h / 2 - 1]], true)
    );
  };

  const cv = bone('cervical', 0).at(CX - 6, 165);
  {
    const ys = [131, 139, 147.5, 156.5, 166, 176, 187.5];
    const hs = [6, 7, 7, 7.5, 8, 8.6, 9.6];
    const hw = [9, 6.5, 6.8, 7.3, 7.9, 8.5, 9.6];
    const tp = [22, 12, 12.5, 13.5, 15, 16.5, 20];
    ys.forEach((y, i) => vertebra(cv, y, hw[i], hs[i] + 0.6, tp[i], 2.6));
  }

  const tv = bone('thoracic', 0).at(CX - 5, 334);
  for (let i = 0; i < 12; i++) {
    const y = 202.5 + 12.6 * i;
    vertebra(tv, y, 9 + i * 0.28, 11.2, 19 + i * 0.1, 3);
  }

  const lv = bone('lumbar', 0).at(CX - 8, 402);
  {
    const hw = [13.5, 14, 14.5, 15, 16];
    const tp = [33, 37, 40, 38, 44];
    for (let i = 0; i < 5; i++) vertebra(lv, 358 + 22 * i, hw[i], 18.6, tp[i], i === 4 ? 6 : 4.2);
  }

  /* SACRUM + COCCYX */
  {
    const sc = bone('sacrum', 0).at(CX - 11, 484);
    sc.fill(sym([[0, 452], [20, 452], [32, 455], [35, 463], [32, 475], [26, 488], [19, 500], [12, 510], [6, 517], [0, 520]]));
    sc.shade(polyPath([[CX + 10, 456], [CX + 31, 460], [CX + 25, 488], [CX + 13, 508], [CX + 5, 516]]));
    [471.5, 482.5, 493.5].forEach((y, i) => sc.detail(`M${CX - 20 + i * 2},${y}H${CX + 20 - i * 2}`, 0.9));
    [[466, 12.5], [477, 11], [488, 9.2]].forEach(([y, l]) => {
      voids.push(blob(CX - l, y, 2.1, 2.4), blob(CX + l, y, 2.1, 2.4));
    });
    const cc = bone('coccyx', 0).at(CX - 3, 533);
    cc.fill(sym([[0, 519], [6, 520], [5.2, 528], [3.4, 536], [0, 543]]));
    cc.detail(`M${CX - 5},526H${CX + 5}`, 0.9);
    cc.detail(`M${CX - 3.6},533H${CX + 3.6}`, 0.9);
  }

  /* ------------------------------------------------------------------ */
  /* HIP BONES                                                            */
  /* ------------------------------------------------------------------ */
  for (const s of SIDES) {
    const ilium = bone('ilium', s);
    ilium.fill(
      loop(s, [
        [36, 414], [46, 401], [62, 393], [80, 394], [91, 403], [94, 416], [90, 428], [86, 437], [79, 442], [76, 450],
        [73, 459], [66, 468], [56, 468], [46, 464], [38, 466], [33, 456], [32, 438], [33, 424],
      ])
    );
    ilium.shade(loop(s, [[42, 410], [60, 401], [78, 405], [80, 420], [72, 434], [58, 444], [46, 442], [40, 426]]));
    ilium.detail(open(s, [[36, 456], [46, 468], [58, 474]]), 1);
    ilium.detail(open(s, [[62, 392], [76, 394], [86, 404]]), 1);
    ilium.fill(blob(...mapper(s)(50, 478), 17.5, 17.5, 0, [1], 14), 'bone-2');
    ilium.at(CX + s * 70, 418);

    const isch = bone('ischium', s).at(CX + s * 58, 522);
    isch.fill(
      loop(s, [
        [66, 482], [66, 500], [64, 516], [61, 530], [54, 539], [44, 539], [36, 534], [28, 524], [26, 512],
        [34, 504], [44, 498], [54, 494], [60, 486],
      ])
    );
    isch.shade(loop(s, [[60, 498], [64, 512], [60, 530], [52, 538], [44, 536], [52, 520]]));

    const pubis = bone('pubis', s).at(CX + s * 14, 500);
    pubis.fill(
      loop(s, [
        [56, 484], [46, 488], [30, 490], [14, 493], [3, 498], [1.5, 508], [3, 518], [10, 528], [20, 536],
        [28, 536], [30, 528], [22, 520], [20, 508], [30, 500], [42, 497], [54, 496],
      ])
    );
    voids.push(
      loop(s, [[29, 509], [35, 502], [44, 501], [50, 507], [50, 516], [45, 525], [38, 529], [32, 526], [28, 518]])
    );
  }

  /* ------------------------------------------------------------------ */
  /* RIBS + COSTAL CARTILAGE                                              */
  /* ------------------------------------------------------------------ */
  const ribW = [36, 50, 62, 71, 76, 79, 80, 80, 78, 74, 66, 56];
  const ribDrop = [14, 20, 30, 40, 48, 56, 62, 62, 60, 56, 46, 36];
  const ribEx = [22, 34, 42, 50, 56, 62, 66, 70, 72, 70, 58, 44];
  const stAttach = [207, 232, 246, 260, 274, 287, 297];
  const ribDefs = [];
  for (let i = 0; i < 12; i++) {
    const y0 = 205 + 12.6 * i, w = ribW[i], d = ribDrop[i], ex = ribEx[i];
    const ctrl = [
      [17, y0],
      [17 + 0.55 * (w - 17), y0 + 0.08 * d],
      [w, y0 + 0.36 * d],
      [ex + 0.55 * (w - ex), y0 + 0.72 * d],
      [ex, y0 + d],
    ];
    ribDefs.push({ i, ctrl, end: [ex, y0 + d] });
  }
  // cartilage centerlines (lat/y)
  const cartDefs = [];
  for (let i = 0; i < 7; i++) {
    const [ex, ey] = ribDefs[i].end;
    const sy = stAttach[i];
    const mid = [(ex + 9.5) / 2, (ey + sy) / 2 + (i > 1 ? 3 : 1)];
    cartDefs.push([[ex, ey], mid, [9.5, sy]]);
  }
  const cartPoint = (i, t) => sampleSpline(cartDefs[i], 12)[Math.round(t * 12)];
  for (let i = 7; i < 10; i++) {
    const [ex, ey] = ribDefs[i].end;
    const jj = cartPoint(i - 1, i === 7 ? 0.6 : 0.5);
    cartDefs.push([[ex, ey], [(ex + jj[0]) / 2 + 2, (ey + jj[1]) / 2 + 1], jj]);
  }
  // for rib 9 & 10 join the cartilage of the rib above, which is itself a rib 8/9 cartilage
  const ribGroup = (i) => (i < 7 ? 'true-ribs' : i < 10 ? 'false-ribs' : 'floating-ribs');

  for (const s of SIDES) {
    const m = mapper(s);
    const groups = { 'true-ribs': bone('true-ribs', s), 'false-ribs': bone('false-ribs', s), 'floating-ribs': bone('floating-ribs', s) };
    ribDefs.forEach((r) => {
      const tb = tube(r.ctrl.map(([l, y]) => m(l, y)), [[0, 3.8], [0.15, 4.6], [0.6, 4.9], [0.9, 4.5], [1, 5]], { n: 30, shade: 0.4, hit: 15, cap0: 0.4, cap1: 0.5 });
      groups[ribGroup(r.i)].tube(tb);
    });
    // anchors on rib 4 / 9 / 11 midpoints
    const mid = (i) => { const p = sampleSpline(ribDefs[i].ctrl.map(([l, y]) => m(l, y)), 10)[6]; return p; };
    groups['true-ribs'].at(...mid(5));
    groups['false-ribs'].at(...mid(8));
    groups['floating-ribs'].at(...mid(10));

    const cart = bone('costal-cartilage', s);
    cartDefs.forEach((c) => {
      const pts = c.map(([l, y]) => m(l, y));
      const cl = sampleSpline(pts, 16);
      cart.line(smoothPath(cl, false), 4.8, 'cart');
      cart.hit(smoothPath(cl, false), 11);
    });
    cart.at(...m(cartDefs[4][1][0], cartDefs[4][1][1]));
  }

  /* ------------------------------------------------------------------ */
  /* STERNUM                                                              */
  /* ------------------------------------------------------------------ */
  bone('manubrium', 0).at(CX - 5, 214).fill(sym([[0, 201], [8, 197.5], [13, 199.5], [14, 207], [12.5, 219], [10, 232], [0, 233.5]])).detail(`M${CX - 7},199.5Q${CX},203 ${CX + 7},199.5`, 0.8);
  {
    const b = bone('sternal-body', 0).at(CX - 4, 262);
    b.fill(sym([[0, 232], [9, 232], [9.5, 250], [9, 270], [10.5, 290], [0, 297]]));
    [250, 268, 282].forEach((y) => b.detail(`M${CX - 9},${y}H${CX + 9}`, 0.8));
  }
  bone('xiphoid', 0).at(CX - 1, 306).fill(sym([[0, 296], [6, 297], [4.5, 306], [0, 317]]));

  /* ------------------------------------------------------------------ */
  /* CLAVICLE                                                             */
  /* ------------------------------------------------------------------ */
  for (const s of SIDES) {
    const m = mapper(s);
    const t = tube([m(11, 201), m(36, 203.5), m(62, 197), m(86, 190.5), m(106, 191)], [[0, 5.2], [0.12, 4.2], [0.6, 3.6], [0.9, 4.4], [1, 4.6]], { n: 28, hit: 15, cap0: 0.5, cap1: 0.7 });
    bone('clavicle', s).tube(t).at(...along(0.45, t));
  }

  /* ------------------------------------------------------------------ */
  /* ARM                                                                  */
  /* ------------------------------------------------------------------ */
  for (const s of SIDES) {
    const m = mapper(s);
    const hu = bone('humerus', s);
    const shaft = tube([m(98, 232), m(102, 275), m(108, 330), m(112, 354)], [[0, 12], [0.1, 10], [0.5, 8.8], [0.88, 10], [1, 14]], { n: 28, hit: 14 });
    hu.tube(shaft);
    hu.fill(blob(...m(88, 218), 14.5, 14.5, 0, [1], 14));
    hu.fill(blob(...m(104, 224), 8, 11, 0.1, [1], 10));
    hu.fill(blob(...m(112, 362), 19, 9.5, 0, [1, 1, 1], 12));
    hu.fill(blob(...m(93, 357), 5.5, 7, 0, [1], 8));
    hu.fill(blob(...m(131, 358), 5, 6, 0, [1], 8));
    hu.detail(open(s, [[80, 210], [84, 206], [92, 205]]), 0.9);
    hu.at(...along(0.62, shaft));

    const ul = bone('ulna', s);
    const ut = tube([m(108, 362), m(110, 380), m(116, 430), m(121, 480), m(124, 504)], [[0, 12], [0.06, 9.6], [0.22, 6.2], [0.7, 4.4], [0.93, 5.6], [1, 6.2]], { n: 30, hit: 14 });
    ul.tube(ut);
    ul.fill(blob(...m(124, 508), 6, 5.2, 0, [1], 8));
    ul.fill(blob(...m(120, 514), 2.6, 4.6, 0, [1], 8));
    ul.fill(blob(...m(106, 368), 10, 10, 0, [1, 1.05], 10));
    ul.at(...along(0.72, ut));

    const ra = bone('radius', s);
    const rt = tube([m(124, 384), m(128, 420), m(136, 470), m(146, 503)], [[0, 3.8], [0.08, 4.4], [0.5, 5.6], [0.85, 8], [1, 11.5]], { n: 30, hit: 14 });
    ra.tube(rt);
    ra.fill(blob(...m(124, 378), 8.8, 4.8, s * 0.05, [1], 10));
    ra.fill(blob(...m(151, 508), 3.6, 6, s * -0.4, [1], 8));
    ra.at(...along(0.3, rt));
  }

  /* HAND ---------------------------------------------------------------- */
  for (const s of SIDES) {
    const F = frame(135, 516, 8.7, s);
    const uA = [F(1, 0)[0] - F(0, 0)[0], F(1, 0)[1] - F(0, 0)[1]];
    const vA = [F(0, 1)[0] - F(0, 0)[0], F(0, 1)[1] - F(0, 0)[1]];
    const sign = uA[0] * vA[1] - uA[1] * vA[0] > 0 ? 1 : -1;
    const baseAng = Math.atan2(uA[1], uA[0]);
    const fb = (u, v, rx, ry, rot = 0, jit = [1], n = 10) => {
      const c = F(u, v);
      return blob(c[0], c[1], rx, ry, baseAng + sign * rot, jit, n);
    };

    const carpals = [
      ['scaphoid', 9.5, 6, 5.4, 8.4, 0.55],
      ['lunate', 0, 3, 6.2, 5.4, 0],
      ['triquetrum', -9, 4.5, 5.2, 5.6, 0.2],
      ['pisiform', -13.6, 9.6, 3.2, 3.4, 0],
      ['trapezium', 13.6, 15.5, 5.2, 5.8, 0.4],
      ['trapezoid', 6, 16, 4.3, 4.8, 0],
      ['capitate', -1.6, 15.8, 5.6, 7, 0],
      ['hamate', -10, 15.5, 5.6, 6.2, -0.2],
    ];
    carpals.forEach(([id, u, v, rx, ry, rot]) => {
      bone(id, s).fill(fb(u, v, rx, ry, rot, [1, 0.95, 1.05, 1], 9)).at(...F(u, v));
    });

    const mc = bone('metacarpals', s);
    const ph = bone('hand-phalanges', s);
    const fingers = [
      { u: 8.5, a: 5, len: [38, 21, 13, 11] },
      { u: 1.5, a: 1, len: [40, 24, 15, 12] },
      { u: -5.5, a: -3, len: [36, 22, 14, 11.5] },
      { u: -12.5, a: -9, len: [33, 16, 9, 10] },
    ];
    const bones = [];
    const pos = (f, d) => {
      const r = (f.a * Math.PI) / 180;
      return F(f.u + Math.sin(r) * d, 21 + Math.cos(r) * d);
    };
    fingers.forEach((f, fi) => {
      let d = 0;
      f.len.forEach((L, k) => {
        const g = 1.6;
        const p0 = pos(f, d + (k ? g : 0)), p1 = pos(f, d + L - g * 0.4), pm = pos(f, d + L / 2);
        const isMc = k === 0;
        const keys = isMc ? [[0, 4.4], [0.18, 3.1], [0.75, 3.0], [1, 4.2]] : k === 3 ? [[0, 3.2], [0.5, 2.3], [1, 1.5]] : [[0, 3.3], [0.3, 2.4], [0.7, 2.4], [1, 3.0]];
        const t = tube([p0, pm, p1], keys, { n: 10, hit: isMc ? 10 : 9, shade: isMc ? 0.4 : 0 });
        (isMc ? mc : ph).tube(t);
        if (fi === 1 && k === 1) ph.at(...pm);
        if (fi === 1 && k === 0) mc.at(...pos(f, d + L * 0.6));
        d += L;
      });
    });
    // thumb: three chained segments that curl slightly toward the fingers
    {
      let p = [12.5, 11];
      const segs = [
        { len: 27, a: 33, keys: [[0, 5], [0.2, 3.8], [0.75, 3.7], [1, 5]], mc: true },
        { len: 18, a: 27, keys: [[0, 4.6], [0.3, 3.4], [0.7, 3.4], [1, 4]], mc: false },
        { len: 14, a: 20, keys: [[0, 3.8], [0.5, 2.8], [1, 1.7]], mc: false },
      ];
      segs.forEach((sg, k) => {
        const r = (sg.a * Math.PI) / 180;
        const g = k ? 1.6 : 0;
        const q0 = [p[0] + Math.sin(r) * g, p[1] + Math.cos(r) * g];
        const q1 = [p[0] + Math.sin(r) * sg.len, p[1] + Math.cos(r) * sg.len];
        const qm = [(q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2];
        const t = tube([F(...q0), F(...qm), F(...q1)], sg.keys, { n: 10, hit: 10, shade: sg.mc ? 0.4 : 0 });
        (sg.mc ? mc : ph).tube(t);
        p = q1;
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* LEG                                                                  */
  /* ------------------------------------------------------------------ */
  for (const s of SIDES) {
    const m = mapper(s);
    const fe = bone('femur', s);
    const shaft = tube([m(72, 505), m(66, 545), m(58, 610), m(48, 668), m(44, 682)], [[0, 11], [0.12, 9], [0.6, 8], [0.86, 10.5], [1, 19]], { n: 30, hit: 16 });
    fe.tube(shaft);
    fe.fill(blob(...m(50, 478), 13.5, 13.5, 0, [1], 14));
    fe.fill(tube([m(54, 482), m(66, 490), m(76, 497)], [[0, 8.5], [0.5, 7], [1, 9.5]], { n: 8, shade: 0, hit: 0 }).d);
    fe.fill(blob(...m(82, 491), 9.5, 15, 0.1, [1, 1.05, 0.95], 10));
    fe.fill(blob(...m(32, 676), 11, 14, 0, [1], 12));
    fe.fill(blob(...m(57, 676), 11, 14, 0, [1], 12));
    fe.detail(open(s, [[44, 690], [44, 683]]), 1);
    fe.at(...along(0.4, shaft));

    const pa = bone('patella', s);
    pa.fill(loop(s, [[34, 661], [44, 655], [54, 661], [53, 674], [44, 685], [35, 674]]));
    pa.shade(loop(s, [[46, 658], [53, 662], [52, 673], [45, 682]]));
    pa.at(...m(44, 668));

    const ti = bone('tibia', s);
    const tt = tube([m(44, 703), m(43, 745), m(41, 820), m(39, 885), m(38, 902)], [[0, 17], [0.06, 14], [0.2, 10], [0.55, 8], [0.85, 9.5], [1, 15]], { n: 30, hit: 16 });
    ti.tube(tt);
    ti.fill(blob(...m(31, 697), 13.5, 6.8, 0, [1], 10));
    ti.fill(blob(...m(57, 697), 13, 6.8, 0, [1], 10));
    ti.fill(blob(...m(28, 903), 6.5, 9, -0.15 * s, [1], 8));
    ti.detail(open(s, [[44, 694], [44, 689]]), 1.2);
    ti.at(...along(0.3, tt));

    const fi = bone('fibula', s);
    const ft = tube([m(65, 716), m(63, 780), m(60, 850), m(58, 892)], [[0, 5.5], [0.1, 3.6], [0.6, 3.4], [0.9, 5], [1, 7]], { n: 26, hit: 12 });
    fi.tube(ft);
    fi.fill(blob(...m(66, 708), 7, 9, 0, [1], 9));
    fi.fill(blob(...m(58, 902), 6.5, 14, 0.08 * s, [1], 10));
    fi.at(...along(0.75, ft));
  }

  /* FOOT ---------------------------------------------------------------- */
  for (const s of SIDES) {
    const F = frame(43, 908, 10, s);
    const uA = [F(1, 0)[0] - F(0, 0)[0], F(1, 0)[1] - F(0, 0)[1]];
    const vA = [F(0, 1)[0] - F(0, 0)[0], F(0, 1)[1] - F(0, 0)[1]];
    const sign = uA[0] * vA[1] - uA[1] * vA[0] > 0 ? 1 : -1;
    const baseAng = Math.atan2(uA[1], uA[0]);
    const fb = (u, v, rx, ry, rot = 0, jit = [1], n = 10) => {
      const c = F(u, v);
      return blob(c[0], c[1], rx, ry, baseAng + sign * rot, jit, n);
    };

    bone('calcaneus', s).at(...F(15, 12)).fill(fb(15, 11, 8.6, 14, 0.06, [1, 1.04, 0.96], 10));
    {
      const b = bone('talus', s).at(...F(-1, 5));
      b.fill(fb(-1, 2.5, 10.5, 8.6, 0, [1, 1.05, 0.95], 10));
      b.fill(fb(-5.5, 14, 7.6, 6.2, 0.25, [1], 9));
    }
    bone('navicular', s).at(...F(-8, 26)).fill(fb(-8, 26, 9.5, 4.4, 0.12, [1], 9));
    bone('cuboid', s).at(...F(15, 32)).fill(fb(15, 32, 8.4, 7, 0, [1, 0.96], 9));
    {
      const b = bone('cuneiforms', s).at(...F(-15, 37));
      b.fill(fb(-15, 37, 5.8, 6.2, 0.1, [1], 9));
      b.fill(fb(-6.2, 36.5, 4.6, 5, 0, [1], 9));
      b.fill(fb(2.6, 36.5, 4.8, 5.2, 0, [1], 9));
    }

    const mt = bone('metatarsals', s);
    const ph = bone('foot-phalanges', s);
    const bases = [-15.5, -6.8, 1.6, 10.2, 19.4];
    const heads = [-25, -13, -1.5, 10.5, 22];
    const headV = [76, 78, 75.5, 72.5, 69.5];
    bases.forEach((bu, i) => {
      const hv = headV[i];
      const p0 = F(bu, 42.5), p1 = F(heads[i], hv), pm = F((bu + heads[i]) / 2, (42.5 + hv) / 2);
      const keys = i === 0 ? [[0, 6.4], [0.2, 5.2], [0.8, 5.2], [1, 6.6]] : [[0, 4.4], [0.2, 3.1], [0.8, 3.0], [1, 4.0]];
      const t = tube([p0, pm, p1], keys, { n: 10, hit: 10 });
      mt.tube(t);
      if (i === 2) mt.at(...pm);

      const g = 1.6;
      const lens = i === 0 ? [15, 12] : [10.5 - i * 0.6, 6.5 - i * 0.3, 5];
      const fan = [-0.16, -0.08, 0.0, 0.08, 0.16][i];
      let u = heads[i];
      let v = hv + g;
      lens.forEach((L, k) => {
        const du = fan * L;
        const q0 = F(u, v), q1 = F(u + du, v + L), qm = F(u + du / 2, v + L / 2);
        const isLast = k === lens.length - 1;
        const w = i === 0 ? 1 : 0.62;
        const keys2 = isLast ? [[0, 4.6 * w + 0.6], [0.5, 3.6 * w + 0.4], [1, 1.6]] : [[0, 4.8 * w + 0.6], [0.5, 3.6 * w + 0.4], [1, 4.2 * w + 0.4]];
        const t2 = tube([q0, qm, q1], keys2, { n: 8, hit: 9, shade: 0 });
        ph.tube(t2);
        if (i === 0 && k === 0) ph.at(...qm);
        u += du;
        v += L + g;
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* SKULL (drawn last so the mandible sits in front of the neck)         */
  /* ------------------------------------------------------------------ */
  const orbitLat = 20.5, orbitY = 78.5;

  {
    const b = bone('parietal', 0).at(CX - 18, 25);
    b.fill(sym([[0, 17], [17, 19], [30, 27.5], [37.5, 41], [40, 52], [35.5, 48.5], [26, 39.5], [12.5, 33], [0, 30.5]]));
    b.shade(polyPath([[CX + 26, 24], [CX + 36, 37], [CX + 40, 51], [CX + 35, 47.5], [CX + 30, 35]]));
  }
  {
    const b = bone('frontal', 0).at(CX - 17, 49);
    b.fill(sym([[0, 30.5], [12.5, 33], [26, 39.5], [35.5, 48.5], [37, 58], [37, 69], [38.5, 76], [32, 79.5], [22, 79], [11, 76.5], [5, 72.5], [0, 69.5]]));
    b.shade(polyPath([[CX + 28, 43], [CX + 35.5, 52], [CX + 37, 68], [CX + 38.5, 75], [CX + 33, 78], [CX + 33, 66], [CX + 31.5, 53]]));
    for (const s of SIDES) b.detail(open(s, [[35, 74], [28, 66.5], [20, 64], [11.5, 66.5], [6, 70.5]]), 0.9);
  }
  for (const s of SIDES) {
    bone('temporal', s).at(...mapper(s)(40, 70)).fill(loop(s, [[40, 52], [42.5, 60], [43, 75], [41.5, 88], [37.5, 92], [34.5, 86], [35.5, 72], [36.5, 59]]));
  }
  for (const s of SIDES) {
    bone('zygomatic', s).at(...mapper(s)(36, 95)).fill(loop(s, [[36.5, 76], [41, 83], [41, 94], [35.5, 100.5], [28.5, 100.5], [25, 94], [22.5, 88.5], [25, 82], [30, 78.5]]));
  }
  bone('nasal', 0).at(CX - 3.5, 78).fill(sym([[0, 68], [4.6, 69], [7, 78], [8.6, 88.5], [0, 90.5]]));
  {
    const mx = bone('maxilla', 0).at(CX - 15, 103);
    mx.fill(sym([[0, 76], [6, 76], [12.5, 80.5], [19, 85], [23.5, 91], [26, 101], [24.5, 110], [21, 116], [0, 117.5]]));
    mx.shade(polyPath([[CX + 13, 82], [CX + 23, 90], [CX + 25.5, 101], [CX + 23, 112], [CX + 16, 116], [CX + 16, 100]]));
    const widths = [3.2, 2.9, 3.2, 3, 3, 3.6, 3.6];
    let x = 0;
    widths.forEach((w, i) => {
      const top = 114, bot = i < 2 ? 121.8 : i === 2 ? 122.4 : i < 5 ? 121 : 120;
      for (const s of SIDES) {
        const a = CX + s * x, b = CX + s * (x + w);
        mx.fill(toothPath(Math.min(a, b) + 0.25, Math.max(a, b) - 0.25, top, bot), 'tooth');
      }
      x += w;
    });
  }
  {
    const md = bone('mandible', 0).at(CX - 30, 112);
    md.fill(sym([[0, 129.5], [11, 129.2], [19.5, 127.5], [24.5, 120], [26.5, 109], [27.5, 98], [32, 95.5], [33.5, 101], [32.5, 112], [30, 122], [26, 130.5], [19, 137.5], [11, 142.5], [0, 144.5]]));
    md.shade(polyPath([[CX + 20, 133], [CX + 31, 121], [CX + 26, 131], [CX + 17, 139]], true));
    const widths = [2.8, 2.8, 3.1, 3.2, 3.2, 3.7, 3.7];
    let x = 0;
    widths.forEach((w, i) => {
      const top = 122.2, bot = i < 2 ? 129.8 : 129.5;
      for (const s of SIDES) {
        const a = CX + s * x, b = CX + s * (x + w);
        md.fill(toothPath(Math.min(a, b) + 0.25, Math.max(a, b) - 0.25, top, bot), 'tooth');
      }
      x += w;
    });
  }

  // skull voids: orbits (with a bevelled rim), nasal aperture, small foramina
  for (const s of SIDES) {
    rims.push(squircle(CX + s * orbitLat, orbitY, 12.4, 11.8, 2.4, s * 0.18, 22));
    voids.push(squircle(CX + s * orbitLat, orbitY, 10.6, 10, 2.4, s * 0.18, 22));
    voids.push(blob(CX + s * 16, 94, 1.1, 0.95), blob(CX + s * 15.5, 63.5, 0.9, 0.8));
  }
  voids.push(sym([[0, 90], [4.6, 92], [8.4, 99.5], [9.4, 107], [5.6, 111.5], [0, 109.5]]));

  return { bones: out, voids, rims };
}

function toothPath(x0, x1, y0, y1) {
  const r = Math.min(1.6, (x1 - x0) / 2.2);
  return `M${x0 + r},${y0}H${x1 - r}Q${x1},${y0} ${x1},${y0 + r}V${y1 - r * 1.4}Q${x1},${y1} ${x1 - r},${y1}H${x0 + r}Q${x0},${y1} ${x0},${y1 - r * 1.4}V${y0 + r}Q${x0},${y0} ${x0 + r},${y0}Z`;
}

/** Serialise records to SVG markup. Groups carry data-bone; layers keep z-order. */
export function renderMarkup(build) {
  const tones = { bone: 'f-bone', 'bone-2': 'f-bone2', cart: 'f-cart', tooth: 'f-tooth' };
  let html = '';
  build.bones.forEach((b) => {
    const attrs = `class="bone" data-bone="${b.id}" data-side="${b.side}"`;
    let g = '';
    // outline (knock-out) pass
    b.fills.forEach((f) => (g += `<path class="o${f.tone === 'tooth' ? ' thin' : ''}" d="${f.d}"/>`));
    b.lines.forEach((l) => (g += `<path class="o ol" d="${l.d}" style="stroke-width:${l.w + 3}"/>`));
    b.fills.forEach((f) => (g += `<path class="f ${tones[f.tone] || 'f-bone'}" d="${f.d}"/>`));
    b.lines.forEach((l) => (g += `<path class="fl ${tones[l.tone] || 'f-cart'}" d="${l.d}" style="stroke-width:${l.w}"/>`));
    b.shades.forEach((d) => (g += `<path class="s" d="${d}"/>`));
    b.details.forEach((x) => x.w && (g += `<path class="d" d="${x.d}" style="stroke-width:${x.w}"/>`));
    b.hits.forEach((h) => (g += `<path class="hit" d="${h.d}" style="stroke-width:${h.w}"/>`));
    html += `<g ${attrs}>${g}</g>`;
  });
  return {
    bones: html,
    rims: build.rims.map((d) => `<path d="${d}"/>`).join(''),
    voids: build.voids.map((d) => `<path d="${d}"/>`).join(''),
  };
}
