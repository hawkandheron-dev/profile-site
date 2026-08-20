/**
 * Presentation config for CH Timeline 2.0.
 *
 * Same shape as churchHistoryConfig in churchHistoryData.js, plus three blocks
 * the 1.0 timeline has no use for:
 *
 *   palette — canvas colours, so the shared renderer can draw on white instead
 *             of parchment without the other five apps changing
 *   depth   — how far "back" the background layer sits, and how it comes forward
 *   layers  — which filter keys belong to which layer, so the legend can drive
 *             two independent filter sets
 *
 * Data comes from churchHistory2Adapter.js; the era swatches come from
 * churchHistory2Eras.js so the legend and the bars can never disagree.
 */
import { CH2_ERAS } from './churchHistory2Eras.js';
import { NICENE_GOLD, NICENE_LINE } from './heresiesData.js';

/** Back-layer colours, shared with the adapter so key and bar always match. */
export const BACK_STYLES = {
  emperors:   { color: '#6d4c41', label: 'Emperors & monarchs' },
  heresiarchs:{ color: '#b3261e', label: 'Heresiarchs' },
  contested:  { color: '#e08a1e', label: 'Contested figures' },
  movements:  { color: '#8e5a8e', label: 'Movements & schisms' },
  councils:   { color: '#4caf50', label: 'Councils' },
  documents:  { color: '#c79a1e', label: 'Texts & creeds' },
  events:     { color: '#e07a3a', label: 'Events' },
};

/** Every filter key that belongs to the background layer. */
export const BACK_FILTER_KEYS = Object.keys(BACK_STYLES);

/** Every filter key that belongs to the foreground layer (one per era). */
export const FRONT_FILTER_KEYS = CH2_ERAS.map(era => era.id);

export const churchHistory2Config = {
  siteTitle: 'History of the Christian Church',
  initialViewport: {
    startDate: '0001-01-01',
    endDate: '0500-12-31',
  },
  eraLabels: 'BC/AD',
  maxTimeSpan: 2000,
  laneOrder: ['people', 'points', 'periods'],

  /**
   * Canvas colours for a white ground. Passed through Timeline → TimelineCanvas
   * → rendering.js; every draw function defaults to the parchment values when
   * this is absent, which is how the 1.0 pages stay pixel-identical.
   */
  palette: {
    ground: '#ffffff',
    axis: '#c9c4bc',
    axisText: '#5a5a55',
    axisTick: '#b8b3aa',
    guide: 'rgba(30, 28, 24, 0.07)',
    // The 1.0 pages label figures in white on near-black, which reads as a
    // wall of dark blocks once the parchment is gone. On white the bar's era
    // colour should carry, so the label backs off to a light scrim.
    labelText: '#1e1c18',
    labelBg: 'rgba(255, 255, 255, 0.86)',
  },

  /**
   * The background layer's resting state, and what "in focus" means.
   * `scale` is applied about the shared axis, never on X — the back layer has
   * to stay time-true or a reign lands under the wrong year the moment it
   * sharpens. That same scale is the vertical foreshortening; there is no
   * separate pan multiplier, which would unregister the two axes.
   */
  depth: {
    blur: 2.6,
    opacity: 0.46,
    saturate: 0.55,
    scale: 0.965,
    // Partial lift on hover, full lift on click or Alt-hold.
    hoverBlur: 1.1,
    hoverOpacity: 0.8,
    transitionMs: 220,
  },

  /** The christological spine, drawn as a chain across the people lane. */
  chains: [
    {
      id: 'nicene-line',
      name: 'The Nicene line',
      color: NICENE_GOLD,
      memberIds: NICENE_LINE,
    },
  ],

  legend: [
    { type: 'heading', id: 'heading-eras', name: 'Eras' },
    ...CH2_ERAS.map(era => ({
      type: 'people',
      id: era.id,
      name: era.name,
      color: era.color,
      filterKey: era.id,
    })),

    { type: 'heading', id: 'heading-background', name: 'Background' },
    { type: 'people', id: 'back-emperors',    name: BACK_STYLES.emperors.label,    color: BACK_STYLES.emperors.color,    filterKey: 'emperors', isMonarch: true },
    { type: 'people', id: 'back-heresiarchs', name: BACK_STYLES.heresiarchs.label, color: BACK_STYLES.heresiarchs.color, filterKey: 'heresiarchs' },
    { type: 'people', id: 'back-contested',   name: BACK_STYLES.contested.label,   color: BACK_STYLES.contested.color,   filterKey: 'contested' },
    { type: 'bracket', id: 'back-movements',  name: BACK_STYLES.movements.label,   color: BACK_STYLES.movements.color,   filterKey: 'movements' },
    { type: 'point', id: 'back-councils',     name: BACK_STYLES.councils.label,    color: BACK_STYLES.councils.color,    shape: 'cross',     filterKey: 'councils' },
    { type: 'point', id: 'back-documents',    name: BACK_STYLES.documents.label,   color: BACK_STYLES.documents.color,   shape: 'book',      filterKey: 'documents' },
    { type: 'point', id: 'back-events',       name: BACK_STYLES.events.label,      color: BACK_STYLES.events.color,      shape: 'reference', filterKey: 'events' },
  ],
};
