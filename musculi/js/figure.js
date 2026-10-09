// Front and back muscle plates, authored as vector geometry.
// Points are written in "lat / y" space (distance from the body midline, page y) and
// mirrored for each side, then placed on the page around the centre of their view.
// Records carry the view they belong to, so one muscle can be drawn on both figures.

import { smoothPath, tube } from '/engine/geom.js';

export const VIEW = { w: 1260, h: 1032 };
export const CENTRES = { front: 380, back: 880 };

const SIDES = [-1, 1];
const TONES = { m: 'f-m', m2: 'f-m2', tendon: 'f-tendon', skin: 'f-skin', skin2: 'f-skin2' };

export function buildMuscles() {
  const bones = [];

  /** Place lat/y points on the page for one side of one view. */
  const place = (c, s, pts) => pts.map(([l, y]) => [c + s * l, y]);

  /** A band on the screen-right edge of a closed outline, for a flat bit of relief. */
  function sliver(pts) {
    const n = pts.length;
    const xc = pts.reduce((a, p) => a + p[0], 0) / n;
    const yc = pts.reduce((a, p) => a + p[1], 0) / n;
    let k = 0;
    pts.forEach((p, i) => { if (p[0] < pts[k][0]) k = i; });
    const rot = [...pts.slice(k), ...pts.slice(0, k)];
    const rim = rot.filter((p) => p[0] > xc + 1);
    if (rim.length < 3) return '';
    const inner = rim.map((p) => [p[0] + (xc - p[0]) * 0.2, p[1] + (yc - p[1]) * 0.2]).reverse();
    return smoothPath([...rim, ...inner], true);
  }

  /** Start a record. `inert` records are silhouette only: drawn, never asked about. */
  function rec(id, side, view, o = {}) {
    const r = { id, side, view, inert: !!o.inert, fills: [], shades: [], details: [], anchor: null };
    bones.push(r);
    return r;
  }

  const c = (view) => CENTRES[view];

  /** A muscle belly from a closed loop of lat/y points. */
  function belly(id, view, pts, o = {}) {
    const cx = c(view);
    for (const s of SIDES) {
      const r = rec(id, s, view);
      const abs = place(cx, s, pts);
      r.fills.push({ d: smoothPath(abs, true), tone: o.tone || 'm' });
      if (o.shade !== false) { const sh = sliver(abs); if (sh) r.shades.push(sh); }
      (o.lines || []).forEach((lp) => r.details.push({ d: smoothPath(place(cx, s, lp), false), w: 1 }));
      (o.segs || []).forEach((lp) => r.details.push({ d: `M${place(cx, s, lp).map((p) => p.join(',')).join('L')}`, w: 1 }));
      if (o.at) r.anchor = [cx + s * o.at[0], o.at[1]];
    }
  }

  /** A muscle that follows a limb centre line. */
  function strap(id, view, ctrl, keys, o = {}) {
    const cx = c(view);
    for (const s of SIDES) {
      const r = rec(id, s, view);
      const t = tube(place(cx, s, ctrl), keys, { n: o.n || 20, shade: o.shade ?? 0.34, hit: 0, cap0: o.cap0 ?? 0.5, cap1: o.cap1 ?? 0.5 });
      r.fills.push({ d: t.d, tone: o.tone || 'm' });
      if (t.shade && o.shade !== 0) r.shades.push(t.shade);
      (o.lines || []).forEach((lp) => r.details.push({ d: smoothPath(place(cx, s, lp), false), w: 1 }));
      if (o.at) r.anchor = [cx + s * o.at[0], o.at[1]];
    }
  }

  /* ---------------- silhouette: head, torso, legs, arms, hands ---------------- */
  function silhouette(view) {
    const cx = c(view);
    const sym = (id, half, tone = 'skin') => {
      const right = half.map(([l, y]) => [cx + l, y]);
      const left = half.slice(1, -1).reverse().map(([l, y]) => [cx - l, y]);
      const r = rec(id, 0, view, { inert: true });
      r.fills.push({ d: smoothPath([...right, ...left], true), tone });
    };
    sym('body', [
      [0, 108], [18, 110], [22, 134], [40, 150], [84, 160], [112, 172], [126, 190], [120, 226], [100, 262], [86, 330],
      [74, 390], [78, 440], [92, 478], [100, 520], [96, 580], [88, 650], [76, 715], [68, 745], [74, 800], [72, 850],
      [58, 905], [48, 950], [56, 985], [62, 1006], [50, 1014], [14, 1014], [16, 990], [22, 952], [28, 880], [34, 830],
      [32, 775], [30, 745], [26, 690], [22, 610], [14, 550], [7, 522], [0, 514],
    ]);
    sym('head', [[0, 18], [20, 20], [33, 38], [37, 64], [33, 92], [22, 112], [10, 122], [0, 124]], 'skin2');
    for (const s of SIDES) {
      const r = rec('arm', s, view, { inert: true });
      const up = tube(place(cx, s, [[120, 190], [134, 290], [147, 395]]), [[0, 26], [0.5, 22], [1, 17]], { n: 14, shade: 0, hit: 0 });
      const lo = tube(place(cx, s, [[147, 395], [153, 470], [160, 565]]), [[0, 17], [0.4, 15], [1, 9]], { n: 14, shade: 0, hit: 0 });
      const hand = tube(place(cx, s, [[160, 560], [165, 610], [168, 652]]), [[0, 10], [0.45, 14], [1, 5]], { n: 10, shade: 0, hit: 0 });
      [up.d, lo.d, hand.d].forEach((d) => r.fills.push({ d, tone: 'skin' }));
    }
  }

  /* ---------------- FRONT ---------------- */
  silhouette('front');

  // quadriceps, drawn as three parts that fold into one at Core
  belly('vastus-lateralis', 'front', [[64, 512], [90, 506], [99, 560], [94, 640], [84, 708], [70, 732], [60, 716], [66, 650], [68, 570]], {
    lines: [[[76, 540], [84, 640], [74, 715]]], at: [86, 600],
  });
  belly('vastus-medialis', 'front', [[40, 580], [46, 620], [52, 676], [58, 722], [62, 740], [40, 744], [28, 720], [28, 672], [32, 620]], {
    tone: 'm2', lines: [[[40, 640], [46, 700]]], at: [42, 700],
  });
  belly('rectus-femoris', 'front', [[48, 512], [62, 516], [68, 570], [66, 650], [60, 716], [50, 718], [44, 650], [42, 570]], {
    lines: [[[55, 530], [56, 620], [54, 700]]], at: [55, 600],
  });
  strap('sartorius', 'front', [[80, 494], [58, 560], [42, 650], [34, 732]], [[0, 5.5], [0.5, 5], [1, 4]], { tone: 'm2', n: 22, at: [56, 566] });
  belly('adductors', 'front', [[8, 528], [26, 536], [40, 562], [36, 620], [26, 652], [14, 604], [8, 562]], {
    tone: 'm2', lines: [[[16, 548], [24, 620]], [[26, 548], [30, 620]]], at: [24, 590],
  });

  // lower leg, front
  strap('tibialis', 'front', [[50, 770], [50, 850], [42, 935]], [[0, 9], [0.4, 8], [1, 3]], { at: [46, 880] });
  belly('gastrocnemius', 'front', [[60, 758], [74, 772], [80, 820], [72, 880], [60, 886], [57, 810]], {
    lines: [[[68, 780], [70, 850]]], at: [70, 800],
  });

  // trunk
  belly('abdominal', 'front', [[2, 270], [30, 272], [35, 330], [31, 400], [25, 450], [16, 480], [2, 472]], {
    segs: [[[2, 306], [33, 306]], [[2, 346], [34, 346]], [[2, 388], [31, 388]], [[2, 430], [27, 430]]], at: [17, 345],
  });
  belly('oblique', 'front', [[36, 274], [62, 262], [86, 270], [90, 312], [88, 364], [84, 420], [76, 468], [58, 462], [48, 430], [42, 380], [38, 320]], {
    lines: [[[50, 300], [78, 340]], [[50, 330], [78, 376]], [[52, 362], [78, 410]]], at: [64, 360],
  });
  belly('serratus', 'front', [[88, 232], [100, 230], [102, 262], [96, 288], [86, 270]], {
    tone: 'm2', lines: [[[90, 244], [98, 248]], [[90, 258], [98, 262]]], at: [94, 258],
  });
  belly('pectoralis', 'front', [[3, 180], [40, 174], [78, 180], [104, 192], [98, 214], [84, 234], [60, 252], [32, 262], [3, 256]], {
    lines: [[[6, 200], [96, 200]], [[6, 224], [88, 220]], [[6, 244], [66, 244]]], at: [44, 218],
  });
  strap('sternocleidomastoid', 'front', [[34, 110], [22, 140], [8, 172]], [[0, 5], [0.5, 6], [1, 4]], { tone: 'm2', at: [22, 140] });
  belly('trapezius', 'front', [[24, 138], [60, 158], [100, 170], [98, 182], [58, 176], [28, 160]], { at: [60, 166] });

  // arm, front
  belly('deltoid', 'front', [[100, 182], [122, 174], [142, 188], [148, 214], [144, 248], [134, 272], [124, 254], [112, 226], [103, 204]], {
    lines: [[[122, 184], [126, 250]]], at: [132, 214],
  });
  belly('biceps', 'front', [[123, 266], [137, 262], [145, 300], [147, 350], [143, 376], [134, 372], [128, 340], [124, 300]], {
    lines: [[[134, 276], [138, 350]]], at: [136, 320],
  });
  strap('forearm-flexors', 'front', [[147, 398], [152, 460], [160, 552]], [[0, 16], [0.35, 14], [1, 6]], {
    tone: 'm2', lines: [[[146, 420], [154, 520]]], at: [152, 450],
  });

  /* ---------------- BACK ---------------- */
  silhouette('back');

  belly('hamstrings', 'back', [[18, 560], [56, 556], [90, 552], [86, 620], [78, 700], [68, 744], [42, 748], [30, 700], [22, 620]], {
    lines: [[[48, 570], [52, 650], [50, 735]]], at: [60, 650],
  });
  belly('gastrocnemius', 'back', [[26, 756], [70, 752], [80, 792], [74, 850], [58, 902], [46, 902], [28, 850], [22, 794]], {
    lines: [[[50, 760], [52, 840], [51, 898]]], at: [58, 820],
  });
  belly('soleus', 'back', [[34, 884], [64, 884], [68, 922], [60, 952], [44, 952], [36, 922]], {
    tone: 'm2', at: [52, 920],
  });
  for (const s of SIDES) { // Achilles tendon
    const r = rec('achilles', s, 'back', { inert: true });
    const t = tube(place(c('back'), s, [[52, 900], [52, 930], [50, 962]]), [[0, 6], [1, 4]], { n: 6, shade: 0, hit: 0 });
    r.fills.push({ d: t.d, tone: 'tendon' });
  }
  belly('gluteus', 'back', [[2, 454], [44, 440], [84, 452], [98, 490], [92, 532], [60, 558], [24, 552], [2, 522]], {
    lines: [[[10, 470], [60, 500], [86, 530]], [[10, 494], [50, 520], [70, 548]]], at: [52, 504],
  });
  belly('infraspinatus', 'back', [[50, 200], [82, 196], [92, 214], [84, 242], [58, 248], [46, 226]], {
    tone: 'm2', lines: [[[56, 214], [86, 214]], [[54, 230], [82, 232]]], at: [70, 222],
  });
  belly('teres-major', 'back', [[80, 248], [106, 240], [114, 262], [102, 276], [84, 268]], { tone: 'm2', at: [98, 258] });
  belly('latissimus', 'back', [[100, 266], [86, 258], [58, 268], [38, 302], [22, 362], [14, 432], [40, 456], [68, 424], [84, 362], [93, 312]], {
    lines: [[[30, 330], [82, 290]], [[24, 380], [80, 336]], [[24, 420], [70, 390]]], at: [58, 346],
  });
  belly('trapezius', 'back', [[1, 114], [22, 132], [60, 158], [98, 176], [86, 198], [52, 252], [24, 302], [1, 336]], {
    lines: [[[2, 140], [40, 200], [56, 250]], [[22, 150], [60, 176]], [[2, 200], [28, 262]]], at: [32, 214],
  });
  belly('deltoid', 'back', [[98, 180], [122, 172], [142, 188], [148, 218], [142, 250], [130, 268], [118, 248], [106, 214]], {
    lines: [[[120, 182], [126, 250]]], at: [132, 214],
  });
  belly('triceps', 'back', [[120, 268], [136, 262], [148, 296], [152, 340], [148, 376], [138, 382], [128, 354], [123, 310]], {
    lines: [[[132, 278], [140, 360]], [[142, 284], [146, 350]]], at: [138, 322],
  });
  strap('forearm-extensors', 'back', [[147, 398], [152, 460], [160, 552]], [[0, 16], [0.35, 14], [1, 6]], {
    tone: 'm2', lines: [[[146, 420], [154, 520]]], at: [152, 450],
  });

  return { bones, voids: [], rims: [] };
}

export function renderMarkup(build) {
  let html = '';
  build.bones.forEach((b) => {
    const attrs = `class="bone" data-bone="${b.id}" data-side="${b.side}" data-view="${b.view}"${b.inert ? ' data-inert="1"' : ''}`;
    let g = '';
    b.fills.forEach((f) => (g += `<path class="o" d="${f.d}"/>`));
    b.fills.forEach((f) => (g += `<path class="f ${TONES[f.tone] || 'f-m'}" d="${f.d}"/>`));
    b.shades.forEach((d) => (g += `<path class="s" d="${d}"/>`));
    b.details.forEach((x) => (g += `<path class="d" d="${x.d}" style="stroke-width:${x.w}"/>`));
    html += `<g ${attrs}>${g}</g>`;
  });
  return { bones: html, rims: '', voids: '' };
}
