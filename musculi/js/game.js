import { buildMuscles, renderMarkup } from './figure.js';
import * as dataMod from './data.js';

export const id = 'musculi';
export const text = { noun: 'muscle', nouns: 'muscles' };
export const data = dataMod;
export const regionOrder = ['axial', 'upper', 'lower'];
export const anchorVia = { quadriceps: 'rectus-femoris' };
export const view = { contentH: 1040, minW: 900, cx: 630, cy: 516, clampX: [0, 1260], clampY: [0, 1032] };
export const buildFigure = buildMuscles;
export { renderMarkup };
