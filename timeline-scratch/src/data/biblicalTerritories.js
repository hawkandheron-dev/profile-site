/**
 * Biblical territory polygon data for map overlays.
 * Approximate boundaries based on standard biblical atlas references.
 * Coordinates are [lng, lat] pairs (GeoJSON convention).
 *
 * Key reference coordinates (verified):
 *   Joppa/Jaffa: 34.75, 32.05    Caesarea: 34.89, 32.50
 *   Beth-shemesh: 34.99, 31.75    Ekron: 34.85, 31.78
 *   Gaza: 34.47, 31.50            Ashkelon: 34.57, 31.67
 *   Beersheba: 34.79, 31.25       Arad: 35.13, 31.27
 *   Jerusalem: 35.22, 31.77       En-Gedi: 35.39, 31.46
 *   Acre/Akko: 35.08, 32.93       Tyre: 35.20, 33.27
 *   Sidon: 35.37, 33.56           Mt Carmel tip: 34.95, 32.82
 *   Megiddo: 35.18, 32.58         Beth-shean: 35.50, 32.50
 *   Shechem: 35.28, 32.21         Hazor: 35.57, 33.02
 *   Tel Dan: 35.65, 33.25         Jericho: 35.45, 31.87
 *   Sea of Galilee: W 35.51, E 35.65, N 32.91, S 32.72
 *   Dead Sea: N ~35.54/31.78, S ~35.47/31.05, W ~35.39, E ~35.58
 */

// ── Shared boundary segments ─────────────────────────────────────────────

/** Reverse a shared segment for the adjacent tribe. */
const rev = (seg) => [...seg].reverse();

// ── Coastline segments (corrected to actual Mediterranean shoreline) ────
const COAST_DAN = [
  [34.63, 31.75], [34.68, 31.82], [34.72, 31.88],
  [34.74, 31.93], [34.75, 32.00], [34.75, 32.05],
];
const COAST_EPHRAIM = [
  [34.75, 32.05], [34.78, 32.10], [34.82, 32.15], [34.84, 32.17],
];
const COAST_MANASSEH_W = [
  [34.84, 32.17], [34.86, 32.28], [34.88, 32.40],
  [34.89, 32.50], [34.91, 32.55],
];
const COAST_ASHER = [
  [34.91, 32.55], [34.95, 32.65], [35.00, 32.75], [35.04, 32.85],
  [35.07, 32.93], [35.10, 33.05], [35.12, 33.15], [35.17, 33.25],
  [35.20, 33.27], [35.22, 33.35], [35.28, 33.45], [35.33, 33.55],
];

// ── Jordan River corridor ────────────────────────────────────────────────
const JORDAN_REUBEN_GAD = [[35.55, 31.77], [35.57, 31.90]];
const JORDAN_GAD = [
  [35.57, 31.90], [35.56, 32.00], [35.55, 32.15],
  [35.55, 32.30], [35.54, 32.48],
];
const JORDAN_MANASSEH_E_S = [[35.54, 32.48], [35.55, 32.60], [35.52, 32.72]];

// ── Key inter-tribal boundaries ──────────────────────────────────────────

// Judah northern border — coast to Dead Sea N end (Josh 15:5-11)
const JUDAH_NORTH = [
  [34.63, 31.75],   // Coast (sea)
  [34.74, 31.78],   // Jabneel
  [34.85, 31.78],   // Ekron slope
  [34.99, 31.75],   // Beth-shemesh
  [35.05, 31.80],   // Kiriath-jearim
  [35.16, 31.80],   // Nephtoah
  [35.22, 31.77],   // S of Jerusalem (Hinnom)
  [35.35, 31.82],   // Adummim
  [35.45, 31.82],   // Beth-hoglah
  [35.54, 31.78],   // Dead Sea N end
];

// Benjamin southern edge — from Kiriath-jearim eastward (shared with Judah)
const BENJAMIN_SOUTH = JUDAH_NORTH.slice(4); // starts at [35.05, 31.80]

// Benjamin northern border — Lower Beth-horon to Jordan at Jericho
const BENJAMIN_NORTH = [
  [35.05, 31.92],   // Lower Beth-horon / W Benjamin
  [35.15, 31.95],   // Upper Beth-horon
  [35.24, 31.93],   // Bethel
  [35.35, 31.92],   // Ai area
  [35.45, 31.87],   // Jericho approach
  [35.54, 31.83],   // Jordan at Jericho
];

// Ephraim–Manasseh boundary (Wadi Kanah line)
const EPHRAIM_MANASSEH_BORDER = [
  [34.84, 32.17],   // Coast (Netanya)
  [34.92, 32.20],   // Inland
  [35.02, 32.25],   // Mid
  [35.15, 32.28],   // Shechem approach
  [35.28, 32.22],   // Shechem area
  [35.40, 32.20],   // East
  [35.50, 32.18],   // Jordan approach
  [35.54, 32.18],   // Jordan
];

// Manasseh(W)–Issachar/Zebulun border (Jezreel Valley line)
const JEZREEL_BOUNDARY = [
  [34.91, 32.55],   // Carmel S coast
  [35.00, 32.58],   // Valley W
  [35.10, 32.60],   // Valley mid W
  [35.18, 32.58],   // Megiddo
  [35.30, 32.58],   // Valley mid E
  [35.40, 32.55],   // Valley E
  [35.50, 32.50],   // Beth-shean approach
  [35.54, 32.50],   // Beth-shean / Jordan
];

// Issachar–Zebulun border
const ISSACHAR_ZEBULUN_BORDER = [
  [35.18, 32.58],   // Megiddo area
  [35.20, 32.68],   // Mt Tabor approach
  [35.23, 32.75],   // Mt Tabor
  [35.30, 32.80],   // NE
];

// Zebulun–Naphtali border
const ZEBULUN_NAPHTALI_BORDER = [
  [35.30, 32.80], [35.28, 32.88], [35.25, 32.95],
];

// Zebulun–Asher western edge
const ZEBULUN_ASHER_BORDER = [
  [35.00, 32.58],   // S (Jezreel junction)
  [34.98, 32.65],   // SW
  [34.97, 32.72],   // W
  [34.98, 32.80],   // NW
  [35.00, 32.88],   // N
  [35.05, 32.95],   // NE
];

// Naphtali–Asher border
const NAPHTALI_ASHER_BORDER = [
  [35.15, 33.00], [35.20, 33.10], [35.22, 33.20],
  [35.18, 33.30], [35.15, 33.40],
];

// Gad–Reuben shared border (east side)
const GAD_REUBEN_EAST = [
  [35.57, 31.90], [35.75, 31.85], [35.95, 31.90], [36.10, 32.00],
];

// Gad–Manasseh-E shared border
const GAD_MANASSEH_E_BORDER = [
  [36.20, 32.45], [35.95, 32.48], [35.75, 32.42],
  [35.63, 32.48], [35.54, 32.48],
];

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
        [35.07, 32.93], // Acco
        [34.91, 32.55], // Mount Carmel
        [34.75, 32.05], // Joppa
        [34.57, 31.67], // Ashkelon
        [34.47, 31.50], // Gaza
        [34.0, 29.5],   // Close
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

  // Judah — southern highlands west of Dead Sea (Josh 15)
  {
    id: 'tribe-judah',
    name: 'Judah',
    type: 'tribe',
    color: '#8B4513',
    opacity: 0.20,
    labelPosition: [35.00, 31.40],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.47, 31.50],   // Gaza coast
        [34.42, 31.35],   // SW coast approach
        [34.35, 31.15],   // Gerar road
        [34.55, 31.05],   // Gerar area
        [34.79, 31.05],   // Beersheba W
        [34.95, 31.00],   // Beersheba E
        [35.13, 31.00],   // Arad approach
        [35.39, 31.05],   // Dead Sea S approach
        [35.39, 31.30],   // Dead Sea W shore mid
        [35.39, 31.46],   // En-Gedi
        [35.45, 31.60],   // Dead Sea NW
        [35.54, 31.78],   // Dead Sea N end
        // Northern border (shared with Dan/Benjamin) reversed
        ...rev(JUDAH_NORTH),
        [34.57, 31.67],   // Ashkelon
        [34.47, 31.50],   // Close at Gaza
      ]],
    },
  },

  // Simeon — enclave within Judah's southern portion (Josh 19:1-9)
  // "Their inheritance was within the territory of Judah"
  {
    id: 'tribe-simeon',
    name: 'Simeon',
    type: 'tribe',
    color: '#C4956A',
    opacity: 0.20,
    labelPosition: [34.65, 31.00],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.42, 31.15],   // NW (inside Judah, near Gerar road)
        [34.55, 31.05],   // N (Gerar)
        [34.79, 31.05],   // NE (Beersheba W)
        [34.95, 31.00],   // E (Beersheba E)
        [34.90, 30.85],   // SE
        [34.75, 30.70],   // S (Negev)
        [34.55, 30.65],   // SW
        [34.38, 30.75],   // W
        [34.32, 30.95],   // NW approach
        [34.42, 31.15],   // Close
      ]],
    },
  },

  // Benjamin — small territory between Judah and Ephraim (Josh 18:11-28)
  {
    id: 'tribe-benjamin',
    name: 'Benjamin',
    type: 'tribe',
    color: '#D4A017',
    opacity: 0.20,
    labelPosition: [35.25, 31.87],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // South edge (shared with Judah, from Kiriath-jearim to Dead Sea N)
        ...BENJAMIN_SOUTH,
        // East edge — Dead Sea N to Jordan at Jericho
        [35.54, 31.83],
        // North edge reversed (shared with Ephraim)
        ...rev(BENJAMIN_NORTH),
        // West edge — close back to Kiriath-jearim
        // (first point of BENJAMIN_SOUTH = [35.05, 31.80])
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
    labelPosition: [34.82, 31.88],
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        // Polygon 1: Original coastal territory (Shephelah / coast)
        [[
          // Coast (W edge)
          ...COAST_DAN,
          // North — border with Ephraim
          [34.82, 32.05],   // NE of Joppa
          [34.90, 31.98],   // Ephraim border
          [35.00, 31.95],   // Beth-horon approach
          [35.05, 31.92],   // Lower Beth-horon = Benjamin NW
          // East — Benjamin western edge
          [35.05, 31.80],   // Kiriath-jearim = Benjamin SW
          // South — shared with Judah
          [34.99, 31.75],   // Beth-shemesh
          [34.85, 31.78],   // Ekron
          [34.74, 31.78],   // Jabneel
          [34.63, 31.75],   // Close at coast
        ]],
        // Polygon 2: Northern Dan at Laish (Judges 18 migration)
        // Tel Dan: 35.65E, 33.25N — small ~3km enclave
        [[
          [35.63, 33.23],
          [35.66, 33.24],
          [35.67, 33.26],
          [35.65, 33.27],
          [35.63, 33.26],
          [35.63, 33.23],
        ]],
      ],
    },
  },

  // Ephraim — central highlands (Josh 16)
  {
    id: 'tribe-ephraim',
    name: 'Ephraim',
    type: 'tribe',
    color: '#3A7D44',
    opacity: 0.20,
    labelPosition: [35.15, 32.08],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // West coast
        ...COAST_EPHRAIM,
        // North (shared with Manasseh-W)
        ...EPHRAIM_MANASSEH_BORDER,
        // East — Jordan corridor south
        [35.54, 31.83],
        // South (shared with Benjamin, reversed)
        ...rev(BENJAMIN_NORTH),
        // SW — Dan border back to coast
        [35.05, 31.92],
        [34.90, 31.98],
        [34.82, 32.05],
        [34.75, 32.05],   // Close at Joppa (coast start)
      ]],
    },
  },

  // Manasseh (West) — central highlands north of Ephraim (Josh 17:7-13)
  {
    id: 'tribe-manasseh-west',
    name: 'Manasseh (W)',
    type: 'tribe',
    color: '#7B8F3A',
    opacity: 0.20,
    labelPosition: [35.10, 32.40],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // South (shared with Ephraim)
        ...EPHRAIM_MANASSEH_BORDER,
        // East (Jordan)
        [35.54, 32.35], [35.54, 32.48], [35.54, 32.50],
        // North — Jezreel boundary reversed
        ...rev(JEZREEL_BOUNDARY),
        // West coast reversed
        ...rev(COAST_MANASSEH_W),
        // Close (first point of EPHRAIM_MANASSEH_BORDER)
      ]],
    },
  },

  // Manasseh (East) — Transjordan: Gilead / Bashan (Josh 13:29-31)
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
        [35.54, 32.48],   // Jordan east bank S (shared with Gad)
        [35.63, 32.48],   // E of Jordan
        [35.75, 32.42],   // Gilead W
        [35.95, 32.48],   // Gilead mid
        [36.20, 32.55],   // Gilead E
        [36.40, 32.70],   // Bashan approach
        [36.50, 32.90],   // Bashan E
        [36.45, 33.10],   // Bashan NE
        [36.30, 33.25],   // Northern Bashan
        [36.10, 33.30],   // Golan approach
        [35.80, 33.15],   // Golan heights
        [35.65, 33.05],   // Sea of Galilee NE
        [35.65, 32.88],   // Sea of Galilee E
        [35.65, 32.72],   // Sea of Galilee SE
        [35.55, 32.60],   // Jordan S of lake
        [35.54, 32.48],   // Close
      ]],
    },
  },

  // Issachar — Jezreel Valley and hills (Josh 19:17-23)
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
        // SW — Jezreel boundary from Megiddo east
        ...JEZREEL_BOUNDARY.slice(3), // starts at [35.18, 32.58]
        // East (Jordan / Beth-shean)
        [35.55, 32.60], [35.52, 32.72],
        // North (Sea of Galilee approach)
        [35.50, 32.78], [35.42, 32.82],
        // NW (shared with Zebulun, reversed)
        ...rev(ISSACHAR_ZEBULUN_BORDER),
        // Close (back to [35.18, 32.58])
      ]],
    },
  },

  // Zebulun — lower Galilee (Josh 19:10-16, Genesis 49:13)
  {
    id: 'tribe-zebulun',
    name: 'Zebulun',
    type: 'tribe',
    color: '#5AA0B5',
    opacity: 0.20,
    labelPosition: [35.12, 32.78],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // South: Jezreel line segment
        ...ZEBULUN_ASHER_BORDER.slice(0, 1), // [35.00, 32.58]
        [35.10, 32.60], [35.18, 32.58],
        // SE (shared with Issachar)
        ...ISSACHAR_ZEBULUN_BORDER,
        // NE (shared with Naphtali)
        ...ZEBULUN_NAPHTALI_BORDER,
        // North
        [35.15, 33.00],
        [35.05, 32.95],
        // West (shared with Asher, reversed)
        ...rev(ZEBULUN_ASHER_BORDER),
        // Close
      ]],
    },
  },

  // Naphtali — upper Galilee (Josh 19:32-39)
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
        [35.42, 32.82], [35.50, 32.78], [35.52, 32.72],
        // East (Sea of Galilee W shore + upper Jordan)
        [35.51, 32.78], [35.51, 32.85],
        [35.52, 32.90], [35.54, 32.95], [35.57, 33.02],
        [35.60, 33.12], [35.62, 33.22], [35.65, 33.30],
        [35.62, 33.40], [35.55, 33.45],
        // NW (shared with Asher, reversed)
        [35.45, 33.42], [35.30, 33.35],
        ...rev(NAPHTALI_ASHER_BORDER),
        // West (shared with Zebulun)
        [35.15, 33.00], [35.25, 32.95],
        // Close
      ]],
    },
  },

  // Asher — coastal strip from Carmel north to Sidon (Josh 19:24-31)
  {
    id: 'tribe-asher',
    name: 'Asher',
    type: 'tribe',
    color: '#7B68AE',
    opacity: 0.20,
    labelPosition: [35.08, 33.10],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        // South (Mount Carmel, shared with Manasseh-W coast end)
        [34.91, 32.55],
        // Inland border (shared with Zebulun)
        ...ZEBULUN_ASHER_BORDER,
        [35.05, 32.95],
        // Zebulun–Naphtali junction
        [35.15, 33.00],
        // Naphtali border
        ...NAPHTALI_ASHER_BORDER,
        // Northern extension (toward Sidon)
        [35.15, 33.40], [35.20, 33.48], [35.30, 33.55],
        // Coast south (Mediterranean shoreline)
        ...rev(COAST_ASHER),
        // Close
      ]],
    },
  },

  // Gad — Transjordan between Reuben and Manasseh-East (Josh 13:24-28)
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

  // Reuben — Transjordan south of Gad (Josh 13:15-23)
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
        [34.47, 31.50],   // Gaza
        [34.35, 31.15],   // Gerar road
        [34.55, 31.05],   // Gerar
        [34.63, 31.75],   // Coast S
        [34.75, 32.05],   // Joppa
        [34.84, 32.17],   // Ephraim coast
        [34.91, 32.55],   // Carmel
        [35.07, 32.93],   // Acco
        [35.10, 33.05],   // Coast N
        [35.33, 33.55],   // Sidon approach
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
        [35.39, 31.05],   // Dead Sea S
        [35.13, 31.00],   // Arad
        [34.95, 31.00],   // Beersheba E
        [34.79, 31.05],   // Beersheba
        [34.47, 31.50],   // Close
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
        // Southern boundary — Israel/Judah divide
        [34.75, 32.05],   // Joppa coast
        [34.84, 32.17],   // Ephraim coast
        [34.91, 32.55],   // Carmel
        [35.07, 32.93],   // Acco
        [35.10, 33.05],   // Coast N
        [35.33, 33.55],   // Sidon approach
        [35.55, 33.45],   // Dan
        [36.10, 33.30],   // Bashan N
        [36.50, 32.90],   // Bashan E
        [36.40, 32.70],   // Gilead E
        [36.20, 32.45],   // Gilead mid
        [36.10, 32.00],   // Gad E
        [35.95, 31.90],   // Transjordan
        [35.57, 31.90],   // Jordan
        [35.54, 31.83],   // Jordan at Jericho
        // Benjamin north border reversed (= Israel/Judah divide)
        ...rev(BENJAMIN_NORTH),
        // West through Dan area back to coast
        [34.90, 31.98],
        [34.82, 32.05],
        [34.75, 32.05],   // Close
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
        [34.47, 31.50],   // Gaza
        [34.35, 31.15],   // Gerar road
        [34.55, 31.05],   // Gerar
        [34.63, 31.75],   // Coast
        [34.74, 31.78],   // Jabneel
        [34.85, 31.78],   // Ekron
        [34.99, 31.75],   // Beth-shemesh
        // Dan / Benjamin border to Beth-horon
        [35.05, 31.80],   // Kiriath-jearim
        [35.05, 31.92],   // Lower Beth-horon
        // Benjamin north border (= Israel/Judah divide)
        ...BENJAMIN_NORTH,
        // East to Transjordan
        [35.57, 31.90],
        [35.55, 31.77],   // Dead Sea NE
        [35.55, 31.30],   // Dead Sea mid E
        [35.39, 31.05],   // Dead Sea S
        [35.13, 31.00],   // Arad
        [34.95, 31.00],   // Beersheba E
        [34.79, 31.05],   // Beersheba
        [34.47, 31.50],   // Close
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
        [34.91, 32.7],
        [35.10, 33.5],
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
        [34.91, 32.7],
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
        [34.91, 32.7],
        [35.10, 33.5],
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
        [35.10, 33.5],
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
        [34.47, 31.50],
        [34.57, 31.67],
        [34.63, 31.75],
        [34.85, 31.90],
        [35.05, 31.95],
        [35.4, 31.92],
        [35.5, 31.85],
        [35.5, 31.0],
        [35.35, 30.4],
        [34.85, 30.5],
        [34.47, 31.50],
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
        [34.63, 31.75],
        [34.85, 31.90],
        [34.84, 32.17],
        [34.91, 32.55],
        [35.15, 32.55],
        [35.35, 32.45],
        [35.5, 32.3],
        [35.5, 32.0],
        [35.4, 31.92],
        [35.05, 31.95],
        [34.85, 31.90],
        [34.63, 31.75],
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
        [34.91, 32.55],
        [34.95, 32.70],
        [35.10, 33.1],
        [35.20, 33.4],
        [35.55, 33.4],
        [35.65, 33.1],
        [35.65, 32.7],
        [35.50, 32.55],
        [35.35, 32.45],
        [35.15, 32.55],
        [34.91, 32.55],
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
        [35.65, 33.1],
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
        [35.10, 33.5],
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
