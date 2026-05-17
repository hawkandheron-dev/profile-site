// Small Path2D icons painted inside person/household/traveler bubbles on the
// connection web. SVG path strings live in a 24x24 viewBox; the renderer
// scales them to fit each node radius.

const MALE_PROFILE = 'M6 3 C4 3 3 5 3 8 C3 11 4 13 6 14 L6 15.5 C3.5 15.5 2.5 17 2.5 19.5 L2.5 22 L17 22 L17 19.5 C17 17 16 15.5 13.5 15 L13.5 12.5 C15.5 11.5 16 9.5 16 8 L19 9.5 L16 11 L16 13 C15.2 13.4 14.2 13.4 13.5 12.5 Z';

const FEMALE_PROFILE = 'M7 3 C4 3 3 5.5 3 8 C3 9.5 3.2 10.8 3.6 11.5 L1.5 12.5 C1 14.5 2.2 16.2 4.5 16 L4.5 16.5 L5.5 16.5 L5.5 17.5 C3 17.5 2.2 19.2 2.2 22 L17 22 L17 19.5 C17 17 16 15.5 13.5 15 L13.5 12.5 C15.2 11.5 16 9.5 16 8 L19 9.5 L16 11 L16 13 C15.2 13.4 14.2 13.4 13.5 12.5 Z';

const HOUSE = 'M12 2.5 L1.5 12 L4 12 L4 21.5 L9.5 21.5 L9.5 15 L14.5 15 L14.5 21.5 L20 21.5 L20 12 L22.5 12 Z';

// Footprint heel/arch body (sole). Toes are added as ellipses.
const FOOT_BODY = 'M11 14 C11 9 13 7 11.5 6 C9 4.5 6 8 6 13 C6 19 8 21.5 11 21.5 C13.5 21.5 14.5 19 14.5 16 C14.5 15 13.5 14 11 14 Z';
const FOOT_TOES = [
  { cx: 14,   cy: 5.5,  rx: 1.7, ry: 2.1 },
  { cx: 16.6, cy: 7,    rx: 1.4, ry: 1.8 },
  { cx: 18.3, cy: 8.8,  rx: 1.2, ry: 1.5 },
  { cx: 19.5, cy: 10.7, rx: 1.0, ry: 1.3 },
  { cx: 20.1, cy: 12.7, rx: 0.9, ry: 1.1 },
];

function buildFootPath() {
  const p = new Path2D(FOOT_BODY);
  FOOT_TOES.forEach(t => {
    const e = new Path2D();
    e.ellipse(t.cx, t.cy, t.rx, t.ry, 0, 0, Math.PI * 2);
    p.addPath(e);
  });
  return p;
}

let cachedPaths = null;

function getPaths() {
  if (cachedPaths) return cachedPaths;
  cachedPaths = {
    male: new Path2D(MALE_PROFILE),
    female: new Path2D(FEMALE_PROFILE),
    house: new Path2D(HOUSE),
    foot: buildFootPath(),
  };
  return cachedPaths;
}

/**
 * Choose which icon represents a node.
 *   - traveler  → foot (person with 2+ churches)
 *   - household → house
 *   - person    → female/male profile based on gender (falls back to male)
 */
export function iconKeyFor(node) {
  if (node.type === 'household') return 'house';
  if (node.type === 'person') {
    if (node.isTraveler) return 'foot';
    const g = (node.gender || '').toLowerCase();
    if (g === 'f' || g === 'female' || g === 'w' || g === 'woman') return 'female';
    return 'male';
  }
  return null;
}

/**
 * Draw a single icon centred at (x, y) sized to fit a circle of radius r.
 * Pass a contrasting fillStyle on ctx before calling.
 */
export function drawNodeIcon(ctx, key, x, y, r) {
  if (!key) return;
  const path = getPaths()[key];
  if (!path) return;
  const scale = (r * 1.7) / 24; // icon fills ~85% of the circle
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.translate(-12, -12);
  ctx.fill(path);
  ctx.restore();
}
