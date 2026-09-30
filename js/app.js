import { buildSkeleton, renderMarkup } from './skeleton.js';
import { BY_ID, LEVELS, REGIONS, resolve, questionSet, judge } from './data.js';

/* ------------------------------------------------------------------ */
/* helpers                                                              */
/* ------------------------------------------------------------------ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, txt) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
};
const pad2 = (n) => String(n).padStart(2, '0');
const fmtTime = (s) => `${Math.floor(s / 60)}:${pad2(Math.floor(s % 60))}`;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SVGNS = 'http://www.w3.org/2000/svg';
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

/* ------------------------------------------------------------------ */
/* state                                                                */
/* ------------------------------------------------------------------ */
const cfg = { mode: 'type', level: 1, region: 'all', clock: 0, ...(store.get('ossa.cfg') || {}) };
if (!LEVELS[cfg.level] || !REGIONS[cfg.region] || ![0, 120, 300].includes(cfg.clock) || !['type', 'choose', 'locate'].includes(cfg.mode)) {
  Object.assign(cfg, { mode: 'type', level: 1, region: 'all', clock: 0 });
}
let run = null;
let phase = 'idle'; // idle | ask | feedback | done
let selected = null;
let hoverKey = null;
let timer = 0;
let nextGuard = 0;

/* ------------------------------------------------------------------ */
/* DOM                                                                  */
/* ------------------------------------------------------------------ */
const app = $('#app');
const stage = $('#stage');
const sk = $('#sk');
const ghost = $('#ghost');
const pins = $('#pins');
const pinLine = $('#pin-line');
const pinRing = $('#pin-ring');
const pinDot = $('#pin-dot');
const chip = $('#chip');
const tip = $('#tip');
const readout = $('#readout');
const listBody = $('#list-body');

/* ------------------------------------------------------------------ */
/* skeleton                                                             */
/* ------------------------------------------------------------------ */
const build = buildSkeleton();
const markup = renderMarkup(build);
sk.innerHTML = `<g class="layer-bones">${markup.bones}</g><g class="layer-hl"></g><g class="layer-rims">${markup.rims}</g><g class="layer-voids">${markup.voids}</g>`;
ghost.innerHTML = `<g class="layer-bones">${markup.bones}</g>`;
const layerBones = $('.layer-bones', sk);
const layerHl = $('.layer-hl', sk);
const groups = $$('.bone', layerBones);

const anchors = {};
build.bones.forEach((r) => {
  if (r.anchor && r.side <= 0 && !anchors[r.id]) anchors[r.id] = r.anchor;
});
const ANCHOR_VIA = { skull: 'frontal', spine: 'lumbar', sternum: 'sternal-body', ribs: 'true-ribs', pelvis: 'ilium', 'hip-bone': 'ilium', carpals: 'capitate', tarsals: 'cuboid' };
function anchorFor(key) {
  if (anchors[key]) return anchors[key];
  if (anchors[ANCHOR_VIA[key]]) return anchors[ANCHOR_VIA[key]];
  const g = groups.find((n) => n.dataset.key === key && anchors[n.dataset.bone]);
  return g ? anchors[g.dataset.bone] : null;
}

/** Fold drawn bones into whatever the current difficulty asks about. */
function applyLevel() {
  groups.forEach((g) => {
    const id = g.dataset.bone;
    const eff = resolve(id, cfg.level);
    g.dataset.key = eff || id;
    const ref = BY_ID[eff || id];
    g.dataset.scope = cfg.region === 'all' || ref.region === cfg.region ? '1' : '0';
  });
}

function highlight(key, cls = '') {
  layerHl.textContent = '';
  if (!key) { sk.classList.remove('focus'); return; }
  const g = document.createElementNS(SVGNS, 'g');
  g.setAttribute('class', `hl ${cls}`.trim());
  groups.forEach((n) => {
    if (n.dataset.key !== key) return;
    const c = n.cloneNode(true);
    c.removeAttribute('data-scope');
    $$('.hit', c).forEach((h) => h.remove());
    g.appendChild(c);
  });
  layerHl.appendChild(g);
  sk.classList.add('focus');
}

/* ------------------------------------------------------------------ */
/* camera                                                               */
/* ------------------------------------------------------------------ */
const cam = { cx: 450, cy: 516, w: 700, home: true };
let camAnim = 0;
const box = () => stage.getBoundingClientRect();

function viewRect() {
  const b = box();
  const h = (cam.w * b.height) / b.width;
  return { x: cam.cx - cam.w / 2, y: cam.cy - h / 2, w: cam.w, h };
}
function homeCam() {
  const b = box();
  const asp = b.width / b.height || 0.8;
  const w = Math.max(1052 * asp, 500);
  return { cx: 450, cy: 516, w, home: true };
}
function clampCam() {
  const home = homeCam();
  cam.w = clamp(cam.w, 60, home.w * 1.5);
  cam.cx = clamp(cam.cx, 180, 720);
  cam.cy = clamp(cam.cy, 0, 1032);
}
function applyCam() {
  const v = viewRect();
  sk.setAttribute('viewBox', `${v.x.toFixed(2)} ${v.y.toFixed(2)} ${v.w.toFixed(2)} ${v.h.toFixed(2)}`);
  updatePin();
}
function goto(target, ms = 720) {
  cancelAnimationFrame(camAnim);
  const from = { ...cam };
  const done = () => { cam.home = !!target.home; };
  if (reduceMotion || ms <= 0) { Object.assign(cam, target); done(); applyCam(); return; }
  cam.home = false;
  const t0 = performance.now();
  const step = (t) => {
    const u = Math.min(1, (t - t0) / ms);
    const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    cam.cx = from.cx + (target.cx - from.cx) * e;
    cam.cy = from.cy + (target.cy - from.cy) * e;
    cam.w = Math.exp(Math.log(from.w) + (Math.log(target.w) - Math.log(from.w)) * e);
    applyCam();
    if (u < 1) camAnim = requestAnimationFrame(step); else done();
  };
  camAnim = requestAnimationFrame(step);
}
function boundsOf(key) {
  const both = BY_ID[key]?.frame === 'both';
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  groups.forEach((g) => {
    if (g.dataset.key !== key) return;
    if (!both && +g.dataset.side > 0) return;
    const b = g.getBBox();
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
  });
  return Number.isFinite(x0) ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}
function camFor(key) {
  const r = boundsOf(key);
  const home = homeCam();
  if (!r) return home;
  const b = box();
  const asp = b.width / b.height;
  let w = r.w * 1.7, h = r.h * 1.7;
  w = Math.max(w, 118); h = Math.max(h, 118 / asp);
  if (w / h > asp) h = w / asp; else w = h * asp;
  if (w >= home.w * 0.92) return home;
  return { cx: r.x + r.w / 2, cy: r.y + r.h / 2, w };
}
function zoomAt(newW, clientX, clientY) {
  const b = box();
  const v = viewRect();
  const fx = (clientX - b.left) / b.width, fy = (clientY - b.top) / b.height;
  const px = v.x + fx * v.w, py = v.y + fy * v.h;
  const home = homeCam();
  newW = clamp(newW, 60, home.w * 1.5);
  const newH = (newW * b.height) / b.width;
  cam.w = newW; cam.cx = px - (fx - 0.5) * newW; cam.cy = py - (fy - 0.5) * newH;
  cam.home = false;
  clampCam(); applyCam();
}

/* pan / pinch / tap */
const ptrs = new Map();
let gesture = null;
sk.addEventListener('pointerdown', (e) => {
  if (e.button > 0) return;
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  cancelAnimationFrame(camAnim);
  if (ptrs.size === 1) gesture = { mode: 'tap', sx: e.clientX, sy: e.clientY, cx: cam.cx, cy: cam.cy };
  else if (ptrs.size === 2) {
    const [a, c] = [...ptrs.values()];
    gesture = { mode: 'pinch', d: Math.hypot(a.x - c.x, a.y - c.y) || 1, w: cam.w };
  }
});
window.addEventListener('pointermove', (e) => {
  if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (!gesture) return;
  if (gesture.mode === 'tap' || gesture.mode === 'pan') {
    const dx = e.clientX - gesture.sx, dy = e.clientY - gesture.sy;
    if (gesture.mode === 'tap' && Math.hypot(dx, dy) > 6) { gesture.mode = 'pan'; sk.classList.add('panning'); hideTip(); }
    if (gesture.mode === 'pan') {
      const k = cam.w / box().width;
      cam.cx = gesture.cx - dx * k; cam.cy = gesture.cy - dy * k; cam.home = false;
      clampCam(); applyCam();
    }
  } else if (gesture.mode === 'pinch' && ptrs.size === 2) {
    const [a, c] = [...ptrs.values()];
    const d = Math.hypot(a.x - c.x, a.y - c.y) || 1;
    zoomAt((gesture.w * gesture.d) / d, (a.x + c.x) / 2, (a.y + c.y) / 2);
  }
});
const endPointer = (e) => {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.delete(e.pointerId);
  if (!gesture) return;
  if (ptrs.size === 0) {
    const wasTap = gesture.mode === 'tap' && e.type === 'pointerup';
    gesture = null;
    sk.classList.remove('panning');
    if (wasTap) onTap(document.elementFromPoint(e.clientX, e.clientY), e);
  } else if (gesture.mode === 'pinch') {
    gesture = { mode: 'dead' };
  }
};
window.addEventListener('pointerup', endPointer);
window.addEventListener('pointercancel', endPointer);
stage.addEventListener('wheel', (e) => {
  e.preventDefault();
  cancelAnimationFrame(camAnim);
  const k = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016));
  zoomAt(cam.w / k, e.clientX, e.clientY);
}, { passive: false });

$('#z-in').addEventListener('click', () => goto({ cx: cam.cx, cy: cam.cy, w: clamp(cam.w / 1.6, 60, homeCam().w) }, 380));
$('#z-out').addEventListener('click', () => goto({ cx: cam.cx, cy: cam.cy, w: clamp(cam.w * 1.6, 60, homeCam().w * 1.5) }, 380));
$('#z-fit').addEventListener('click', () => goto(homeCam(), 600));

/* ------------------------------------------------------------------ */
/* pin, chip, tooltip, readout                                          */
/* ------------------------------------------------------------------ */
let pin = null;
let chipW = 60;
function setPin(anchor, n, text, ok = false) {
  if (!anchor) { clearPin(); return; }
  pin = { anchor };
  $('#chip-n').textContent = n || '';
  $('#chip-n').hidden = !n;
  $('#chip-t').textContent = text || '';
  chip.hidden = false;
  chip.style.opacity = 0;
  chipW = chip.offsetWidth;
  pins.classList.toggle('ok', ok);
  pinRing.style.animation = 'none';
  void pinRing.getBoundingClientRect();
  pinRing.style.animation = '';
  updatePin();
  chip.style.opacity = 1;
}
function clearPin() {
  pin = null;
  chip.hidden = true;
  pinLine.setAttribute('d', '');
  pinRing.setAttribute('r', 0); pinDot.setAttribute('r', 0);
}
function updatePin() {
  if (!pin) return;
  const v = viewRect(), b = box();
  const sx = ((pin.anchor[0] - v.x) / v.w) * b.width;
  const sy = ((pin.anchor[1] - v.y) / v.h) * b.height;
  const off = sx < -10 || sx > b.width + 10 || sy < -10 || sy > b.height + 10;
  pins.dataset.off = off ? '1' : '0';
  chip.style.visibility = off ? 'hidden' : 'visible';
  const dir = sx > chipW + 90 ? -1 : 1;
  const len = 46;
  const ex = sx + dir * len;
  pinLine.setAttribute('d', `M${sx.toFixed(1)},${sy.toFixed(1)}L${ex.toFixed(1)},${sy.toFixed(1)}`);
  pinRing.setAttribute('cx', sx.toFixed(1)); pinRing.setAttribute('cy', sy.toFixed(1)); pinRing.setAttribute('r', 9);
  pinDot.setAttribute('cx', sx.toFixed(1)); pinDot.setAttribute('cy', sy.toFixed(1)); pinDot.setAttribute('r', 3.2);
  const left = dir < 0 ? ex - chipW : ex;
  chip.style.transform = `translate(${left.toFixed(1)}px, ${(sy - 15).toFixed(1)}px)`;
}
function showTip(text, e) {
  const b = box();
  tip.textContent = text;
  tip.hidden = false;
  const w = tip.offsetWidth;
  tip.style.transform = `translate(${clamp(e.clientX - b.left + 16, 8, b.width - w - 8).toFixed(0)}px, ${clamp(e.clientY - b.top + 18, 8, b.height - 40).toFixed(0)}px)`;
}
function hideTip() { tip.hidden = true; }

function showReadout(key) {
  const bone = BY_ID[key];
  if (!bone) { readout.hidden = true; return; }
  $('#ro-meta').textContent = `${REGIONS[bone.region]} · ${LEVELS[bone.level].label}`;
  $('#ro-name').textContent = bone.name;
  $('#ro-note').textContent = bone.note;
  readout.hidden = false;
  readout.style.animation = 'none';
  void readout.offsetWidth;
  readout.style.animation = '';
}

/* ------------------------------------------------------------------ */
/* explore (idle + done)                                                */
/* ------------------------------------------------------------------ */
function select(key, { frame = true } = {}) {
  selected = key;
  hoverKey = null;
  highlight(key);
  showReadout(key);
  setPin(anchorFor(key), '', BY_ID[key].name);
  if (frame) goto(camFor(key), 800);
  $$('.row', listBody).forEach((r) => r.classList.toggle('on', r.dataset.id === key));
}
function clearSelection() {
  selected = null;
  highlight(null);
  clearPin();
  readout.hidden = true;
  if (!cam.home) goto(homeCam(), 700);
  $$('.row.on', listBody).forEach((r) => r.classList.remove('on'));
}

function hover(key, e) {
  if (phase === 'ask' && cfg.mode === 'locate') {
    if (key !== hoverKey) { hoverKey = key; highlight(key, 'probe'); }
    return;
  }
  if (phase !== 'idle' && phase !== 'done') return;
  if (key !== hoverKey) {
    hoverKey = key;
    highlight(key || selected);
  }
  if (key && e) showTip(BY_ID[key].name, e); else hideTip();
}
sk.addEventListener('pointermove', (e) => {
  if (gesture || e.pointerType !== 'mouse') return;
  const g = e.target.closest?.('.bone');
  hover(g ? g.dataset.key : null, e);
});
sk.addEventListener('pointerleave', () => { hover(null); hideTip(); });

function onTap(target, e) {
  const g = target?.closest?.('.bone');
  const key = g ? g.dataset.key : null;
  if (phase === 'ask' && cfg.mode === 'locate') {
    if (key) answerLocate(key);
    return;
  }
  if (phase === 'idle' || phase === 'done') {
    hideTip();
    if (key) select(key); else if (selected) clearSelection();
  }
}

/* ------------------------------------------------------------------ */
/* bone list                                                            */
/* ------------------------------------------------------------------ */
function currentSet() { return questionSet(cfg.level, cfg.region); }

function renderList() {
  const set = currentSet();
  listBody.textContent = '';
  const order = cfg.region === 'all' ? ['axial', 'upper', 'lower'] : [cfg.region];
  const playing = run && (phase === 'ask' || phase === 'feedback');
  let n = 0;
  order.forEach((reg) => {
    const items = set.filter((b) => b.region === reg);
    if (!items.length) return;
    if (cfg.region === 'all') listBody.appendChild(el('p', 'group eyebrow', REGIONS[reg]));
    items.forEach((b) => {
      n++;
      const st = run?.res[b.id]?.status;
      const answered = !!st;
      const row = el('button', 'row');
      row.type = 'button';
      row.dataset.id = b.id;
      row.dataset.s = st || '';
      row.append(el('span', 'idx', pad2(n)));
      if (playing && !answered) {
        const m = el('span', 'mask');
        m.style.setProperty('--w', `${38 + ((n * 37) % 46)}%`);
        row.append(m);
        row.classList.add('locked');
      } else {
        row.append(el('span', 'nm', b.name));
      }
      row.append(el('span', 'dot'));
      if (playing && run.cur && run.cur.key === b.id && phase === 'ask') row.dataset.cur = '1';
      if (selected === b.id) row.classList.add('on');
      listBody.appendChild(row);
    });
  });
  const answeredN = run ? Object.keys(run.res).length : 0;
  $('#list-count').textContent = run ? `${answeredN} of ${run.queue.length}` : `${set.length}`;
}
listBody.addEventListener('click', (e) => {
  const row = e.target.closest('.row');
  if (!row || phase === 'ask' || phase === 'feedback') { if (row && run?.res[row.dataset.id]) { highlight(row.dataset.id); showReadout(row.dataset.id); } return; }
  select(row.dataset.id);
});
listBody.addEventListener('pointerover', (e) => {
  const row = e.target.closest('.row');
  if (!row || phase === 'ask' || row.classList.contains('locked')) return;
  if (phase === 'feedback') return;
  highlight(row.dataset.id);
});
listBody.addEventListener('pointerleave', () => {
  if (phase === 'idle' || phase === 'done') highlight(selected);
});

/* ------------------------------------------------------------------ */
/* setup controls                                                       */
/* ------------------------------------------------------------------ */
const MODE_HINT = {
  type: 'A bone is highlighted. Type its name; everyday names like kneecap are accepted.',
  choose: 'A bone is highlighted. Pick the right name from four options.',
  locate: 'You are given a name. Click the matching bone on the figure.',
};
const FOOT = {
  type: 'Enter checks your answer. A hint costs 25 points.',
  choose: 'Press 1 to 4 to choose. Enter or Space continues.',
  locate: 'A second try scores 60. Scroll to zoom, drag to pan.',
};
const regionBox = $('.chips[data-key="region"]');
Object.entries(REGIONS).forEach(([k, label]) => {
  const b = el('button', 'pill', label);
  b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.v = k;
  regionBox.appendChild(b);
});

function placeThumb(seg) {
  const th = $('.thumb', seg);
  const on = $('[aria-checked="true"]', seg);
  if (!th || !on || !on.offsetWidth) return;
  th.style.width = `${on.offsetWidth}px`;
  th.style.transform = `translateX(${on.offsetLeft}px)`;
}
function syncControls() {
  $$('[data-key]').forEach((grp) => {
    const cur = String(cfg[grp.dataset.key]);
    $$('[role="radio"]', grp).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === cur)));
    if (grp.classList.contains('seg')) placeThumb(grp);
  });
  $('#mode-hint').textContent = MODE_HINT[cfg.mode];
  [1, 2, 3].forEach((lv) => { $(`i[data-n="${lv}"]`).textContent = questionSet(lv, cfg.region).length; });
  const n = currentSet().length;
  $('#begin-n').textContent = n;
  $('#begin').disabled = n === 0;
  const best = store.get(bestKey());
  $('#best').textContent = best ? `Best ${best.score.toLocaleString('en-US')} · ${best.acc}%` : 'No score yet for this setup';
}
const bestKey = () => `ossa.best.${cfg.mode}.${cfg.level}.${cfg.region}.${cfg.clock}`;

$$('[data-key]').forEach((grp) => {
  grp.addEventListener('click', (e) => {
    const b = e.target.closest('[role="radio"]');
    if (!b) return;
    const k = grp.dataset.key;
    cfg[k] = k === 'level' || k === 'clock' ? +b.dataset.v : b.dataset.v;
    store.set('ossa.cfg', cfg);
    if (k === 'level' || k === 'region') { if (selected) clearSelection(); applyLevel(); renderList(); }
    syncControls();
  });
});

/* ------------------------------------------------------------------ */
/* views + stats                                                        */
/* ------------------------------------------------------------------ */
const views = { setup: $('#v-setup'), ask: $('#v-ask'), result: $('#v-result') };
function showView(name) {
  Object.entries(views).forEach(([k, v]) => { v.hidden = k !== name; });
  if (name === 'setup') syncControls();
  app.dataset.view = 'panel';
  $('#toggle-list').setAttribute('aria-pressed', 'false');
}
function setPhase(p) { phase = p; app.dataset.phase = p; }

const stat = { score: $('#st-score'), streak: $('#st-streak'), time: $('#st-time') };
function setStat(name, text, bump = false) {
  const n = stat[name];
  if (n.textContent === String(text)) return;
  n.textContent = text;
  if (bump) { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); }
}
function resetStats() {
  setStat('score', '0'); setStat('streak', '0'); setStat('time', '0:00');
  stat.time.classList.remove('low');
  $('#st-time-l').textContent = 'Time';
}

$('#toggle-list').addEventListener('click', () => {
  const on = app.dataset.view !== 'list';
  app.dataset.view = on ? 'list' : 'panel';
  $('#toggle-list').setAttribute('aria-pressed', String(on));
});

/* ------------------------------------------------------------------ */
/* session                                                              */
/* ------------------------------------------------------------------ */
function startRun(keys) {
  clearInterval(timer);
  run = {
    queue: keys, i: 0, res: {}, score: 0, streak: 0, bestStreak: 0, hints: 0, correct: 0,
    t0: performance.now(), endsAt: cfg.clock ? performance.now() + cfg.clock * 1000 : 0, cur: null,
  };
  selected = null; hoverKey = null;
  readout.hidden = true; hideTip();
  resetStats();
  $('#st-time-l').textContent = cfg.clock ? 'Left' : 'Time';
  setStat('time', cfg.clock ? fmtTime(cfg.clock) : '0:00');
  timer = setInterval(tick, 250);
  sk.classList.toggle('probe', cfg.mode === 'locate');
  showView('ask');
  ask();
}

function tick() {
  if (!run) return;
  const now = performance.now();
  if (cfg.clock) {
    const left = Math.max(0, (run.endsAt - now) / 1000);
    setStat('time', fmtTime(Math.ceil(left)));
    stat.time.classList.toggle('low', left <= 10);
    if (left <= 0 && (phase === 'ask' || phase === 'feedback')) finish('time');
  } else {
    setStat('time', fmtTime((now - run.t0) / 1000));
  }
}

function ask() {
  const key = run.queue[run.i];
  const bone = BY_ID[key];
  run.cur = { key, attempts: 0, hint: 0, t: performance.now() };
  setPhase('ask');
  hoverKey = null;

  $('#qcount').textContent = `${pad2(run.i + 1)} / ${pad2(run.queue.length)}`;
  $('#qprog').style.width = `${(run.i / run.queue.length) * 100}%`;
  $('#fb').hidden = true;
  const v = views.ask;
  v.style.animation = 'none'; void v.offsetWidth; v.style.animation = '';

  $('#foot').textContent = FOOT[cfg.mode];
  $('#a-type').hidden = cfg.mode !== 'type';
  $('#a-choose').hidden = cfg.mode !== 'choose';
  $('#a-locate').hidden = cfg.mode !== 'locate';
  $('#prompt').hidden = false;

  if (cfg.mode === 'locate') {
    $('#prompt').textContent = 'Find the';
    $('#loc-name').textContent = bone.name;
    $('#loc-hint').textContent = 'Click the bone on the figure.';
    highlight(null);
    clearPin();
    goto(homeCam(), 600);
  } else {
    $('#prompt').textContent = 'Name the highlighted bone.';
    highlight(key);
    goto(camFor(key), 800);
    setPin(anchorFor(key), pad2(run.i + 1), '');
  }

  if (cfg.mode === 'type') {
    const input = $('#in');
    input.value = '';
    input.disabled = false;
    $('#hintline').textContent = '';
    $('#hint').disabled = false;
    $('#submit').disabled = false;
    setTimeout(() => input.focus({ preventScroll: true }), 30);
  }
  if (cfg.mode === 'choose') {
    const opts = $('#opts');
    opts.textContent = '';
    opts.classList.remove('done');
    makeOptions(key).forEach((b, i) => {
      const li = el('li');
      const btn = el('button', 'opt');
      btn.type = 'button';
      btn.dataset.id = b.id;
      btn.append(el('kbd', '', String(i + 1)), el('span', '', b.name));
      li.appendChild(btn);
      opts.appendChild(li);
    });
  }
  renderList();
  scrollCurrentIntoView();
}

function scrollCurrentIntoView() {
  const cur = $('.row[data-cur="1"]', listBody);
  cur?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
}

function makeOptions(key) {
  const t = BY_ID[key];
  const pool = questionSet(cfg.level, 'all').filter((b) => b.id !== key);
  const same = shuffle(pool.filter((b) => b.region === t.region));
  const rest = shuffle(pool.filter((b) => b.region !== t.region));
  return shuffle([t, ...[...same, ...rest].slice(0, 3)]);
}

function hintPattern(name, level) {
  const m = name.match(/^(.*?)(\s*\(.*\))?$/);
  const main = m[1], tail = m[2] || '';
  const words = main.split(' ').map((w) => w.split('').map((ch, i) => (level >= 2 && i === 0 ? ch.toUpperCase() : '_')).join(' '));
  return words.join('   ') + tail;
}

/* --- answering --- */
function conclude(kind, info = {}) {
  const c = run.cur;
  const bone = BY_ID[c.key];
  let pts = 0;
  if (kind === 'ok') {
    const base = cfg.mode === 'locate' && c.attempts > 0 ? 60 : 100;
    pts = Math.max(20, base - c.hint * 25) + Math.min(run.streak, 5) * 10;
    run.score += pts;
    run.correct++;
    if (c.attempts === 0) { run.streak++; run.bestStreak = Math.max(run.bestStreak, run.streak); } else run.streak = 0;
  } else {
    run.streak = 0;
  }
  run.hints += c.hint;
  run.res[c.key] = { status: kind, hint: c.hint, ms: performance.now() - c.t };
  setStat('score', run.score.toLocaleString('en-US'), kind === 'ok');
  setStat('streak', run.streak, kind === 'ok');

  setPhase('feedback');
  nextGuard = performance.now() + 220;

  // reveal on the figure
  highlight(c.key, kind === 'ok' ? 'ok' : '');
  setPin(anchorFor(c.key), pad2(run.i + 1), kind === 'ok' ? '' : bone.name, kind === 'ok');
  if (cfg.mode === 'locate') goto(camFor(c.key), 700);

  // panel
  const verdict = $('#fb-verdict');
  verdict.className = `verdict ${kind === 'ok' ? 'ok' : 'bad'}`;
  verdict.textContent = kind === 'ok' ? `Correct${info.close ? ', spelling adjusted' : ''}  ·  +${pts}` : kind === 'skip' ? 'Skipped' : 'Not quite';
  $('#fb-name').textContent = bone.name;
  const note = $('#fb-note');
  note.textContent = '';
  if (info.said && kind !== 'ok') { const s = el('s', '', `“${info.said}”`); note.append('You wrote ', s, '. '); }
  if (info.clicked && kind !== 'ok') note.append(`You clicked the ${info.clicked}. `);
  note.append(bone.note);
  const last = run.i + 1 >= run.queue.length;
  $('#next-t').textContent = last ? 'See results' : 'Next';
  $('#a-type').hidden = true;
  $('#a-locate').hidden = true;
  $('#prompt').hidden = cfg.mode !== 'choose';
  if (cfg.mode === 'choose') { $('#skip-c').hidden = true; $('#prompt').textContent = 'Name the highlighted bone.'; }
  $('#fb').classList.toggle('solo', cfg.mode !== 'choose');
  $('#fb').hidden = false;
  $('#next').focus({ preventScroll: true });
  $('#qprog').style.width = `${((run.i + 1) / run.queue.length) * 100}%`;
  renderList();
  scrollCurrentIntoView();
}

function advance() {
  if (phase !== 'feedback') return;
  run.i++;
  $('#skip-c').hidden = false;
  if (run.i >= run.queue.length) finish('complete'); else ask();
}

$('#a-type').addEventListener('submit', (e) => {
  e.preventDefault();
  if (phase !== 'ask') return;
  const v = $('#in').value.trim();
  if (!v) { const i = $('#in'); i.classList.remove('shake'); void i.offsetWidth; i.classList.add('shake'); return; }
  const verdict = judge(v, BY_ID[run.cur.key], questionSet(cfg.level, 'all'));
  if (verdict === 'no') conclude('miss', { said: v }); else conclude('ok', { close: verdict === 'close' });
});
$('#hint').addEventListener('click', () => {
  if (phase !== 'ask' || run.cur.hint >= 2) return;
  run.cur.hint++;
  $('#hintline').textContent = hintPattern(BY_ID[run.cur.key].name, run.cur.hint);
  if (run.cur.hint >= 2) $('#hint').disabled = true;
  $('#in').focus({ preventScroll: true });
});
const skip = () => { if (phase === 'ask') conclude('skip'); };
$('#skip').addEventListener('click', skip);
$('#skip-c').addEventListener('click', skip);
$('#skip-l').addEventListener('click', skip);

$('#opts').addEventListener('click', (e) => {
  const btn = e.target.closest('.opt');
  if (!btn || phase !== 'ask') return;
  pickOption(btn);
});
function pickOption(btn) {
  const right = btn.dataset.id === run.cur.key;
  $('#opts').classList.add('done');
  $$('.opt', $('#opts')).forEach((o) => {
    if (o.dataset.id === run.cur.key) o.classList.add('right');
  });
  if (!right) btn.classList.add('wrong');
  conclude(right ? 'ok' : 'miss', { said: right ? '' : BY_ID[btn.dataset.id].name });
}

function answerLocate(clickedKey) {
  if (phase !== 'ask') return;
  const c = run.cur;
  if (clickedKey === c.key) { conclude('ok'); return; }
  c.attempts++;
  const name = BY_ID[clickedKey].name;
  if (c.attempts >= 2) { conclude('miss', { clicked: name }); return; }
  $('#loc-hint').textContent = `That is the ${name.toLowerCase()}. One more try.`;
  highlight(null);
  stage.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 260 });
}

$('#next').addEventListener('click', advance);
$('#end').addEventListener('click', () => { if (phase === 'ask' || phase === 'feedback') finish('ended'); });

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (phase === 'feedback' && (e.key === 'Enter' || (e.key === ' ' && document.activeElement?.id !== 'next'))) {
    if (performance.now() < nextGuard) { e.preventDefault(); return; }
    if (document.activeElement?.id === 'next' && e.key === 'Enter') return; // button click handles it
    e.preventDefault();
    advance();
    return;
  }
  if (phase === 'ask' && cfg.mode === 'choose' && /^[1-4]$/.test(e.key)) {
    const btn = $$('.opt', $('#opts'))[+e.key - 1];
    if (btn) { e.preventDefault(); pickOption(btn); }
    return;
  }
  if (e.key === 'Escape' && (phase === 'idle' || phase === 'done') && selected) clearSelection();
});

/* --- results --- */
function finish(reason) {
  clearInterval(timer);
  const total = run.queue.length;
  const secs = cfg.clock ? Math.min(cfg.clock, (performance.now() - run.t0) / 1000) : (performance.now() - run.t0) / 1000;
  let bonus = 0;
  if (cfg.clock && reason === 'complete') bonus = Math.round(Math.max(0, cfg.clock - secs) * 1.5);
  run.score += bonus;
  const attempted = Object.keys(run.res).length;
  const acc = attempted ? Math.round((run.correct / attempted) * 100) : 0;
  const missed = run.queue.filter((k) => ['miss', 'skip'].includes(run.res[k]?.status));
  const unreached = run.queue.filter((k) => !run.res[k]);
  run.summary = { total, secs, acc, missed, unreached, bonus, reason };

  setPhase('done');
  sk.classList.remove('probe');
  highlight(null);
  clearPin();
  goto(homeCam(), 800);
  setStat('score', run.score.toLocaleString('en-US'));
  stat.time.classList.remove('low');

  const line = {
    complete: `${run.correct} of ${total} identified in ${fmtTime(secs)}`,
    time: `${run.correct} of ${total} identified before the clock ran out`,
    ended: `${run.correct} of ${total} identified before you ended the session`,
  }[reason];
  $('#r-eyebrow').textContent = reason === 'time' ? 'Time is up' : reason === 'ended' ? 'Session ended' : 'Session complete';
  $('#r-score').textContent = run.score.toLocaleString('en-US');
  $('#r-line').textContent = line + (bonus ? `, with a ${bonus} point time bonus.` : '.');
  $('#r-acc').textContent = `${acc}%`;
  $('#r-time').textContent = fmtTime(secs);
  $('#r-streak').textContent = run.bestStreak;
  $('#r-hints').textContent = run.hints;

  const wrap = $('#r-missed-wrap');
  const box = $('#r-missed');
  box.textContent = '';
  missed.forEach((k) => {
    const b = el('button', 'pill', BY_ID[k].name);
    b.type = 'button';
    b.addEventListener('click', () => select(k));
    box.appendChild(b);
  });
  wrap.hidden = missed.length === 0;
  const again = missed.length + unreached.length;
  $('#retry').hidden = again === 0;
  $('#retry').textContent = unreached.length ? `Retry the ${again} left` : 'Retry missed';

  const prev = store.get(bestKey());
  if (attempted && (!prev || run.score > prev.score)) store.set(bestKey(), { score: run.score, acc });

  showView('result');
  renderList();
}

/* ------------------------------------------------------------------ */
/* entry points                                                         */
/* ------------------------------------------------------------------ */
const newQueue = () => shuffle(currentSet().map((b) => b.id));
$('#begin').addEventListener('click', () => { if (currentSet().length) startRun(newQueue()); });
$('#again').addEventListener('click', () => startRun(newQueue()));
$('#retry').addEventListener('click', () => {
  const sm = run?.summary;
  if (sm && sm.missed.length + sm.unreached.length) startRun(shuffle([...sm.missed, ...sm.unreached]));
});
$('#back').addEventListener('click', () => {
  run = null;
  setPhase('idle');
  clearSelection();
  resetStats();
  showView('setup');
  renderList();
});

/* ------------------------------------------------------------------ */
/* boot                                                                 */
/* ------------------------------------------------------------------ */
applyLevel();
Object.assign(cam, homeCam());
applyCam();
renderList();
showView('setup');

new ResizeObserver(() => {
  if (cam.home) Object.assign(cam, homeCam());
  applyCam();
  $$('.seg').forEach(placeThumb);
}).observe(stage);
document.fonts?.ready.then(() => $$('.seg').forEach(placeThumb));

if (!reduceMotion) {
  let raf = 0;
  window.addEventListener('pointermove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const dx = (0.5 - e.clientX / innerWidth) * 26, dy = (0.5 - e.clientY / innerHeight) * 18;
      ghost.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px))`;
    });
  });
}
