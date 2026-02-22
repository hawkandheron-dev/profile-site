/**
 * Catmull-Rom spline interpolation for journey route smoothing.
 * Takes an array of [lng, lat] coordinates and returns a denser array
 * with smoothly interpolated points between each pair.
 */

/**
 * Standard Catmull-Rom interpolation between p1 and p2.
 *
 * Uses the matrix form with parameter tau (tangent magnitude):
 *   q(t) = p1
 *        + (-tau*p0 + tau*p2) * t
 *        + (2*tau*p0 + (tau-3)*p1 + (3-2*tau)*p2 - tau*p3) * t²
 *        + (-tau*p0 + (2-tau)*p1 + (tau-2)*p2 + tau*p3) * t³
 *
 * Guarantees q(0)=p1 and q(1)=p2.  tau=0.5 gives the standard
 * Catmull-Rom spline; lower values produce tighter curves.
 */
function catmullRom(t, p0, p1, p2, p3, tau = 0.5) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    p1 +
    (-tau * p0 + tau * p2) * t +
    (2 * tau * p0 + (tau - 3) * p1 + (3 - 2 * tau) * p2 - tau * p3) * t2 +
    (-tau * p0 + (2 - tau) * p1 + (tau - 2) * p2 + tau * p3) * t3
  );
}

/**
 * Smooth a route of [lng, lat] coordinates using Catmull-Rom interpolation.
 *
 * @param {Array<[number, number]>} coords – raw route coordinates [lng, lat]
 * @param {Object} [opts]
 * @param {number} [opts.tension=0.5] – tau parameter (0.5 = standard, lower = tighter)
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
