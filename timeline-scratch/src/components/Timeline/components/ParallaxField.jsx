/**
 * The depth field behind CH Timeline 2.0.
 *
 * 1.0 put a photographed manuscript behind the timeline and slid it slowly as
 * you panned. 2.0 works on white, so the sense of depth has to come from
 * something with no texture of its own: three strata of grey rules, each
 * drifting at a different fraction of the pan. The near stratum keeps pace
 * with the year axis; the far ones lag, and the lag is the depth cue.
 *
 * This is the same mechanism the manuscript layer used — a CSS transform
 * driven by viewport state — with a repeating gradient instead of a photo, so
 * there is no image to download and nothing to go blurry when zoomed.
 */

/**
 * Vertical rules: spacing in px, alpha, and how much of the pan they take.
 * Ordered far → near, which is also back → front in paint order.
 */
const STRATA = [
  { spacing: 240, alpha: 0.045, driftX: 0.35, driftY: 0.30 },
  { spacing: 120, alpha: 0.065, driftX: 0.60, driftY: 0.55 },
  { spacing: 60,  alpha: 0.075, driftX: 0.85, driftY: 0.80 },
];

/** Horizontal rules, so vertical panning has something to move against. */
const HORIZON = { spacing: 96, alpha: 0.04, driftY: 0.45 };

export function ParallaxField({ viewportStartYear, yearsPerPixel, panOffsetY }) {
  // Pixels the viewport has travelled along the time axis. Dividing by
  // yearsPerPixel keeps the drift proportional at every zoom level, so the
  // field doesn't tear away from the content when you zoom out.
  const travelX = viewportStartYear / (yearsPerPixel || 1);

  return (
    <div className="ch2-parallax" aria-hidden="true">
      {STRATA.map((stratum, i) => (
        <div
          key={i}
          className="ch2-parallax-stratum"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, rgba(28, 26, 22, ${stratum.alpha}) 0 1px, transparent 1px ${stratum.spacing}px)`,
            transform: `translate3d(${-(travelX * stratum.driftX) % stratum.spacing}px, ${-(panOffsetY * stratum.driftY) % stratum.spacing}px, 0)`,
          }}
        />
      ))}
      <div
        className="ch2-parallax-stratum"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, rgba(28, 26, 22, ${HORIZON.alpha}) 0 1px, transparent 1px ${HORIZON.spacing}px)`,
          transform: `translate3d(0, ${-(panOffsetY * HORIZON.driftY) % HORIZON.spacing}px, 0)`,
        }}
      />
    </div>
  );
}
