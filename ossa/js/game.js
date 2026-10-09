import { buildSkeleton, renderMarkup } from './skeleton.js';
import * as dataMod from './data.js';

export const id = 'ossa';
export const text = { noun: 'bone', nouns: 'bones' };
export const data = dataMod;
export const regionOrder = ['axial', 'upper', 'lower'];
export const anchorVia = { cranium: 'frontal', sternum: 'sternal-body', ribs: 'true-ribs', pelvis: 'ilium', carpals: 'scaphoid', tarsals: 'navicular' };
export const view = { contentH: 1052, minW: 500, cx: 450, cy: 516, clampX: [180, 720], clampY: [0, 1032] };
export const buildFigure = buildSkeleton;
export { renderMarkup };

// v2 folded Extended into Core and renumbered Complete from 3 to 2, so old saved setups and bests no longer apply
export function migrate(saved, store, P) {
  if (store.get(`${P}.v`) === 2) return;
  if (saved.level === 3) saved.level = 2; else if (saved.level === 2) saved.level = 1;
  try { Object.keys(localStorage).filter((k) => k.startsWith(`${P}.best.`)).forEach((k) => localStorage.removeItem(k)); } catch { /* storage unavailable */ }
  store.set(`${P}.cfg`, saved);
  store.set(`${P}.v`, 2);
}
