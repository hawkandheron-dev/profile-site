/**
 * Catmull-Rom spline interpolation for journey route smoothing.
 * Takes an array of [lng, lat] coordinates and returns a denser array
 * with smoothly interpolated points between each pair.
 */

/**
 * Interpolate a single Catmull-Rom point between p1 and p2 using control
 * points p0 and p3.
 * @param {number} t  – parameter 0..1
 * @param {number} p0 – control point before segment start
 * @param {number} p1 – segment start
 * @param {number} p2 – segment end
 * @param {number} p3 – control point after segment end
 * @param {number} tension – 0 = uniform, 0.5 = centripetal (default)
 */
function catmullRom(t, p0, p1, p2, p3, tension = 0.5) {
  const t2 = t * t;
  const t3 = t2 * t;
  const s = (1 - tension) / 2;

  return (
    (2 * p1) +
    (-p0 + p2) * s * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * s * t3
  );
}

/**
 * Smooth a route of [lng, lat] coordinates using Catmull-Rom interpolation.
 *
 * @param {Array<[number, number]>} coords – raw route coordinates [lng, lat]
 * @param {Object} [opts]
 * @param {number} [opts.tension=0.5]
 * @param {number} [opts.pointsPerSegment=10]
 * @param {Map<number, Array<[number, number]>>} [waypointsMap]
 *   Optional map of segment index → extra waypoints to insert between
 *   coords[i] and coords[i+1] before smoothing.
 * @returns {Array<[number, number]>} smoothed coordinates
 */
export function smoothRoute(coords, opts = {}, waypointsMap = null) {
  if (!coords || coords.length < 2) return coords || [];

  const { tension = 0.5, pointsPerSegment = 10 } = opts;

  // If waypoints are provided, splice them into the coords first
  let expanded = coords;
  if (waypointsMap && waypointsMap.size > 0) {
    expanded = [];
    for (let i = 0; i < coords.length; i++) {
      expanded.push(coords[i]);
      const wp = waypointsMap.get(i);
      if (wp && i < coords.length - 1) {
        wp.forEach(p => expanded.push(p));
      }
    }
  }

  if (expanded.length < 2) return expanded;

  const result = [];

  for (let i = 0; i < expanded.length - 1; i++) {
    const p0 = expanded[Math.max(0, i - 1)];
    const p1 = expanded[i];
    const p2 = expanded[i + 1];
    const p3 = expanded[Math.min(expanded.length - 1, i + 2)];

    // Always include the segment start
    if (i === 0) result.push(p1);

    for (let t = 1; t <= pointsPerSegment; t++) {
      const frac = t / pointsPerSegment;
      result.push([
        catmullRom(frac, p0[0], p1[0], p2[0], p3[0], tension),
        catmullRom(frac, p0[1], p1[1], p2[1], p3[1], tension),
      ]);
    }
  }

  return result;
}
