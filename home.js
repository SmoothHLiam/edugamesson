// Draws the annotated skeleton plate in the hero from the same geometry the game uses.
import { buildSkeleton, renderMarkup } from '/ossa/js/skeleton.js';

const CX = 450;
const svg = document.getElementById('plate');

// Anchor points sit on the bone; leaders run horizontally out to a label column.
const LABELS = [
  { n: '01', name: 'Cranium', side: 'L', x: CX - 17, y: 49, ids: ['parietal', 'frontal', 'temporal', 'zygomatic', 'maxilla', 'nasal'] },
  { n: '02', name: 'Clavicle', side: 'R', x: CX + 70, y: 196, ids: ['clavicle'] },
  { n: '03', name: 'Humerus', side: 'L', x: CX - 104, y: 290, ids: ['humerus'] },
  { n: '04', name: 'Radius', side: 'R', x: CX + 133, y: 450, ids: ['radius'] },
  { n: '05', name: 'Femur', side: 'L', x: CX - 53, y: 640, ids: ['femur'] },
  { n: '06', name: 'Patella', side: 'R', x: CX + 44, y: 668, ids: ['patella'] },
  { n: '07', name: 'Fibula', side: 'L', x: CX - 61.5, y: 800, ids: ['fibula'] },
  { n: '08', name: 'Calcaneus', side: 'R', x: CX + 60, y: 908, ids: ['calcaneus'] },
];
const DEFAULT = 'Femur';

if (svg) {
  const markup = renderMarkup(buildSkeleton());
  const labels = LABELS.map((l) => {
    const left = l.side === 'L';
    const x1 = left ? 244 : 656;
    const tx = left ? 236 : 664;
    const path = `M${x1},${l.y}L${l.x},${l.y}`;
    return `<g class="lab" data-name="${l.name}">
      <rect class="area" x="${left ? 90 : 650}" y="${l.y - 20}" width="${left ? 160 : 160}" height="40"/>
      <path class="halo" d="${path}"/><path class="leader" d="${path}"/>
      <circle class="pin" cx="${l.x}" cy="${l.y}" r="6.5"/>
      <text x="${tx}" y="${l.y}" dy="0.35em" text-anchor="${left ? 'end' : 'start'}"><tspan class="n">${l.n}</tspan> ${l.name}</text>
    </g>`;
  }).join('');

  svg.innerHTML = `<g class="layer-bones">${markup.bones}</g><g class="layer-hl"></g><g class="layer-rims">${markup.rims}</g><g class="layer-voids">${markup.voids}</g><g class="labels">${labels}</g>`;

  const layerHl = svg.querySelector('.layer-hl');
  const bones = [...svg.querySelectorAll('.layer-bones .bone')];
  const labs = [...svg.querySelectorAll('.lab')];

  const show = (name) => {
    const l = LABELS.find((x) => x.name === name);
    layerHl.textContent = '';
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'hl');
    bones.forEach((b) => {
      if (!l.ids.includes(b.dataset.bone)) return;
      const c = b.cloneNode(true);
      c.querySelectorAll('.hit').forEach((h) => h.remove());
      g.appendChild(c);
    });
    layerHl.appendChild(g);
    svg.classList.add('focus');
    labs.forEach((el) => el.classList.toggle('on', el.dataset.name === name));
  };

  show(DEFAULT);
  labs.forEach((el) => {
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(el.dataset.name); });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') show(DEFAULT); });
  });
}
