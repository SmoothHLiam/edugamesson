// Shared catalogue logic: level folding, question sets and typed-answer matching.
export function makeCatalog(BONES) {
  const BY_ID = Object.fromEntries(BONES.map((x) => [x.id, x]));

  /** Is this bone asked as itself at difficulty `lv`? */
  const isAsked = (bone, lv) => bone.level <= lv && !(bone.splitAt && lv >= bone.splitAt);

  /** Fold a drawn bone id into whatever is asked at this difficulty; null = context only. */
  function resolve(id, lv) {
    let cur = BY_ID[id];
    while (cur) {
      if (isAsked(cur, lv)) return cur.id;
      cur = cur.parent ? BY_ID[cur.parent] : null;
    }
    return null;
  }

  /** Bones asked at this difficulty, optionally limited to a region. */
  function questionSet(lv, region = 'all') {
    return BONES.filter((x) => isAsked(x, lv) && (region === 'all' || x.region === region));
  }

  /* ---------- typed-answer matching ---------- */

  const strip = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\(.*?\)/g, ' ')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  /** Loose singular so ribs/rib, vertebrae/vertebra, carpals/carpal all agree. */
  const singular = (w) => (w.endsWith('ae') ? w.slice(0, -1) : w.length > 3 && w.endsWith('s') && !w.endsWith('us') && !w.endsWith('is') ? w.slice(0, -1) : w);
  const norm = (s) => strip(s).split(' ').map(singular).join(' ');

  /** Optimal-string-alignment distance: insert, delete, substitute and adjacent swap each cost one. */
  function distance(a, b) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 2) return 3;
    const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
    return d[m][n];
  }

  const forms = (bone) => {
    const raw = [bone.name, ...bone.syn];
    const out = new Set();
    raw.forEach((r) => {
      out.add(norm(r));
      out.add(norm(r.replace(/\b(bone|bones|process|vertebrae|vertebra)\b/gi, '')));
    });
    out.delete('');
    return [...out];
  };

  /**
   * Compare a typed answer to the target. Returns 'exact' | 'close' | 'no'.
   * `pool` is every bone in play so a typo never lands on a different real bone.
   */
  function judge(input, target, pool = BONES) {
    const q = norm(input);
    if (!q) return 'no';
    const mine = forms(target);
    if (mine.includes(q)) return 'exact';
    for (const other of pool) {
      if (other.id !== target.id && forms(other).includes(q)) return 'no';
    }
    const tol = q.length >= 8 ? 2 : q.length >= 5 ? 1 : 0;
    if (!tol) return 'no';
    const best = Math.min(...mine.map((f) => distance(q, f)));
    if (best > tol) return 'no';
    for (const other of pool) {
      if (other.id === target.id) continue;
      if (Math.min(...forms(other).map((f) => distance(q, f))) <= best) return 'no';
    }
    return 'close';
  }

  /** Did the player type a folk name for this bone (e.g. "kneecap" for the patella)? */
  const everydayHit = (input, bone) => {
    const q = norm(input);
    return !!q && bone.everyday.some((e) => norm(e) === q);
  };

  return { BY_ID, isAsked, resolve, questionSet, judge, everydayHit };
}
