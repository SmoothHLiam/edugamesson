// Bone catalogue. `id`s that have geometry match data-bone in skeleton.js; ids without
// geometry (skull, spine, pelvis, ...) are parents that merge their children at lower levels.
//
//   level    lowest difficulty at which the bone is asked as itself
//   splitAt  from this difficulty upward the bone is replaced by its children
//   parent   where the bone is folded in when it is finer than the current level

export const LEVELS = {
  1: { key: 'core', label: 'Core' },
  2: { key: 'extended', label: 'Extended' },
  3: { key: 'complete', label: 'Complete' },
};

export const REGIONS = {
  all: 'Whole body',
  axial: 'Head and trunk',
  upper: 'Upper limb',
  lower: 'Lower limb',
};

const b = (id, name, o) => ({ id, name, aliases: [], level: 1, parent: null, splitAt: 0, frame: 'primary', ...o });

export const BONES = [
  /* head */
  b('skull', 'Skull', { region: 'axial', splitAt: 3, aliases: ['cranium'], note: 'Twenty-two bones, all fused except the mandible, that protect the brain and frame the face.' }),
  b('parietal', 'Parietal bone', { region: 'axial', level: 3, parent: 'skull', note: 'A pair of plates that form the roof and upper sides of the cranium, meeting at the sagittal suture.' }),
  b('frontal', 'Frontal bone', { region: 'axial', level: 3, parent: 'skull', note: 'Forms the forehead and the roofs of both eye sockets.' }),
  b('temporal', 'Temporal bone', { region: 'axial', level: 3, parent: 'skull', frame: 'both', note: 'Sits at the side of the skull and houses the structures of the ear and the jaw joint.' }),
  b('zygomatic', 'Zygomatic bone', { region: 'axial', level: 3, parent: 'skull', frame: 'both', aliases: ['cheekbone', 'cheek bone', 'malar', 'zygoma'], note: 'The cheekbone. It forms the outer rim of the eye socket and part of the zygomatic arch.' }),
  b('maxilla', 'Maxilla', { region: 'axial', level: 3, parent: 'skull', aliases: ['upper jaw', 'maxillae', 'maxillary bone'], note: 'The upper jaw. It holds the upper teeth and forms the floor of the eye socket and the sides of the nose.' }),
  b('nasal', 'Nasal bone', { region: 'axial', level: 3, parent: 'skull', aliases: ['nose bone', 'bridge of the nose'], note: 'Two small bones that form the bridge of the nose. The rest of the nose is cartilage.' }),
  b('mandible', 'Mandible', { region: 'axial', aliases: ['jaw', 'jawbone', 'jaw bone', 'lower jaw'], note: 'The lower jaw and the only skull bone that moves. It holds the lower teeth.' }),

  /* spine */
  b('spine', 'Vertebral column', { region: 'axial', splitAt: 2, aliases: ['spine', 'backbone', 'spinal column', 'vertebrae'], note: 'A stack of vertebrae that shields the spinal cord and carries the weight of the upper body. Twenty-four of them stay mobile.' }),
  b('cervical', 'Cervical vertebrae', { region: 'axial', level: 2, parent: 'spine', aliases: ['cervical spine', 'neck vertebrae', 'neck bones'], note: 'Seven neck vertebrae, the smallest and most mobile. The first two, atlas and axis, allow nodding and turning.' }),
  b('thoracic', 'Thoracic vertebrae', { region: 'axial', level: 2, parent: 'spine', aliases: ['thoracic spine', 'chest vertebrae'], note: 'Twelve vertebrae that each carry a pair of ribs and form the back of the rib cage.' }),
  b('lumbar', 'Lumbar vertebrae', { region: 'axial', level: 2, parent: 'spine', aliases: ['lumbar spine', 'lower back vertebrae'], note: 'Five large vertebrae in the lower back. They bear the greatest load of the spine.' }),

  /* thorax */
  b('sternum', 'Sternum', { region: 'axial', splitAt: 3, aliases: ['breastbone', 'breast bone'], note: 'The breastbone. A flat bone in three parts that anchors the upper seven pairs of ribs.' }),
  b('manubrium', 'Manubrium', { region: 'axial', level: 3, parent: 'sternum', note: 'The broad top of the sternum. It joins the clavicles and the first pair of ribs.' }),
  b('sternal-body', 'Body of the sternum', { region: 'axial', level: 3, parent: 'sternum', aliases: ['sternal body', 'gladiolus', 'body of sternum'], note: 'The long middle piece of the sternum, where most of the true ribs attach.' }),
  b('xiphoid', 'Xiphoid process', { region: 'axial', level: 3, parent: 'sternum', aliases: ['xiphoid', 'xiphisternum'], note: 'The small tip of the sternum. It is mostly cartilage in youth and gradually ossifies with age.' }),
  b('ribs', 'Ribs', { region: 'axial', splitAt: 3, aliases: ['rib', 'rib cage', 'ribcage', 'thoracic cage'], frame: 'both', note: 'Twelve pairs of curved bones that enclose the heart and lungs and swing with each breath.' }),
  b('true-ribs', 'True ribs', { region: 'axial', level: 3, parent: 'ribs', frame: 'both', aliases: ['vertebrosternal ribs', 'ribs 1-7'], note: 'Ribs 1 to 7 reach the sternum directly through their own costal cartilage.' }),
  b('false-ribs', 'False ribs', { region: 'axial', level: 3, parent: 'ribs', frame: 'both', aliases: ['vertebrochondral ribs', 'ribs 8-10'], note: 'Ribs 8 to 10 join the sternum indirectly, through the cartilage of the rib above.' }),
  b('floating-ribs', 'Floating ribs', { region: 'axial', level: 3, parent: 'ribs', frame: 'both', aliases: ['vertebral ribs', 'ribs 11-12'], note: 'Ribs 11 and 12 have no front attachment and end in the muscles of the abdominal wall.' }),
  b('costal-cartilage', 'Costal cartilage', { region: 'axial', level: 2, parent: 'ribs', frame: 'both', aliases: ['costal cartilages', 'rib cartilage'], note: 'Flexible hyaline cartilage that joins the ribs to the sternum and lets the chest expand.' }),

  /* shoulder + arm */
  b('clavicle', 'Clavicle', { region: 'upper', aliases: ['collarbone', 'collar bone'], note: 'The collarbone braces the shoulder away from the chest. It is one of the most frequently broken bones.' }),
  b('scapula', 'Scapula', { region: 'upper', aliases: ['shoulder blade', 'shoulderblade', 'scapulae'], note: 'The shoulder blade. A flat triangle that glides over the back of the rib cage and holds the socket for the arm.' }),
  b('humerus', 'Humerus', { region: 'upper', note: 'The long bone of the upper arm. Its rounded head fits into the shoulder socket.' }),
  b('radius', 'Radius', { region: 'upper', note: 'The forearm bone on the thumb side. It rotates around the ulna to turn the palm.' }),
  b('ulna', 'Ulna', { region: 'upper', note: 'The forearm bone on the little-finger side. Its upper end forms the point of the elbow, the olecranon.' }),
  b('carpals', 'Carpals', { region: 'upper', level: 2, splitAt: 3, aliases: ['carpal', 'wrist bones', 'wrist'], note: 'Eight small bones in two rows that make up the wrist.' }),
  b('scaphoid', 'Scaphoid', { region: 'upper', level: 3, parent: 'carpals', aliases: ['navicular of the hand'], note: 'The boat-shaped bone on the thumb side, most often broken in a fall on an outstretched hand.' }),
  b('lunate', 'Lunate', { region: 'upper', level: 3, parent: 'carpals', note: 'A crescent-shaped bone in the middle of the proximal row, resting against the radius.' }),
  b('triquetrum', 'Triquetrum', { region: 'upper', level: 3, parent: 'carpals', aliases: ['triquetral', 'triquetral bone'], note: 'A pyramid-shaped bone on the little-finger side of the proximal row.' }),
  b('pisiform', 'Pisiform', { region: 'upper', level: 3, parent: 'carpals', note: 'A pea-sized bone that sits in front of the triquetrum. It is the smallest carpal.' }),
  b('trapezium', 'Trapezium', { region: 'upper', level: 3, parent: 'carpals', note: 'Its saddle-shaped surface gives the thumb its wide range of movement.' }),
  b('trapezoid', 'Trapezoid', { region: 'upper', level: 3, parent: 'carpals', note: 'The smallest bone of the distal row, wedged between the trapezium and the capitate.' }),
  b('capitate', 'Capitate', { region: 'upper', level: 3, parent: 'carpals', note: 'The largest carpal, sitting at the centre of the wrist.' }),
  b('hamate', 'Hamate', { region: 'upper', level: 3, parent: 'carpals', note: 'Recognised by its hooked process, which lies beside the ulnar nerve.' }),
  b('metacarpals', 'Metacarpals', { region: 'upper', level: 2, aliases: ['metacarpal', 'palm bones'], note: 'Five long bones that form the palm, numbered I to V from the thumb.' }),
  b('hand-phalanges', 'Phalanges (hand)', { region: 'upper', level: 2, aliases: ['phalanges', 'phalanx', 'finger bones', 'hand phalanges', 'phalanges of the hand', 'fingers'], note: 'Fourteen finger bones: two in the thumb and three in each finger.' }),

  /* pelvis + leg */
  b('pelvis', 'Pelvis', { region: 'lower', splitAt: 2, frame: 'both', aliases: ['pelvic girdle', 'pelvic bones'], note: 'A ring of the two hip bones, the sacrum and the coccyx. It transfers the weight of the trunk to the legs.' }),
  b('hip-bone', 'Hip bone', { region: 'lower', level: 2, parent: 'pelvis', splitAt: 3, frame: 'both', aliases: ['os coxae', 'coxal bone', 'innominate bone', 'pelvic bone', 'hip'], note: 'Each hip bone is three bones fused during adolescence: the ilium, ischium and pubis.' }),
  b('ilium', 'Ilium', { region: 'lower', level: 3, parent: 'hip-bone', frame: 'both', aliases: ['iliac bone', 'iliac wing'], note: 'The broad, fan-shaped upper part of the hip bone. Its upper edge is the iliac crest.' }),
  b('ischium', 'Ischium', { region: 'lower', level: 3, parent: 'hip-bone', frame: 'both', note: 'The lower, rear part of the hip bone. You sit on its ischial tuberosities.' }),
  b('pubis', 'Pubis', { region: 'lower', level: 3, parent: 'hip-bone', frame: 'both', aliases: ['pubic bone'], note: 'The front part of the hip bone. The two pubic bones meet at the pubic symphysis.' }),
  b('sacrum', 'Sacrum', { region: 'axial', level: 2, parent: 'pelvis', note: 'Five fused vertebrae forming a wedge that locks between the hip bones at the sacroiliac joints.' }),
  b('coccyx', 'Coccyx', { region: 'axial', level: 3, parent: 'sacrum', aliases: ['tailbone', 'tail bone'], note: 'The tailbone. Three to five small fused vertebrae, a remnant of a tail.' }),
  b('femur', 'Femur', { region: 'lower', aliases: ['thigh bone', 'thighbone'], note: 'The thigh bone, the longest and strongest bone in the body.' }),
  b('patella', 'Patella', { region: 'lower', aliases: ['kneecap', 'knee cap'], note: 'The kneecap. A sesamoid bone embedded in the quadriceps tendon.' }),
  b('tibia', 'Tibia', { region: 'lower', aliases: ['shin bone', 'shinbone', 'shin'], note: 'The shin bone. It carries most of the body weight below the knee.' }),
  b('fibula', 'Fibula', { region: 'lower', aliases: ['calf bone'], note: 'The slender bone beside the tibia. It bears little weight but steadies the ankle.' }),
  b('tarsals', 'Tarsals', { region: 'lower', level: 2, splitAt: 3, aliases: ['tarsal', 'ankle bones'], note: 'Seven bones of the ankle and hindfoot. The heel bone is the largest.' }),
  b('talus', 'Talus', { region: 'lower', level: 3, parent: 'tarsals', aliases: ['ankle bone', 'astragalus'], note: 'Sits between the tibia and fibula and passes body weight into the foot.' }),
  b('calcaneus', 'Calcaneus', { region: 'lower', level: 3, parent: 'tarsals', aliases: ['heel bone', 'heelbone', 'calcaneum'], note: 'The heel bone and largest tarsal. The Achilles tendon attaches to it.' }),
  b('navicular', 'Navicular', { region: 'lower', level: 3, parent: 'tarsals', aliases: ['tarsal navicular'], note: 'A boat-shaped bone on the inner side of the foot that helps hold up the medial arch.' }),
  b('cuboid', 'Cuboid', { region: 'lower', level: 3, parent: 'tarsals', note: 'On the outer side of the foot, meeting the fourth and fifth metatarsals.' }),
  b('cuneiforms', 'Cuneiforms', { region: 'lower', level: 3, parent: 'tarsals', aliases: ['cuneiform', 'cuneiform bones'], note: 'Three wedge-shaped bones, medial, intermediate and lateral, linking the navicular to the first three metatarsals.' }),
  b('metatarsals', 'Metatarsals', { region: 'lower', level: 2, aliases: ['metatarsal'], note: 'Five long bones of the midfoot, numbered I to V from the big toe.' }),
  b('foot-phalanges', 'Phalanges (foot)', { region: 'lower', level: 2, aliases: ['phalanges', 'phalanx', 'toe bones', 'foot phalanges', 'phalanges of the foot', 'toes'], note: 'Fourteen toe bones: two in the big toe and three in each other toe.' }),
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
  const raw = [bone.name, ...bone.aliases];
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
