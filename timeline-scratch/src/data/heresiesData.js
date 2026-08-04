/**
 * Config for the Heresies & Christological Controversies timeline.
 *
 * Data comes from Supabase (see heresiesSupabaseAdapter.js); this file holds
 * only the presentation config, in the same shape as churchHistoryConfig in
 * churchHistoryData.js.
 */

/** Gold, shared by the defenders' bars, their emphasis rings and the chain. */
export const NICENE_GOLD = '#c9a227';

/**
 * The line of defenders the page is built around — teacher to pupil to
 * successor, Alexandria to Rome, from the outbreak of the Arian crisis to
 * Chalcedon. Drawn as a connected chain across the people lane.
 *
 * Many more figures carry doctrinal_role = 'defender' and are gold; this
 * shorter list is the christological spine specifically.
 */
export const NICENE_LINE = [
  'alexander-alexandria',   // condemned Arius at Alexandria, 318
  'athanasius',             // his deacon at Nicaea, then fifty years and five exiles
  'basil-great',            // Cappadocian settlement of the language
  'gregory-nazianzus',      // preached the Five Theological Orations at Constantinople
  'gregory-nyssa',          // Against Eunomius
  'cyril-alexandria',       // against Nestorius at Ephesus, 431
  'flavian-constantinople', // condemned Eutyches, 448; died of the Robber Synod
  'pope-leo-1'              // the Tome, and Chalcedon
];

export const heresiesConfig = {
  siteTitle: 'Heresies & the Christological Controversies',
  initialViewport: { startDate: '0240-01-01', endDate: '0470-12-31' },
  // Timeline centres on year 1000 by default, which is empty canvas for a
  // dataset that ends at Chalcedon. Open on the Arian crisis instead.
  initialCenterYear: 355,
  // Deep people lane (defenders, heresiarchs, contested figures and four
  // centuries of emperors) — push the axis down so the figures get the room.
  initialAxisFraction: 0.66,
  eraLabels: 'BC/AD',
  maxTimeSpan: 600,
  laneOrder: ['people', 'points', 'periods'],

  chains: [
    { id: 'nicene-line', color: NICENE_GOLD, memberIds: NICENE_LINE }
  ],

  legend: [
    // ── Figures ──────────────────────────────────────────────────────────
    {
      type: 'people',
      id: 'defenders',
      name: 'Defenders of orthodoxy',
      color: NICENE_GOLD,
      filterKey: 'defenders'
    },
    {
      type: 'people',
      id: 'heresiarchs',
      name: 'Heresiarchs',
      color: '#b3261e',
      filterKey: 'heresiarchs'
    },
    {
      type: 'people',
      id: 'contested',
      name: 'Contested figures',
      color: '#e08a1e',
      filterKey: 'contested'
    },
    {
      type: 'people',
      id: 'church-figures',
      name: 'Other church figures',
      color: '#5b7ee8',
      filterKey: 'churchFigures'
    },

    // ── Emperors: one toggle, three colours ──────────────────────────────
    // Legend rows without a filterKey render as a plain colour key (no
    // checkbox), so the emperor stances read differently without splintering
    // the emperor filter into three.
    {
      type: 'people',
      id: 'emperors',
      name: 'Emperors',
      color: '#6d4c41',
      filterKey: 'emperors',
      isMonarch: true
    },
    { type: 'people', id: 'emperor-pagan', name: '— pagan / persecuting', color: '#6d4c41' },
    { type: 'people', id: 'emperor-arianizing', name: '— backing the Arian party', color: '#7b1fa2' },
    { type: 'people', id: 'emperor-christian', name: '— Nicene Christian', color: '#1565c0' },

    // ── Points ───────────────────────────────────────────────────────────
    {
      type: 'point',
      id: 'councils',
      name: 'Councils & synods',
      shape: 'cross',
      color: '#4caf50',
      filterKey: 'councils'
    },
    {
      type: 'point',
      id: 'documents',
      name: 'Creeds & documents',
      shape: 'book',
      color: '#f9a825',
      filterKey: 'documents'
    },
    {
      type: 'point',
      id: 'events',
      name: 'Events',
      shape: 'reference',
      color: '#ff6f00',
      filterKey: 'events'
    },

    // ── Movements (brackets below the axis) ──────────────────────────────
    {
      type: 'bracket',
      id: 'heresies',
      name: 'Heresies & schisms',
      color: '#b3261e',
      filterKey: 'heresies'
    },
    {
      type: 'bracket',
      id: 'controversies',
      name: 'Controversies & schools',
      color: '#455a64',
      filterKey: 'controversies'
    }
  ]
};
