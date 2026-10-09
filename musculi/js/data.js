// Muscle catalogue. Same fields as the Ossa catalogue (see ossa/js/data.js).
// Ids without geometry (quadriceps) are parents that merge their drawn parts at Core.
import { makeCatalog } from '/engine/catalog.js';

export const LEVELS = {
  1: { key: 'core', label: 'Core' },
  2: { key: 'complete', label: 'Complete' },
};

export const REGIONS = {
  all: 'Whole body',
  axial: 'Neck and trunk',
  upper: 'Shoulder and arm',
  lower: 'Hip and leg',
};

const m = (id, name, o) => ({ id, name, syn: [], everyday: [], level: 1, parent: null, splitAt: 0, frame: 'primary', ...o });

export const BONES = [
  /* neck and trunk */
  m('trapezius', 'Trapezius', { region: 'axial', syn: ['trapezius muscle'], everyday: ['upper back and neck muscle', 'traps'], note: 'A broad diamond from the skull to the middle of the back. It lifts, lowers and draws back the shoulder blade.' }),
  m('sternocleidomastoid', 'Sternocleidomastoid', { region: 'axial', level: 2, syn: ['sternomastoid', 'scm'], everyday: ['neck muscle'], note: 'The strap running from behind the ear to the breastbone and collarbone. It turns and tilts the head.' }),
  m('pectoralis', 'Pectoralis major', { region: 'axial', syn: ['pectoralis', 'pectoral'], everyday: ['chest muscle', 'pecs'], note: 'The large fan of the chest. It pulls the arm across the body and rotates it inward.' }),
  m('serratus', 'Serratus anterior', { region: 'axial', level: 2, syn: ['serratus'], everyday: ['saw-toothed muscle on the ribs'], note: 'Finger-like slips on the side of the ribs. It holds the shoulder blade against the chest wall.' }),
  m('abdominal', 'Abdominals (rectus abdominis)', { region: 'axial', syn: ['abdominal', 'rectus abdominis', 'rectus abdominus', 'abdominis'], everyday: ['abs', 'six-pack', 'stomach muscles'], note: 'The paired vertical straps of the front of the trunk, divided into segments by tendon. They bend the trunk forward.' }),
  m('oblique', 'Obliques', { region: 'axial', syn: ['oblique', 'external oblique', 'external obliques', 'external abdominal oblique'], everyday: ['side abs', 'love handles'], note: 'The muscles on the sides of the abdomen. They twist and side-bend the trunk.' }),
  m('latissimus', 'Latissimus dorsi', { region: 'axial', syn: ['latissimus', 'lat dorsi'], everyday: ['lats', 'wing muscle', 'large back muscle'], note: 'The widest muscle of the back. It pulls the arm down and back, as in a rowing or climbing stroke.' }),

  /* shoulder and arm */
  m('deltoid', 'Deltoid', { region: 'upper', frame: 'both', syn: ['deltoid muscle'], everyday: ['shoulder muscle', 'shoulder cap'], note: 'The rounded cap of the shoulder. Its front, middle and rear parts raise the arm in different directions.' }),
  m('infraspinatus', 'Infraspinatus', { region: 'upper', level: 2, syn: [], everyday: ['rotator cuff muscle on the shoulder blade'], note: 'A rotator cuff muscle on the back of the shoulder blade. It turns the arm outward.' }),
  m('teres-major', 'Teres major', { region: 'upper', level: 2, syn: ['teres'], everyday: ['lat helper'], note: 'A thick strip under the armpit at the back. It pulls the arm down and rotates it inward.' }),
  m('biceps', 'Biceps brachii', { region: 'upper', syn: ['biceps', 'bicep', 'bicep brachii'], everyday: ['front of the upper arm', 'arm muscle'], note: 'The front of the upper arm. It bends the elbow and turns the palm up.' }),
  m('triceps', 'Triceps brachii', { region: 'upper', syn: ['triceps', 'tricep', 'tricep brachii'], everyday: ['back of the upper arm'], note: 'The back of the upper arm, with three heads. It straightens the elbow.' }),
  m('forearm-flexors', 'Forearm flexors', { region: 'upper', level: 2, syn: ['flexors', 'wrist flexors', 'flexor group'], everyday: ['inner forearm muscles'], note: 'A group on the palm side of the forearm that bends the wrist and fingers.' }),
  m('forearm-extensors', 'Forearm extensors', { region: 'upper', level: 2, syn: ['extensors', 'wrist extensors', 'extensor group'], everyday: ['outer forearm muscles'], note: 'A group on the back of the forearm that straightens the wrist and fingers.' }),

  /* hip and leg */
  m('gluteus', 'Gluteus maximus', { region: 'lower', syn: ['gluteus', 'glute maximus', 'glutes maximus', 'gluteal', 'glutus maximus', 'glukus maximus'], everyday: ['buttock muscle', 'glutes', 'butt muscle'], note: 'The largest muscle of the body by mass. It drives the thigh back when you climb, sprint or stand up.' }),
  m('quadriceps', 'Quadriceps', { region: 'lower', splitAt: 2, frame: 'both', syn: ['quadricep', 'quadriceps femoris', 'quad'], everyday: ['front of the thigh', 'quads'], note: 'Four heads on the front of the thigh that straighten the knee. Rectus femoris also flexes the hip.' }),
  m('rectus-femoris', 'Rectus femoris', { region: 'lower', level: 2, parent: 'quadriceps', syn: [], everyday: ['middle of the front thigh'], note: 'The central head of the quadriceps and the only one that crosses the hip joint.' }),
  m('vastus-lateralis', 'Vastus lateralis', { region: 'lower', level: 2, parent: 'quadriceps', syn: ['vastus lateral'], everyday: ['outer front thigh'], note: 'The largest head of the quadriceps, on the outer side of the thigh.' }),
  m('vastus-medialis', 'Vastus medialis', { region: 'lower', level: 2, parent: 'quadriceps', syn: ['vastus medial'], everyday: ['teardrop muscle above the knee'], note: 'The inner head of the quadriceps. Its lower fibres bulge above the inside of the knee.' }),
  m('sartorius', 'Sartorius', { region: 'lower', level: 2, syn: [], everyday: ['tailor\'s muscle', 'longest muscle'], note: 'The longest muscle in the body, a ribbon running diagonally across the front of the thigh.' }),
  m('adductors', 'Adductors', { region: 'lower', level: 2, syn: ['adductor', 'adductor group', 'adductor magnus', 'adductor longus'], everyday: ['inner thigh muscles', 'groin muscles'], note: 'The inner thigh group that pulls the leg toward the midline.' }),
  m('hamstrings', 'Hamstrings', { region: 'lower', syn: ['hamstring', 'hamstring muscles', 'biceps femoris'], everyday: ['back of the thigh'], note: 'Three muscles on the back of the thigh that bend the knee and extend the hip.' }),
  m('gastrocnemius', 'Gastrocnemius', { region: 'lower', frame: 'both', syn: ['gastroc', 'gastrocnemius muscle'], everyday: ['calf', 'calf muscle'], note: 'The two-headed muscle that forms the bulk of the calf. It points the foot through the Achilles tendon.' }),
  m('soleus', 'Soleus', { region: 'lower', level: 2, syn: [], everyday: ['deep calf muscle'], note: 'A flat muscle under the gastrocnemius. It does most of the work of standing on tiptoe.' }),
  m('tibialis', 'Tibialis anterior', { region: 'lower', level: 2, syn: ['tibialis', 'anterior tibialis'], everyday: ['shin muscle'], note: 'The muscle beside the shin bone. It lifts the foot upward at the ankle.' }),
];

export const { BY_ID, isAsked, resolve, questionSet, judge, everydayHit } = makeCatalog(BONES);
