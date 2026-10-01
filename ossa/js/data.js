// Bone catalogue. `id`s that have geometry match data-bone in skeleton.js; ids without
// geometry (cranium, pelvis, ...) are parents that merge their children at lower levels.
//
//   level    lowest difficulty at which the bone is asked as itself
//   splitAt  from this difficulty upward the bone is replaced by its children
//   parent   where the bone is folded in when it is finer than the current level
//   syn      other anatomical names that are accepted as an answer
//   everyday folk names (kneecap, shin bone). Never accepted as an answer; the first one
//            is shown as the hint after a wrong try in Type mode.

export const LEVELS = {
  1: { key: 'core', label: 'Core' },
  2: { key: 'complete', label: 'Complete' },
};

export const REGIONS = {
  all: 'Whole body',
  axial: 'Head and trunk',
  upper: 'Upper limb',
  lower: 'Lower limb',
};

const b = (id, name, o) => ({ id, name, syn: [], everyday: [], level: 1, parent: null, splitAt: 0, frame: 'primary', ...o });

export const BONES = [
  /* head */
  b('cranium', 'Cranium', { region: 'axial', splitAt: 2, syn: [], everyday: ['the bones of the head', 'skull'], note: 'Twenty-one fused bones that protect the brain and frame the face. Only the mandible, which hangs from it, is separate.' }),
  b('parietal', 'Parietal bone', { region: 'axial', level: 2, parent: 'cranium', syn: [], everyday: ['top and sides of the head'], note: 'A pair of plates that form the roof and upper sides of the cranium, meeting at the sagittal suture.' }),
  b('frontal', 'Frontal bone', { region: 'axial', level: 2, parent: 'cranium', syn: [], everyday: ['forehead bone'], note: 'Forms the forehead and the roofs of both eye sockets.' }),
  b('temporal', 'Temporal bone', { region: 'axial', level: 2, parent: 'cranium', frame: 'both', syn: [], everyday: ['temple bone'], note: 'Sits at the side of the cranium and houses the structures of the ear and the jaw joint.' }),
  b('zygomatic', 'Zygomatic bone', { region: 'axial', level: 2, parent: 'cranium', frame: 'both', syn: ['zygoma', 'malar'], everyday: ['cheekbone', 'cheek bone'], note: 'The cheekbone. It forms the outer rim of the eye socket and part of the zygomatic arch.' }),
  b('maxilla', 'Maxilla', { region: 'axial', level: 2, parent: 'cranium', syn: [], everyday: ['upper jaw'], note: 'The upper jaw. It holds the upper teeth and forms the floor of the eye socket and the sides of the nose.' }),
  b('nasal', 'Nasal bone', { region: 'axial', level: 2, parent: 'cranium', syn: [], everyday: ['nose bone', 'bridge of the nose'], note: 'Two small bones that form the bridge of the nose. The rest of the nose is cartilage.' }),
  b('mandible', 'Mandible', { region: 'axial', syn: [], everyday: ['jaw', 'jawbone', 'jaw bone', 'lower jaw'], note: 'The lower jaw and the only head bone that moves freely. It holds the lower teeth.' }),

  /* vertebrae */
  b('cervical', 'Cervical vertebrae', { region: 'axial', syn: ['cervical spine', 'cervical vert'], everyday: ['neck bones', 'neck vertebrae'], note: 'Seven neck vertebrae, the smallest and most mobile. The first two, atlas and axis, allow nodding and turning.' }),
  b('thoracic', 'Thoracic vertebrae', { region: 'axial', syn: ['thoracic spine', 'thoracic vert'], everyday: ['upper back bones', 'chest vertebrae'], note: 'Twelve vertebrae that each carry a pair of ribs and form the back of the rib cage.' }),
  b('lumbar', 'Lumbar vertebrae', { region: 'axial', syn: ['lumbar spine', 'lumbar vert'], everyday: ['lower back bones'], note: 'Five large vertebrae in the lower back. They bear the greatest load of the spine.' }),

  /* thorax */
  b('sternum', 'Sternum', { region: 'axial', splitAt: 2, syn: [], everyday: ['breastbone', 'breast bone'], note: 'The breastbone. A flat bone in three parts that anchors the upper seven pairs of ribs.' }),
  b('manubrium', 'Manubrium', { region: 'axial', level: 2, parent: 'sternum', syn: [], everyday: ['top of the breastbone'], note: 'The broad top of the sternum. It joins the clavicles and the first pair of ribs.' }),
  b('sternal-body', 'Body of the sternum', { region: 'axial', level: 2, parent: 'sternum', syn: ['sternal body', 'gladiolus', 'body of sternum'], everyday: ['middle of the breastbone'], note: 'The long middle piece of the sternum, where most of the true ribs attach.' }),
  b('xiphoid', 'Xiphoid process', { region: 'axial', level: 2, parent: 'sternum', syn: ['xiphoid', 'xiphisternum'], everyday: ['tip of the breastbone'], note: 'The small tip of the sternum. It is mostly cartilage in youth and gradually ossifies with age.' }),
  b('ribs', 'Ribs', { region: 'axial', splitAt: 2, frame: 'both', syn: ['rib cage', 'ribcage', 'thoracic cage'], everyday: ['the chest cage'], note: 'Twelve pairs of curved bones that enclose the heart and lungs and swing with each breath.' }),
  b('true-ribs', 'True ribs', { region: 'axial', level: 2, parent: 'ribs', frame: 'both', syn: ['vertebrosternal ribs'], everyday: ['ribs 1 to 7'], note: 'Ribs 1 to 7 reach the sternum directly through their own costal cartilage.' }),
  b('false-ribs', 'False ribs', { region: 'axial', level: 2, parent: 'ribs', frame: 'both', syn: ['vertebrochondral ribs'], everyday: ['ribs 8 to 10'], note: 'Ribs 8 to 10 join the sternum indirectly, through the cartilage of the rib above.' }),
  b('floating-ribs', 'Floating ribs', { region: 'axial', level: 2, parent: 'ribs', frame: 'both', syn: ['vertebral ribs'], everyday: ['ribs 11 and 12'], note: 'Ribs 11 and 12 have no front attachment and end in the muscles of the abdominal wall.' }),
  b('costal-cartilage', 'Costal cartilage', { region: 'axial', level: 2, parent: 'ribs', frame: 'both', syn: [], everyday: ['gristle joining ribs to the breastbone', 'rib cartilage'], note: 'Flexible hyaline cartilage that joins the ribs to the sternum and lets the chest expand.' }),

  /* shoulder + arm */
  b('clavicle', 'Clavicle', { region: 'upper', syn: [], everyday: ['collarbone', 'collar bone'], note: 'The collarbone braces the shoulder away from the chest. It is one of the most frequently broken bones.' }),
  b('scapula', 'Scapula', { region: 'upper', syn: [], everyday: ['shoulder blade', 'shoulderblade'], note: 'The shoulder blade. A flat triangle that glides over the back of the rib cage and holds the socket for the arm.' }),
  b('humerus', 'Humerus', { region: 'upper', syn: [], everyday: ['upper arm bone'], note: 'The long bone of the upper arm. Its rounded head fits into the shoulder socket.' }),
  b('radius', 'Radius', { region: 'upper', syn: [], everyday: ['forearm bone, thumb side'], note: 'The forearm bone on the thumb side. It rotates around the ulna to turn the palm.' }),
  b('ulna', 'Ulna', { region: 'upper', syn: [], everyday: ['forearm bone, little finger side'], note: 'The forearm bone on the little-finger side. Its upper end forms the point of the elbow, the olecranon.' }),
  b('carpals', 'Carpals', { region: 'upper', splitAt: 2, syn: [], everyday: ['wrist bones'], note: 'Eight small bones in two rows that make up the wrist.' }),
  b('scaphoid', 'Scaphoid', { region: 'upper', level: 2, parent: 'carpals', syn: [], everyday: ['boat-shaped wrist bone'], note: 'The boat-shaped bone on the thumb side, most often broken in a fall on an outstretched hand.' }),
  b('lunate', 'Lunate', { region: 'upper', level: 2, parent: 'carpals', syn: [], everyday: ['moon-shaped wrist bone'], note: 'A crescent-shaped bone in the middle of the proximal row, resting against the radius.' }),
  b('triquetrum', 'Triquetrum', { region: 'upper', level: 2, parent: 'carpals', syn: ['triquetral', 'triquetral bone'], everyday: ['three-cornered wrist bone'], note: 'A pyramid-shaped bone on the little-finger side of the proximal row.' }),
  b('pisiform', 'Pisiform', { region: 'upper', level: 2, parent: 'carpals', syn: [], everyday: ['pea-shaped wrist bone'], note: 'A pea-sized bone that sits in front of the triquetrum. It is the smallest carpal.' }),
  b('trapezium', 'Trapezium', { region: 'upper', level: 2, parent: 'carpals', syn: [], everyday: ['wrist bone at the base of the thumb'], note: 'Its saddle-shaped surface gives the thumb its wide range of movement.' }),
  b('trapezoid', 'Trapezoid', { region: 'upper', level: 2, parent: 'carpals', syn: [], everyday: ['small wedge-shaped wrist bone'], note: 'The smallest bone of the distal row, wedged between the trapezium and the capitate.' }),
  b('capitate', 'Capitate', { region: 'upper', level: 2, parent: 'carpals', syn: [], everyday: ['largest wrist bone'], note: 'The largest carpal, sitting at the centre of the wrist.' }),
  b('hamate', 'Hamate', { region: 'upper', level: 2, parent: 'carpals', syn: [], everyday: ['hooked wrist bone'], note: 'Recognised by its hooked process, which lies beside the ulnar nerve.' }),
  b('metacarpals', 'Metacarpals', { region: 'upper', syn: [], everyday: ['palm bones'], note: 'Five long bones that form the palm, numbered I to V from the thumb.' }),
  b('hand-phalanges', 'Phalanges (hand)', { region: 'upper', syn: ['phalanges', 'phalanx', 'hand phalanges', 'phalanges of the hand'], everyday: ['finger bones', 'fingers'], note: 'Fourteen finger bones: two in the thumb and three in each finger.' }),

  /* pelvis + leg */
  b('pelvis', 'Pelvis', { region: 'lower', splitAt: 2, frame: 'both', syn: ['pelvic girdle', 'pelvic bones', 'pelvic bone', 'os coxae', 'coxal bone', 'innominate bone'], everyday: ['hips', 'the hip girdle', 'hip bone'], note: 'The two large paired bones of the hips, each an ilium, ischium and pubis fused during adolescence. With the sacrum and coccyx they form the bony ring that passes the weight of the trunk to the legs.' }),
  b('ilium', 'Ilium', { region: 'lower', level: 2, parent: 'pelvis', frame: 'both', syn: ['iliac bone', 'iliac wing'], everyday: ['top of the pelvis'], note: 'The broad, fan-shaped upper part of the pelvis. Its upper edge is the iliac crest.' }),
  b('ischium', 'Ischium', { region: 'lower', level: 2, parent: 'pelvis', frame: 'both', syn: [], everyday: ['sitting bone'], note: 'The lower, rear part of the pelvis. You sit on its ischial tuberosities.' }),
  b('pubis', 'Pubis', { region: 'lower', level: 2, parent: 'pelvis', frame: 'both', syn: ['pubic bone'], everyday: ['front of the pelvis'], note: 'The front part of the pelvis. The two pubic bones meet at the pubic symphysis.' }),
  b('sacrum', 'Sacrum', { region: 'axial', syn: [], everyday: ['triangle at the base of the spine'], note: 'Five fused vertebrae forming a wedge that locks between the two sides of the pelvis at the sacroiliac joints.' }),
  b('coccyx', 'Coccyx', { region: 'axial', syn: [], everyday: ['tailbone', 'tail bone'], note: 'The tailbone. Three to five small fused vertebrae, a remnant of a tail.' }),
  b('femur', 'Femur', { region: 'lower', syn: [], everyday: ['thigh bone', 'thighbone'], note: 'The thigh bone, the longest and strongest bone in the body.' }),
  b('patella', 'Patella', { region: 'lower', syn: [], everyday: ['kneecap', 'knee cap'], note: 'The kneecap. A sesamoid bone embedded in the quadriceps tendon.' }),
  b('tibia', 'Tibia', { region: 'lower', syn: [], everyday: ['shin bone', 'shinbone', 'shin'], note: 'The shin bone. It carries most of the body weight below the knee.' }),
  b('fibula', 'Fibula', { region: 'lower', syn: [], everyday: ['calf bone'], note: 'The slender bone beside the tibia. It bears little weight but steadies the ankle.' }),
  b('tarsals', 'Tarsals', { region: 'lower', splitAt: 2, syn: [], everyday: ['ankle bones'], note: 'The ankle and midfoot bones other than the heel: the talus, navicular, cuboid and three cuneiforms. The calcaneus is listed on its own.' }),
  b('talus', 'Talus', { region: 'lower', level: 2, parent: 'tarsals', syn: ['astragalus'], everyday: ['ankle bone'], note: 'Sits between the tibia and fibula and passes body weight into the foot.' }),
  b('calcaneus', 'Calcaneus', { region: 'lower', syn: ['calcaneum'], everyday: ['heel bone', 'heelbone'], note: 'The heel bone and largest tarsal. The Achilles tendon attaches to it.' }),
  b('navicular', 'Navicular', { region: 'lower', level: 2, parent: 'tarsals', syn: ['tarsal navicular'], everyday: ['boat-shaped bone on the inner foot'], note: 'A boat-shaped bone on the inner side of the foot that helps hold up the medial arch.' }),
  b('cuboid', 'Cuboid', { region: 'lower', level: 2, parent: 'tarsals', syn: [], everyday: ['cube-shaped bone on the outer foot'], note: 'On the outer side of the foot, meeting the fourth and fifth metatarsals.' }),
  b('cuneiforms', 'Cuneiforms', { region: 'lower', level: 2, parent: 'tarsals', syn: ['cuneiform', 'cuneiform bones'], everyday: ['three wedge-shaped bones in the midfoot'], note: 'Three wedge-shaped bones, medial, intermediate and lateral, linking the navicular to the first three metatarsals.' }),
  b('metatarsals', 'Metatarsals', { region: 'lower', syn: [], everyday: ['long bones of the foot'], note: 'Five long bones of the midfoot, numbered I to V from the big toe.' }),
  b('foot-phalanges', 'Phalanges (foot)', { region: 'lower', syn: ['phalanges', 'phalanx', 'foot phalanges', 'phalanges of the foot'], everyday: ['toe bones', 'toes'], note: 'Fourteen toe bones: two in the big toe and three in each other toe.' }),
];

export const BY_ID = Object.fromEntries(BONES.map((x) => [x.id, x]));

/** Is this bone asked as itself at difficulty `lv`? */
export const isAsked = (bone, lv) => bone.level <= lv && !(bone.splitAt && lv >= bone.splitAt);

/** Fold a drawn bone id into whatever is asked at this difficulty; null = context only. */
export function resolve(id, lv) {
  let cur = BY_ID[id];
  while (cur) {
    if (isAsked(cur, lv)) return cur.id;
    cur = cur.parent ? BY_ID[cur.parent] : null;
  }
  return null;
}

/** Bones asked at this difficulty, optionally limited to a region. */
export function questionSet(lv, region = 'all') {
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
export function judge(input, target, pool = BONES) {
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
export const everydayHit = (input, bone) => {
  const q = norm(input);
  return !!q && bone.everyday.some((e) => norm(e) === q);
};
