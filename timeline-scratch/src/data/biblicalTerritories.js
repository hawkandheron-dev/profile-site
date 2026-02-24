/**
 * Biblical territory polygon data for map overlays.
 * Approximate boundaries based on standard biblical atlas references.
 * Coordinates are [lng, lat] pairs (GeoJSON convention).
 */

// ── Shared boundary segments ─────────────────────────────────────────────
// Each segment is an array of [lng, lat] points defining one edge between
// two territories.  Tribes sharing this edge use the SAME array (reversed
// where needed) so there are ZERO gaps.
//
// Geographic feature reference coordinates:
// Mediterranean coast runs ~34.55 (south) to 34.85-34.9 (Carmel)
// Jordan River: ~35.55-35.60 lng corridor
// Dead Sea: west shore ~35.47-35.50, east shore ~35.55-35.60
// Sea of Galilee: west ~35.50-35.53, east ~35.63-35.65, N ~32.87, S ~32.72
// Wadi el-Arish (Brook of Egypt): ~34.06, 30.87
// Mount Carmel ridge: ~34.85, 32.55 to ~35.05, 32.55
// Jezreel Valley floor: ~32.58-32.65 lat band

/** Reverse a shared segment for the adjacent tribe. */
const rev = (seg) => [...seg].reverse();

// ── Coastline segments ───────────────────────────────────────────────────
const COAST_DAN = [[34.55, 31.75], [34.55, 31.88], [34.55, 31.95], [34.62, 32.02]];
const COAST_EPHRAIM = [[34.62, 32.02], [34.68, 32.08], [34.72, 32.15]];
const COAST_MANASSEH_W = [[34.72, 32.15], [34.75, 32.28], [34.78, 32.40], [34.82, 32.50], [34.85, 32.55]];
const COAST_ASHER = [
  [34.85, 32.55], [34.86, 32.65], [34.87, 32.75], [34.88, 32.85],
  [34.90, 32.95], [34.90, 33.05], [34.92, 33.15], [34.95, 33.25],
  [34.98, 33.35], [35.02, 33.45], [35.08, 33.52],
];

// ── Jordan River corridor ────────────────────────────────────────────────
const JORDAN_REUBEN_GAD = [[35.55, 31.77], [35.57, 31.90]];
const JORDAN_GAD = [[35.57, 31.90], [35.56, 32.00], [35.55, 32.15], [35.55, 32.30], [35.55, 32.48]];
const JORDAN_MANASSEH_E_S = [[35.55, 32.48], [35.55, 32.60], [35.52, 32.72]];

// ── Key inter-tribal boundaries ──────────────────────────────────────────

// Judah northern border (shared with Benjamin/Dan)
const JUDAH_NORTH = [
  [34.55, 31.75], [34.60, 31.68], [34.65, 31.68], [34.72, 31.70],
  [34.85, 31.78], [34.95, 31.82], [35.05, 31.80], [35.15, 31.78],
  [35.22, 31.72], [35.35, 31.60], [35.42, 31.50], [35.47, 31.48],
];

// Benjamin southern edge — reuses part of JUDAH_NORTH from Beth-shemesh eastward
const BENJAMIN_SOUTH = JUDAH_NORTH.slice(4); // starts at [34.85, 31.78]

// Benjamin northern border (shared with Ephraim)
const BENJAMIN_NORTH = [
  [34.85, 31.78], [34.90, 31.88], [35.00, 31.92], [35.10, 31.95],
  [35.22, 31.96], [35.35, 31.95], [35.45, 31.92], [35.52, 31.87],
];

// Ephraim–Manasseh boundary
const EPHRAIM_MANASSEH_BORDER = [
  [34.72, 32.15], [34.82, 32.20], [34.95, 32.25], [35.10, 32.28],
  [35.22, 32.30], [35.35, 32.30], [35.47, 32.25], [35.52, 32.20],
];

// Manasseh(W)–Issachar/Zebulun border (Jezreel Valley line)
const JEZREEL_BOUNDARY = [
  [34.85, 32.55], [34.95, 32.58], [35.05, 32.60], [35.15, 32.62],
  [35.25, 32.60], [35.35, 32.58], [35.45, 32.55], [35.52, 32.55],
];

// Issachar–Zebulun border
const ISSACHAR_ZEBULUN_BORDER = [
  [35.15, 32.62], [35.18, 32.70], [35.22, 32.75], [35.30, 32.80],
];

// Zebulun–Naphtali border
const ZEBULUN_NAPHTALI_BORDER = [
  [35.30, 32.80], [35.28, 32.88], [35.25, 32.95],
];

// Zebulun–Asher western edge
const ZEBULUN_ASHER_BORDER = [
  [34.95, 32.58], [34.92, 32.65], [34.90, 32.72], [34.92, 32.80],
  [34.95, 32.88], [35.00, 32.95],
];

// Naphtali–Asher border
const NAPHTALI_ASHER_BORDER = [
  [35.12, 33.00], [35.18, 33.10], [35.20, 33.20], [35.15, 33.30], [35.10, 33.40],
];

// Gad–Reuben shared border (east side)
const GAD_REUBEN_EAST = [
  [35.57, 31.90], [35.75, 31.85], [35.95, 31.90], [36.10, 32.00],
];

// Gad–Manasseh-E shared border
const GAD_MANASSEH_E_BORDER = [
  [36.20, 32.45], [35.95, 32.48], [35.75, 32.42], [35.63, 32.48], [35.55, 32.48],
];

// ── Polygon smoothing ────────────────────────────────────────────────────

/**
 * Chaikin corner-cutting algorithm for smoothing a closed polygon ring.
 * Each iteration doubles point count and rounds corners into smooth curves.
 * @param {number[][]} ring - GeoJSON coordinate ring (first pt === last pt)
 * @param {number} iterations - smoothing passes (3 ≈ 8x points)
 */
function smoothRing(ring, iterations = 3) {
  let pts = ring.slice(0, -1); // remove closing duplicate
  for (let i = 0; i < iterations; i++) {
    const next = [];
    for (let j = 0; j < pts.length; j++) {
      const a = pts[j];
      const b = pts[(j + 1) % pts.length];
      next.push(
        [0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]],
        [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]
      );
    }
    pts = next;
  }
  pts.push(pts[0]); // re-close the ring
  return pts;
}

// ── Territory definitions ──────────────────────────────────────────────────

const TERRITORIES = [
  // ── Promised Land (Numbers 34 / Genesis 15) ─────────────────────────────
  {
    id: 'promised-land',
    name: 'Promised Land',
    type: 'promised-land',
    color: '#C4A265',
    opacity: 0.12,
    labelPosition: [35.3, 31.8],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.0, 29.5],   // Brook of Egypt (Wadi el-Arish)
        [34.5, 30.5],   // Negev / Kadesh-Barnea approach
        [35.4, 29.5],   // Southern Dead Sea / Arabah
        [35.55, 30.2],  // Southern Dead Sea west shore
        [35.55, 31.0],  // Dead Sea mid
        [35.6, 31.8],   // Northern Dead Sea / Jordan
        [35.6, 32.5],   // Jordan Valley
        [35.65, 32.8],  // Sea of Galilee south
        [35.55, 33.1],  // Sea of Galilee north
        [35.85, 33.5],  // Upper Jordan / Dan
        [36.0, 33.8],   // Lebo-Hamath approach
        [36.3, 34.2],   // Toward Hamath
        [35.9, 34.5],   // Northern boundary near Hamath
        [35.5, 34.3],   // Lebanon coast
        [35.2, 33.8],   // Sidon area
        [35.0, 33.3],   // Tyre area
        [34.9, 32.9],   // Acco / Akko
        [34.85, 32.5],  // Mount Carmel
        [34.8, 32.0],   // Joppa
        [34.55, 31.5],  // Philistine coast
        [34.25, 31.2],  // Gaza area
        [34.0, 29.5],   // Close polygon
      ]],
    },
  },

  // ── Egypt regional extent ───────────────────────────────────────────────
  {
    id: 'empire-egypt',
    name: 'Egypt',
    type: 'empire',
    color: '#D4A04A',
    opacity: 0.10,
    labelPosition: [31.0, 30.5],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [29.5, 31.5],
        [30.0, 31.8],
        [31.5, 31.8],
        [32.3, 31.3],
        [33.5, 31.0],
        [34.5, 29.5],
        [34.0, 28.5],
        [33.0, 28.0],
        [32.5, 28.5],
        [32.0, 29.5],
        [31.0, 30.0],
        [30.5, 30.5],
        [29.5, 31.5],
      ]],
    },
  },

  // ── Twelve Tribes of Israel ─────────────────────────────────────────────

  // Judah — southern highlands west of Dead Sea
  {
    id: 'tribe-judah',
    name: 'Judah',
    type: 'tribe',
    color: '#8B4513',
    opacity: 0.20,
    labelPosition: [34.95, 31.45],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.27, 31.22],   // Near Gaza coast
        [34.38, 31.15],   // SW approach
        [34.55, 31.10],   // Gerar area
        [34.79, 31.05],   // Beersheba
        [34.95, 31.00],   // Beersheba east
        [35.22, 30.95],   // Arad
        [35.47, 31.05],   // Dead Sea south approach
        [35.48, 31.30],   // Dead Sea west shore mid
        [35.47, 31.48],   // En-Gedi (Dead Sea shore)
        ...rev(JUDAH_NORTH),
        [34.27, 31.22],   // Close
      ]],
    },
  },

  // Simeon — within Judah's southern portion (Negev, Joshua 19:1)
  {
    id: 'tribe-simeon',
    name: 'Simeon',
    type: 'tribe',
    color: '#C4956A',
    opacity: 0.20,
    labelPosition: [34.75, 30.75],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.38, 31.15],   // Western edge (Gerar road)
        [34.55, 31.10],   // Gerar
        [34.79, 31.05],   // Beersheba west
        [34.95, 31.00],   // Beersheba east
        [35.22, 30.95],   // Arad approach
        [35.30, 30.80],   // South of Arad
        [35.20, 30.55],   // Southern Negev
        [35.00, 30.40],   // Zin wilderness
        [34.75, 30.35],   // Kadesh-Barnea approach
        [34.50, 30.45],   // Western Negev
        [34.30, 30.60],   // SW Negev
        [34.20, 30.80],   // Brook of Egypt approach
        [34.25, 31.00],   // Coast approach
        [34.38, 31.15],   // Close
      ]],
    },
  },

  // Benjamin — small territory between Judah and Ephraim
  {
    id: 'tribe-benjamin',
    name: 'Benjamin',
    type: 'tribe',
    color: '#D4A017',
    opacity: 0.20,
    labelPosition: [35.15, 31.88],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // South edge (shared with Judah)
        ...BENJAMIN_SOUTH,
        // East edge (Jordan / Dead Sea NE)
        [35.47, 31.48], [35.50, 31.65], [35.52, 31.80], [35.52, 31.87],
        // North edge reversed (shared with Ephraim)
        ...rev(BENJAMIN_NORTH),
        // Close (first point of BENJAMIN_SOUTH)
      ]],
    },
  },

  // Dan — original coastal territory + northern enclave at Laish (Judges 18)
  {
    id: 'tribe-dan',
    name: 'Dan',
    type: 'tribe',
    color: '#2E8B57',
    opacity: 0.20,
    labelPosition: [34.70, 31.88],
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        // Polygon 1: Original coastal territory
        [[
          [34.55, 31.75],   // Coast south
          [34.55, 31.88],   // Coast mid
          [34.55, 31.95],   // Coast north
          [34.62, 32.02],   // Joppa area
          [34.72, 32.06],   // Northern coast edge
          [34.85, 31.98],   // Ephraim border
          [35.00, 31.92],   // Upper Beth-horon
          [34.90, 31.88],   // Benjamin NW
          [34.85, 31.78],   // Beth-shemesh (shared Judah corner)
          [34.72, 31.70],   // Azekah
          [34.65, 31.68],   // Shephelah
          [34.60, 31.68],   // W approach
          [34.55, 31.75],   // Close
        ]],
        // Polygon 2: Northern Dan at Laish (Judges 18 migration)
        [[
          [35.58, 33.18],   // South approach
          [35.62, 33.22],   // East
          [35.65, 33.28],   // Dan/Laish
          [35.63, 33.33],   // North
          [35.58, 33.32],   // NW
          [35.55, 33.28],   // West
          [35.55, 33.22],   // SW
          [35.58, 33.18],   // Close
        ]],
      ],
    },
  },

  // Ephraim — central highlands
  {
    id: 'tribe-ephraim',
    name: 'Ephraim',
    type: 'tribe',
    color: '#3A7D44',
    opacity: 0.20,
    labelPosition: [35.12, 32.10],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // West coast
        ...COAST_EPHRAIM,
        // North (shared with Manasseh-W)
        ...EPHRAIM_MANASSEH_BORDER,
        // East (Jordan corridor)
        [35.52, 31.87],
        // South (shared with Benjamin, reversed)
        ...rev(BENJAMIN_NORTH),
        // Dan border segment back to coast
        [34.85, 31.78], [34.85, 31.98],
        [34.72, 32.06],
        [34.62, 32.02],   // Close via coast start
      ]],
    },
  },

  // Manasseh (West) — central highlands north of Ephraim through Jezreel
  {
    id: 'tribe-manasseh-west',
    name: 'Manasseh (W)',
    type: 'tribe',
    color: '#7B8F3A',
    opacity: 0.20,
    labelPosition: [35.10, 32.42],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // South (shared with Ephraim)
        ...EPHRAIM_MANASSEH_BORDER,
        // East (Jordan)
        [35.52, 32.35], [35.52, 32.48], [35.52, 32.55],
        // North — Jezreel boundary reversed
        ...rev(JEZREEL_BOUNDARY),
        // West coast reversed
        ...rev(COAST_MANASSEH_W),
        // Close (first point of EPHRAIM_MANASSEH_BORDER)
      ]],
    },
  },

  // Manasseh (East) — Transjordan (Gilead / Bashan)
  {
    id: 'tribe-manasseh-east',
    name: 'Manasseh (E)',
    type: 'tribe',
    color: '#5B7744',
    opacity: 0.20,
    labelPosition: [36.00, 32.85],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [35.55, 32.48],   // Jordan east bank south (shared with Gad)
        [35.63, 32.48],   // East of Jordan
        [35.75, 32.42],   // Gilead west
        [35.95, 32.48],   // Gilead mid
        [36.20, 32.55],   // Gilead east
        [36.40, 32.70],   // Bashan approach
        [36.50, 32.90],   // Bashan east
        [36.45, 33.10],   // Bashan NE
        [36.30, 33.25],   // Northern Bashan
        [36.10, 33.30],   // Golan approach
        [35.80, 33.15],   // Golan heights
        [35.65, 33.05],   // Sea of Galilee NE shore
        [35.63, 32.88],   // Sea of Galilee E shore
        [35.65, 32.72],   // Sea of Galilee SE
        [35.55, 32.60],   // Jordan south of lake
        [35.55, 32.48],   // Close
      ]],
    },
  },

  // Issachar — Jezreel Valley and hills
  {
    id: 'tribe-issachar',
    name: 'Issachar',
    type: 'tribe',
    color: '#4682B4',
    opacity: 0.20,
    labelPosition: [35.38, 32.68],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // SW — Jezreel boundary from midpoint east
        ...JEZREEL_BOUNDARY.slice(3), // starts at [35.15, 32.62]
        // East (Jordan / Beth-shan)
        [35.55, 32.60], [35.55, 32.72],
        // North (Sea of Galilee approach)
        [35.50, 32.78], [35.42, 32.82],
        // NW (shared with Zebulun, reversed)
        ...rev(ISSACHAR_ZEBULUN_BORDER),
        // Close (back to [35.15, 32.62])
      ]],
    },
  },

  // Zebulun — lower Galilee with sea access corridor (Genesis 49:13)
  {
    id: 'tribe-zebulun',
    name: 'Zebulun',
    type: 'tribe',
    color: '#5AA0B5',
    opacity: 0.20,
    labelPosition: [35.10, 32.82],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // South: Jezreel line segment
        ...ZEBULUN_ASHER_BORDER.slice(0, 1), // [34.95, 32.58]
        [35.05, 32.60], [35.15, 32.62],
        // SE (shared with Issachar)
        ...ISSACHAR_ZEBULUN_BORDER,
        // NE (shared with Naphtali)
        ...ZEBULUN_NAPHTALI_BORDER,
        // North
        [35.12, 33.00],
        [35.00, 32.95],
        // West / Coast approach (sea access corridor — Genesis 49:13)
        ...rev(ZEBULUN_ASHER_BORDER),
        // Close
      ]],
    },
  },

  // Naphtali — upper Galilee
  {
    id: 'tribe-naphtali',
    name: 'Naphtali',
    type: 'tribe',
    color: '#5C7FBF',
    opacity: 0.20,
    labelPosition: [35.40, 33.10],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // SW (shared with Zebulun, reversed)
        [35.25, 32.95],
        [35.28, 32.88], [35.30, 32.80],
        // South (shared with Issachar)
        [35.42, 32.82], [35.50, 32.78], [35.55, 32.72],
        // East (Sea of Galilee + upper Jordan)
        [35.53, 32.78], [35.52, 32.85],
        [35.53, 32.90], [35.55, 32.95], [35.57, 33.02],
        [35.60, 33.12], [35.62, 33.22], [35.65, 33.30],
        [35.62, 33.40], [35.55, 33.45],
        // NW (shared with Asher, reversed)
        [35.45, 33.42], [35.30, 33.35],
        ...rev(NAPHTALI_ASHER_BORDER),
        // West (shared with Zebulun)
        [35.12, 33.00], [35.25, 32.95],
        // Close
      ]],
    },
  },

  // Asher — coastal strip from Carmel north to Sidon
  {
    id: 'tribe-asher',
    name: 'Asher',
    type: 'tribe',
    color: '#7B68AE',
    opacity: 0.20,
    labelPosition: [34.95, 33.10],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // South (Mount Carmel, shared with Manasseh-W coast end)
        [34.85, 32.55],
        // Inland border (shared with Zebulun)
        ...ZEBULUN_ASHER_BORDER,
        [35.00, 32.95],
        // Zebulun–Naphtali junction
        [35.12, 33.00],
        // Naphtali border
        ...NAPHTALI_ASHER_BORDER,
        // Northern extension (toward Sidon)
        [35.10, 33.40], [35.12, 33.48], [35.18, 33.55],
        // Coast south (Mediterranean shoreline)
        ...rev(COAST_ASHER),
        // Close
      ]],
    },
  },

  // Gad — Transjordan between Reuben and Manasseh-East
  {
    id: 'tribe-gad',
    name: 'Gad',
    type: 'tribe',
    color: '#C46A3A',
    opacity: 0.20,
    labelPosition: [35.85, 32.15],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // South (shared with Reuben)
        ...GAD_REUBEN_EAST,
        // Eastern hills
        [36.15, 32.15], [36.20, 32.30], [36.20, 32.45],
        // North (shared with Manasseh-E, reversed)
        ...rev(GAD_MANASSEH_E_BORDER),
        // Jordan corridor south
        ...rev(JORDAN_GAD),
        // Close (first point of GAD_REUBEN_EAST)
      ]],
    },
  },

  // Reuben — Transjordan south of Gad
  {
    id: 'tribe-reuben',
    name: 'Reuben',
    type: 'tribe',
    color: '#A05040',
    opacity: 0.20,
    labelPosition: [35.82, 31.60],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [35.55, 31.47],   // Arnon River mouth (Dead Sea east shore)
        // North (shared with Gad)
        ...JORDAN_REUBEN_GAD,
        ...GAD_REUBEN_EAST,
        // Eastern hills
        [36.15, 31.85], [36.15, 31.70],
        // Arnon River course
        [36.10, 31.55], [36.00, 31.45], [35.85, 31.40],
        [35.72, 31.35], [35.60, 31.40],
        [35.55, 31.47],   // Close
      ]],
    },
  },

  // ── Kingdoms ────────────────────────────────────────────────────────────

  // United Kingdom of Israel (David/Solomon era)
  {
    id: 'kingdom-united',
    name: 'United Kingdom of Israel',
    type: 'kingdom',
    color: '#7B2D8E',
    opacity: 0.12,
    labelPosition: [35.3, 32.0],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.27, 31.22],   // Gaza
        [34.38, 31.15],   // Gerar road
        [34.55, 31.10],   // Gerar
        [34.55, 31.75],   // Coast south
        [34.55, 31.95],   // Joppa
        [34.62, 32.02],   // Coast N
        [34.72, 32.15],   // Ephraim coast
        [34.85, 32.55],   // Carmel
        [34.86, 32.65],   // Acco approach
        [34.90, 33.05],   // Coast N
        [35.08, 33.52],   // Tyre approach
        [35.18, 33.55],   // Northern extent (Sidon)
        [35.55, 33.45],   // Upper Galilee N
        [35.65, 33.30],   // Dan
        [36.10, 33.30],   // Bashan N
        [36.50, 32.90],   // Bashan E
        [36.40, 32.70],   // Gilead E
        [36.20, 32.45],   // Gilead mid
        [36.10, 32.00],   // Gad E
        [35.95, 31.90],   // Reuben NE
        [36.15, 31.70],   // Reuben E
        [36.10, 31.55],   // Arnon E
        [35.55, 31.47],   // Dead Sea E
        [35.47, 31.05],   // Dead Sea S
        [35.22, 30.95],   // Arad
        [34.95, 31.00],   // Beersheba E
        [34.79, 31.05],   // Beersheba
        [34.27, 31.22],   // Close
      ]],
    },
  },

  // Kingdom of Israel (Northern Kingdom after split)
  {
    id: 'kingdom-israel',
    name: 'Israel',
    type: 'kingdom',
    color: '#2E7D32',
    opacity: 0.15,
    labelPosition: [35.2, 32.5],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // Southern boundary follows Benjamin north / Dan tribal line
        [34.55, 31.95],   // Coast (Dan tribal area)
        [34.62, 32.02],   // Joppa
        [34.72, 32.15],   // Ephraim coast
        [34.85, 32.55],   // Carmel
        [34.86, 32.65],   // Acco
        [34.90, 33.05],   // Coast N
        [35.08, 33.52],   // Tyre approach
        [35.18, 33.55],   // Northern extent
        [35.55, 33.45],   // Dan
        [36.10, 33.30],   // Bashan N
        [36.50, 32.90],   // Bashan E
        [36.40, 32.70],   // Gilead E
        [36.20, 32.45],   // Gilead mid
        [36.10, 32.00],   // Gad E
        [35.95, 31.90],   // Transjordan
        [35.57, 31.90],   // Jordan east of Dead Sea N
        [35.52, 31.87],   // Jordan
        // Benjamin north border (= Israel/Judah divide)
        ...rev(BENJAMIN_NORTH),
        // Trace west through Dan area back to coast
        [34.75, 31.82],
        [34.65, 31.87],
        [34.55, 31.95],   // Close
      ]],
    },
  },

  // Kingdom of Judah (Southern Kingdom after split)
  {
    id: 'kingdom-judah',
    name: 'Judah',
    type: 'kingdom',
    color: '#C62828',
    opacity: 0.15,
    labelPosition: [35.0, 31.4],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.27, 31.22],   // Gaza
        [34.38, 31.15],   // Gerar road
        [34.55, 31.10],   // Gerar
        [34.55, 31.75],   // Coast
        [34.65, 31.78],   // Dan area NE approach
        // Benjamin north border (= Israel/Judah divide)
        ...BENJAMIN_NORTH,
        // East to Transjordan
        [35.57, 31.90],
        [35.55, 31.77],   // Dead Sea NE
        [35.55, 31.30],   // Dead Sea mid east
        [35.47, 31.05],   // Dead Sea S
        [35.22, 30.95],   // Arad
        [34.95, 31.00],   // Beersheba E
        [34.79, 31.05],   // Beersheba
        [34.27, 31.22],   // Close
      ]],
    },
  },

  // ── Ancient Empires (Near East regional extent) ─────────────────────────

  // Assyrian Empire (Levant / Mesopotamia extent)
  {
    id: 'empire-assyria',
    name: 'Assyrian Empire',
    type: 'empire',
    color: '#B71C1C',
    opacity: 0.08,
    labelPosition: [39.0, 34.0],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.85, 32.7],
        [34.9, 33.5],
        [35.5, 34.5],
        [36.5, 36.0],
        [38.0, 37.0],
        [42.0, 37.0],
        [44.5, 35.0],
        [45.0, 33.5],
        [44.0, 32.0],
        [42.0, 31.0],
        [39.0, 30.0],
        [36.0, 30.0],
        [35.5, 30.5],
        [35.5, 31.5],
        [35.5, 32.5],
        [34.85, 32.7],
      ]],
    },
  },

  // Babylonian Empire (Neo-Babylonian / Chaldean)
  {
    id: 'empire-babylon',
    name: 'Babylonian Empire',
    type: 'empire',
    color: '#4A148C',
    opacity: 0.08,
    labelPosition: [40.0, 33.5],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [33.5, 31.5],
        [34.5, 31.5],
        [34.85, 32.7],
        [34.9, 33.5],
        [35.5, 34.5],
        [36.5, 36.0],
        [38.0, 37.0],
        [42.0, 37.0],
        [44.5, 35.0],
        [45.0, 33.0],
        [44.5, 31.0],
        [42.0, 30.0],
        [39.0, 29.0],
        [36.0, 29.5],
        [35.0, 30.0],
        [33.5, 31.5],
      ]],
    },
  },

  // Persian Empire (Achaemenid — Near East extent)
  {
    id: 'empire-persia',
    name: 'Persian Empire',
    type: 'empire',
    color: '#E65100',
    opacity: 0.08,
    labelPosition: [42.0, 34.0],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [29.5, 31.5],
        [31.5, 31.8],
        [33.5, 31.5],
        [34.5, 31.5],
        [34.9, 33.5],
        [35.5, 34.5],
        [36.5, 36.0],
        [38.0, 37.5],
        [42.0, 37.5],
        [45.0, 36.0],
        [48.0, 34.0],
        [50.0, 32.0],
        [50.0, 28.0],
        [48.0, 29.0],
        [44.5, 30.0],
        [40.0, 29.0],
        [36.0, 28.0],
        [34.0, 28.0],
        [32.5, 29.5],
        [30.5, 30.5],
        [29.5, 31.5],
      ]],
    },
  },

  // Roman provinces (Gospel era)
  {
    id: 'province-judea',
    name: 'Judea',
    type: 'province',
    color: '#C62828',
    opacity: 0.15,
    labelPosition: [35.05, 31.5],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.25, 31.2],
        [34.55, 31.55],
        [34.65, 31.75],
        [34.8, 31.9],
        [35.05, 31.95],
        [35.4, 31.92],
        [35.5, 31.85],
        [35.5, 31.0],
        [35.35, 30.4],
        [34.85, 30.5],
        [34.25, 31.2],
      ]],
    },
  },

  {
    id: 'province-samaria',
    name: 'Samaria',
    type: 'province',
    color: '#EF6C00',
    opacity: 0.15,
    labelPosition: [35.15, 32.2],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.65, 31.75],
        [34.8, 31.9],
        [34.75, 32.15],
        [34.85, 32.55],
        [35.15, 32.55],
        [35.35, 32.45],
        [35.5, 32.3],
        [35.5, 32.0],
        [35.4, 31.92],
        [35.05, 31.95],
        [34.8, 31.9],
        [34.65, 31.75],
      ]],
    },
  },

  {
    id: 'province-galilee',
    name: 'Galilee',
    type: 'province',
    color: '#1565C0',
    opacity: 0.15,
    labelPosition: [35.3, 32.85],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.85, 32.55],
        [34.85, 32.7],
        [34.9, 33.1],
        [35.1, 33.4],
        [35.55, 33.4],
        [35.7, 33.1],
        [35.65, 32.7],
        [35.5, 32.55],
        [35.35, 32.45],
        [35.15, 32.55],
        [34.85, 32.55],
      ]],
    },
  },

  {
    id: 'province-perea',
    name: 'Perea',
    type: 'province',
    color: '#00695C',
    opacity: 0.15,
    labelPosition: [35.85, 32.0],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [35.55, 31.6],
        [35.7, 31.5],
        [36.0, 31.8],
        [36.1, 32.3],
        [35.8, 32.4],
        [35.6, 32.5],
        [35.5, 32.3],
        [35.5, 32.0],
        [35.55, 31.6],
      ]],
    },
  },

  {
    id: 'province-decapolis',
    name: 'Decapolis',
    type: 'province',
    color: '#37474F',
    opacity: 0.12,
    labelPosition: [36.1, 32.7],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [35.65, 32.7],
        [35.7, 33.1],
        [36.1, 33.3],
        [36.5, 33.0],
        [36.5, 32.5],
        [36.1, 32.3],
        [35.8, 32.4],
        [35.6, 32.5],
        [35.65, 32.7],
      ]],
    },
  },

  // Roman Empire (broader, for Early Church)
  {
    id: 'empire-rome',
    name: 'Roman Empire',
    type: 'empire',
    color: '#880E4F',
    opacity: 0.06,
    labelPosition: [35.0, 35.0],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [29.0, 31.5],
        [30.0, 31.8],
        [31.5, 31.8],
        [33.5, 31.5],
        [34.5, 31.5],
        [34.9, 33.5],
        [35.5, 34.5],
        [36.0, 35.5],
        [36.5, 36.5],
        [35.0, 37.0],
        [33.0, 37.0],
        [30.0, 37.5],
        [27.5, 38.5],
        [26.0, 39.0],
        [29.0, 41.0],
        [23.5, 38.0],
        [20.0, 39.0],
        [18.5, 40.5],
        [15.0, 41.0],
        [12.5, 42.0],
        [10.0, 44.0],
        [5.0, 43.5],
        [3.0, 42.0],
        [-1.0, 38.0],
        [-6.0, 37.0],
        [-6.0, 35.0],
        [0.0, 36.0],
        [5.0, 37.0],
        [10.0, 35.0],
        [15.0, 33.0],
        [20.0, 32.0],
        [25.0, 31.5],
        [29.0, 31.5],
      ]],
    },
  },
];

// ── Apply Chaikin smoothing to tribal territory polygons ─────────────────
// Produces ~8x more points per polygon for smooth, natural-looking curves.
TERRITORIES.forEach(t => {
  if (t.type !== 'tribe') return;
  if (t.geometry.type === 'Polygon') {
    t.geometry.coordinates[0] = smoothRing(t.geometry.coordinates[0]);
  } else if (t.geometry.type === 'MultiPolygon') {
    t.geometry.coordinates = t.geometry.coordinates.map(poly =>
      [smoothRing(poly[0])]
    );
  }
});

// ── Narrative Age → Territory Mapping ─────────────────────────────────────

const AGE_TERRITORY_MAP = {
  'age-creation': [],
  'age-patriarchs': ['promised-land'],
  'age-exodus': ['promised-land', 'empire-egypt'],
  'age-conquest': [
    'tribe-judah', 'tribe-simeon', 'tribe-benjamin', 'tribe-dan',
    'tribe-ephraim', 'tribe-manasseh-west', 'tribe-manasseh-east',
    'tribe-issachar', 'tribe-zebulun', 'tribe-naphtali', 'tribe-asher',
    'tribe-gad', 'tribe-reuben',
  ],
  'age-united-monarchy': ['kingdom-united'],
  'age-divided-monarchy': ['kingdom-israel', 'kingdom-judah'],
  'age-judah-exile': ['empire-babylon'],
  'age-return': ['empire-persia'],
  'age-second-temple': [],
  'age-gospels': [
    'province-judea', 'province-samaria', 'province-galilee',
    'province-perea', 'province-decapolis',
  ],
  'age-early-church': ['empire-rome'],
};

// ── Lookup map ────────────────────────────────────────────────────────────

const territoryById = new Map();
TERRITORIES.forEach(t => territoryById.set(t.id, t));

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Returns a GeoJSON FeatureCollection of territories for the given narrative age.
 * Returns null if no territories are defined for this age.
 */
export function getTerritoriesForAge(ageId) {
  const ids = AGE_TERRITORY_MAP[ageId];
  if (!ids || ids.length === 0) return null;

  const features = ids
    .map(id => territoryById.get(id))
    .filter(Boolean)
    .map(t => ({
      type: 'Feature',
      geometry: t.geometry,
      properties: {
        id: t.id,
        name: t.name,
        type: t.type,
        color: t.color,
        opacity: t.opacity,
        labelLng: t.labelPosition[0],
        labelLat: t.labelPosition[1],
      },
    }));

  return { type: 'FeatureCollection', features };
}

/**
 * Returns a GeoJSON FeatureCollection of label points for territory names.
 * Used for a separate symbol layer to position labels at territory centers.
 */
export function getTerritoryLabelsForAge(ageId) {
  const ids = AGE_TERRITORY_MAP[ageId];
  if (!ids || ids.length === 0) return null;

  const features = ids
    .map(id => territoryById.get(id))
    .filter(Boolean)
    .map(t => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: t.labelPosition,
      },
      properties: {
        name: t.name,
        type: t.type,
        color: t.color,
      },
    }));

  return { type: 'FeatureCollection', features };
}
