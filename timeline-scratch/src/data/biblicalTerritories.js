/**
 * Biblical territory polygon data for map overlays.
 * Approximate boundaries based on standard biblical atlas references.
 * Coordinates are [lng, lat] pairs (GeoJSON convention).
 */

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
        [29.5, 31.5],   // Alexandria area
        [30.0, 31.8],   // Nile Delta north
        [31.5, 31.8],   // Delta east
        [32.3, 31.3],   // Near Pelusium
        [33.5, 31.0],   // Sinai north coast
        [34.5, 29.5],   // Negev / border
        [34.0, 28.5],   // Sinai south
        [33.0, 28.0],   // Sinai mid
        [32.5, 28.5],   // Gulf of Suez approach
        [32.0, 29.5],   // Suez area
        [31.0, 30.0],   // Cairo / Memphis
        [30.5, 30.5],   // Lower Nile
        [29.5, 31.5],   // Close polygon
      ]],
    },
  },

  // ── Twelve Tribes of Israel ─────────────────────────────────────────────

  // Judah — southern highlands
  {
    id: 'tribe-judah',
    name: 'Judah',
    type: 'tribe',
    color: '#8B4513',
    opacity: 0.18,
    labelPosition: [35.0, 31.4],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.25, 31.2],  // Gaza coast
        [34.45, 31.55], // Philistine border
        [34.65, 31.68], // Shephelah
        [34.85, 31.78], // Beth-shemesh area
        [35.15, 31.78], // Jerusalem south
        [35.22, 31.72], // Bethlehem
        [35.4, 31.55],  // Wilderness of Judah
        [35.5, 31.3],   // En-Gedi
        [35.5, 30.9],   // Dead Sea south
        [35.35, 30.4],  // Arad
        [34.85, 30.5],  // Beersheba
        [34.5, 30.8],   // Gerar area
        [34.25, 31.2],  // Close
      ]],
    },
  },

  // Simeon — within Judah's southern portion (Negev)
  {
    id: 'tribe-simeon',
    name: 'Simeon',
    type: 'tribe',
    color: '#CD853F',
    opacity: 0.18,
    labelPosition: [34.7, 30.8],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.25, 31.2],  // SW corner
        [34.5, 30.8],   // Gerar
        [34.85, 30.5],  // Beersheba
        [35.35, 30.4],  // Arad area
        [35.4, 29.8],   // Southern Negev
        [34.5, 29.5],   // Kadesh-Barnea approach
        [34.0, 30.0],   // Brook of Egypt
        [34.25, 31.2],  // Close
      ]],
    },
  },

  // Benjamin — small territory between Judah and Ephraim
  {
    id: 'tribe-benjamin',
    name: 'Benjamin',
    type: 'tribe',
    color: '#B8860B',
    opacity: 0.18,
    labelPosition: [35.22, 31.85],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.85, 31.78], // Western edge
        [35.0, 31.92],  // Upper Beth-horon
        [35.1, 31.95],  // Gibeon
        [35.25, 31.95], // Ramah
        [35.4, 31.92],  // East of Jericho approach
        [35.5, 31.85],  // Jordan near Jericho
        [35.4, 31.55],  // Wilderness edge
        [35.22, 31.72], // Bethlehem border
        [35.15, 31.78], // Jerusalem south
        [34.85, 31.78], // Close
      ]],
    },
  },

  // Dan (original territory) — coastal area west of Benjamin
  {
    id: 'tribe-dan',
    name: 'Dan',
    type: 'tribe',
    color: '#2E8B57',
    opacity: 0.18,
    labelPosition: [34.75, 31.92],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.55, 31.75], // Coast south
        [34.65, 31.68], // Shephelah
        [34.85, 31.78], // Beth-shemesh
        [35.0, 31.92],  // Upper Beth-horon
        [34.95, 32.0],  // Ephraim border
        [34.75, 32.05], // Joppa area
        [34.55, 31.95], // Coast
        [34.55, 31.75], // Close
      ]],
    },
  },

  // Ephraim — central highlands
  {
    id: 'tribe-ephraim',
    name: 'Ephraim',
    type: 'tribe',
    color: '#228B22',
    opacity: 0.18,
    labelPosition: [35.15, 32.1],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.75, 32.05], // Coast
        [34.95, 32.0],  // Dan border
        [35.1, 31.95],  // Gibeon area
        [35.25, 31.95], // Benjamin border
        [35.4, 31.92],  // Jordan approach
        [35.5, 32.0],   // Jordan
        [35.5, 32.2],   // Jordan mid
        [35.35, 32.3],  // Shechem east approach
        [35.2, 32.3],   // Shechem
        [34.95, 32.25], // Western hills
        [34.75, 32.15], // Coast
        [34.75, 32.05], // Close
      ]],
    },
  },

  // Manasseh (West) — central highlands north of Ephraim
  {
    id: 'tribe-manasseh-west',
    name: 'Manasseh (W)',
    type: 'tribe',
    color: '#6B8E23',
    opacity: 0.18,
    labelPosition: [35.1, 32.5],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.75, 32.15], // Coast
        [34.95, 32.25], // Western hills
        [35.2, 32.3],   // Shechem
        [35.35, 32.3],  // East Shechem
        [35.5, 32.2],   // Jordan
        [35.5, 32.55],  // Beth-shan
        [35.35, 32.6],  // Jezreel east
        [35.15, 32.65], // Jezreel valley
        [34.95, 32.65], // Megiddo
        [34.85, 32.55], // Carmel south
        [34.75, 32.4],  // Coast
        [34.75, 32.15], // Close
      ]],
    },
  },

  // Manasseh (East) — Transjordan (Gilead / Bashan)
  {
    id: 'tribe-manasseh-east',
    name: 'Manasseh (E)',
    type: 'tribe',
    color: '#556B2F',
    opacity: 0.18,
    labelPosition: [36.0, 32.8],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [35.6, 32.5],   // Jordan east
        [35.8, 32.4],   // Gilead west
        [36.1, 32.5],   // Gilead east
        [36.4, 32.8],   // Bashan east
        [36.5, 33.2],   // Northern Bashan
        [36.1, 33.3],   // Golan
        [35.7, 33.1],   // Sea of Galilee NE
        [35.65, 32.7],  // Sea of Galilee S to Jordan
        [35.6, 32.5],   // Close
      ]],
    },
  },

  // Issachar — Jezreel Valley and hills
  {
    id: 'tribe-issachar',
    name: 'Issachar',
    type: 'tribe',
    color: '#4682B4',
    opacity: 0.18,
    labelPosition: [35.35, 32.65],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [35.15, 32.65], // Jezreel valley west
        [35.35, 32.6],  // Jezreel east
        [35.5, 32.55],  // Beth-shan
        [35.6, 32.5],   // Jordan
        [35.65, 32.7],  // Jordan north
        [35.5, 32.75],  // South of Galilee
        [35.3, 32.8],   // Tabor area
        [35.15, 32.75], // Nazareth area
        [35.15, 32.65], // Close
      ]],
    },
  },

  // Zebulun — lower Galilee
  {
    id: 'tribe-zebulun',
    name: 'Zebulun',
    type: 'tribe',
    color: '#5F9EA0',
    opacity: 0.18,
    labelPosition: [35.2, 32.82],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.95, 32.65], // Megiddo
        [35.15, 32.65], // Jezreel W
        [35.15, 32.75], // Nazareth area
        [35.3, 32.8],   // Tabor
        [35.25, 32.95], // Upper Galilee border
        [35.05, 32.95], // West
        [34.95, 32.85], // Acco approach
        [34.95, 32.65], // Close
      ]],
    },
  },

  // Naphtali — upper Galilee
  {
    id: 'tribe-naphtali',
    name: 'Naphtali',
    type: 'tribe',
    color: '#6495ED',
    opacity: 0.18,
    labelPosition: [35.45, 33.0],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [35.25, 32.95],  // Zebulun border
        [35.3, 32.8],    // Tabor
        [35.5, 32.75],   // SW Galilee
        [35.55, 32.85],  // Sea of Galilee W
        [35.55, 33.1],   // Sea of Galilee N
        [35.6, 33.3],    // Hazor area
        [35.6, 33.45],   // Dan / Laish
        [35.45, 33.4],   // Upper Galilee N
        [35.2, 33.2],    // Upper Galilee W
        [35.25, 32.95],  // Close
      ]],
    },
  },

  // Asher — coastal strip from Carmel north
  {
    id: 'tribe-asher',
    name: 'Asher',
    type: 'tribe',
    color: '#7B68EE',
    opacity: 0.18,
    labelPosition: [35.0, 33.1],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [34.85, 32.55], // Carmel area
        [34.95, 32.65], // Megiddo W
        [34.95, 32.85], // Acco area
        [35.05, 32.95], // Zebulun border
        [35.2, 33.2],   // Upper Galilee W
        [35.1, 33.4],   // Northern extent
        [34.9, 33.3],   // Tyre / Sidon approach
        [34.85, 33.0],  // Coast north
        [34.85, 32.7],  // Coast mid
        [34.85, 32.55], // Close
      ]],
    },
  },

  // Gad — Transjordan between Reuben and Manasseh-East
  {
    id: 'tribe-gad',
    name: 'Gad',
    type: 'tribe',
    color: '#D2691E',
    opacity: 0.18,
    labelPosition: [35.9, 32.1],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [35.6, 31.9],   // North of Dead Sea, east bank
        [35.8, 31.8],   // East
        [36.1, 31.9],   // Eastern hills
        [36.1, 32.5],   // Gilead east
        [35.8, 32.4],   // Gilead west
        [35.6, 32.5],   // Jordan east bank
        [35.55, 32.3],  // Succoth area
        [35.55, 32.0],  // Jordan valley east
        [35.6, 31.9],   // Close
      ]],
    },
  },

  // Reuben — Transjordan south of Gad
  {
    id: 'tribe-reuben',
    name: 'Reuben',
    type: 'tribe',
    color: '#A0522D',
    opacity: 0.18,
    labelPosition: [35.8, 31.55],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [35.55, 31.75], // Dead Sea NE
        [35.6, 31.9],   // Gad border
        [35.8, 31.8],   // East
        [36.1, 31.9],   // Eastern hills
        [36.0, 31.4],   // Arnon river east
        [35.75, 31.2],  // Arnon mid
        [35.55, 31.3],  // Dead Sea mid-east
        [35.55, 31.75], // Close
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
        [34.25, 31.2],  // Gaza
        [34.55, 31.55], // Philistine coast
        [34.55, 31.95], // Joppa
        [34.75, 32.15], // Coast N
        [34.85, 32.55], // Carmel
        [34.85, 32.7],  // Acco
        [34.9, 33.1],   // Tyre approach
        [35.1, 33.4],   // Northern extent
        [35.6, 33.45],  // Dan
        [36.1, 33.3],   // Bashan N
        [36.5, 33.0],   // Bashan E
        [36.4, 32.5],   // Gilead E
        [36.1, 31.9],   // Gad E
        [36.0, 31.4],   // Arnon E
        [35.55, 31.0],  // Dead Sea S
        [35.35, 30.4],  // Arad
        [34.85, 30.5],  // Beersheba
        [34.25, 31.2],  // Close
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
        [34.55, 31.95], // Coast (Dan tribal area)
        [34.75, 32.05], // Joppa
        [34.75, 32.15], // Coast N
        [34.85, 32.55], // Carmel
        [34.85, 32.7],  // Acco
        [34.9, 33.1],   // Tyre approach
        [35.1, 33.4],   // Northern extent
        [35.6, 33.45],  // Dan
        [36.1, 33.3],   // Bashan N
        [36.5, 33.0],   // Bashan E
        [36.4, 32.5],   // Gilead E
        [36.1, 31.9],   // Gad E
        [35.6, 31.9],   // Jordan east of Dead Sea N
        [35.5, 32.0],   // Jordan
        [35.4, 31.92],  // Benjamin border (excluded)
        [35.25, 31.95], // Bethel area (border)
        [35.0, 31.92],  // NW Benjamin
        [34.55, 31.95], // Close
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
        [34.25, 31.2],  // Gaza
        [34.45, 31.55], // Philistine border
        [34.55, 31.75], // Coast
        [34.55, 31.95], // Joppa
        [35.0, 31.92],  // NW Benjamin
        [35.25, 31.95], // Bethel border
        [35.4, 31.92],  // East Benjamin
        [35.5, 31.85],  // Jordan / Jericho
        [35.55, 31.3],  // Dead Sea east shore mid
        [35.5, 30.9],   // Dead Sea S
        [35.35, 30.4],  // Arad
        [34.85, 30.5],  // Beersheba
        [34.25, 31.2],  // Close
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
        [34.85, 32.7],  // Acco coast
        [34.9, 33.5],   // Sidon
        [35.5, 34.5],   // Northern Syria coast
        [36.5, 36.0],   // Antioch region
        [38.0, 37.0],   // Upper Mesopotamia
        [42.0, 37.0],   // Nineveh region
        [44.5, 35.0],   // Assur / Tigris
        [45.0, 33.5],   // Babylon area
        [44.0, 32.0],   // Southern Mesopotamia
        [42.0, 31.0],   // Persian Gulf approach
        [39.0, 30.0],   // Arabian desert edge
        [36.0, 30.0],   // Transjordan south
        [35.5, 30.5],   // Dead Sea area
        [35.5, 31.5],   // Jordan valley
        [35.5, 32.5],   // Galilee
        [34.85, 32.7],  // Close
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
        [33.5, 31.5],   // Egyptian border / Sinai
        [34.5, 31.5],   // Philistine coast
        [34.85, 32.7],  // Acco
        [34.9, 33.5],   // Sidon
        [35.5, 34.5],   // Syria coast
        [36.5, 36.0],   // Antioch
        [38.0, 37.0],   // Upper Mesopotamia
        [42.0, 37.0],   // Nineveh (conquered)
        [44.5, 35.0],   // Tigris
        [45.0, 33.0],   // Babylon
        [44.5, 31.0],   // Southern Mesopotamia
        [42.0, 30.0],   // Persian Gulf approach
        [39.0, 29.0],   // Arabian desert
        [36.0, 29.5],   // Edom area
        [35.0, 30.0],   // Negev
        [33.5, 31.5],   // Close
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
        [29.5, 31.5],   // Egypt / Alexandria
        [31.5, 31.8],   // Nile Delta
        [33.5, 31.5],   // Sinai
        [34.5, 31.5],   // Philistine coast
        [34.9, 33.5],   // Sidon
        [35.5, 34.5],   // Syria coast
        [36.5, 36.0],   // Antioch
        [38.0, 37.5],   // Upper Mesopotamia
        [42.0, 37.5],   // Nineveh
        [45.0, 36.0],   // Arbela
        [48.0, 34.0],   // Susa approach
        [50.0, 32.0],   // Persia proper
        [50.0, 28.0],   // Persian Gulf east
        [48.0, 29.0],   // Gulf
        [44.5, 30.0],   // Gulf west
        [40.0, 29.0],   // Arabian desert
        [36.0, 28.0],   // Red Sea approach
        [34.0, 28.0],   // Sinai south
        [32.5, 29.5],   // Suez
        [30.5, 30.5],   // Memphis
        [29.5, 31.5],   // Close
      ]],
    },
  },

  // Roman provinces (Gospel era — Judea, Galilee, Samaria, etc.)
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
        [34.25, 31.2],  // Gaza
        [34.55, 31.55], // Coast
        [34.65, 31.75], // Joppa S
        [34.8, 31.9],   // Lydda / Lod
        [35.05, 31.95], // Bethel
        [35.4, 31.92],  // E border
        [35.5, 31.85],  // Jericho / Jordan
        [35.5, 31.0],   // Dead Sea S
        [35.35, 30.4],  // Arad / Negev
        [34.85, 30.5],  // Beersheba
        [34.25, 31.2],  // Close
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
        [34.65, 31.75], // Joppa S
        [34.8, 31.9],   // Lydda
        [34.75, 32.15], // Coast N
        [34.85, 32.55], // Carmel
        [35.15, 32.55], // Jezreel S border
        [35.35, 32.45], // Scythopolis approach
        [35.5, 32.3],   // Jordan valley
        [35.5, 32.0],   // Jordan
        [35.4, 31.92],  // Benjamin NE
        [35.05, 31.95], // Bethel
        [34.8, 31.9],   // Lydda
        [34.65, 31.75], // Close
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
        [34.85, 32.55], // Carmel
        [34.85, 32.7],  // Acco
        [34.9, 33.1],   // Coast N
        [35.1, 33.4],   // Upper Galilee N
        [35.55, 33.4],  // Caesarea Philippi area
        [35.7, 33.1],   // Sea of Galilee NE
        [35.65, 32.7],  // Sea of Galilee S
        [35.5, 32.55],  // Beth-shan
        [35.35, 32.45], // Scythopolis
        [35.15, 32.55], // Jezreel
        [34.85, 32.55], // Close
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
        [35.55, 31.6],  // Dead Sea NE
        [35.7, 31.5],   // East bank
        [36.0, 31.8],   // Eastern hills
        [36.1, 32.3],   // Gilead
        [35.8, 32.4],   // W Gilead
        [35.6, 32.5],   // Jordan
        [35.5, 32.3],   // Jordan valley
        [35.5, 32.0],   // Jordan mid
        [35.55, 31.6],  // Close
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
        [35.65, 32.7],  // Sea of Galilee S
        [35.7, 33.1],   // Sea of Galilee NE
        [36.1, 33.3],   // Golan / Bashan
        [36.5, 33.0],   // NE extent
        [36.5, 32.5],   // Eastern hills
        [36.1, 32.3],   // Gilead E
        [35.8, 32.4],   // Gilead W
        [35.6, 32.5],   // Jordan
        [35.65, 32.7],  // Close
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
        [29.0, 31.5],   // Egypt
        [30.0, 31.8],   // Delta
        [31.5, 31.8],   // Delta E
        [33.5, 31.5],   // Sinai N
        [34.5, 31.5],   // Coast
        [34.9, 33.5],   // Sidon
        [35.5, 34.5],   // Syria coast
        [36.0, 35.5],   // Antioch
        [36.5, 36.5],   // Cilicia
        [35.0, 37.0],   // Tarsus area
        [33.0, 37.0],   // Cappadocia S
        [30.0, 37.5],   // Central Anatolia
        [27.5, 38.5],   // Ephesus
        [26.0, 39.0],   // Pergamum
        [29.0, 41.0],   // Constantinople
        [23.5, 38.0],   // Athens
        [20.0, 39.0],   // Western Greece
        [18.5, 40.5],   // Adriatic
        [15.0, 41.0],   // Rome approach
        [12.5, 42.0],   // Rome
        [10.0, 44.0],   // Northern Italy
        [5.0, 43.5],    // Southern France
        [3.0, 42.0],    // Spain NE
        [-1.0, 38.0],   // Spain E coast
        [-6.0, 37.0],   // Spain S
        [-6.0, 35.0],   // Gibraltar
        [0.0, 36.0],    // Algeria coast
        [5.0, 37.0],    // Tunisia
        [10.0, 35.0],   // Carthage
        [15.0, 33.0],   // Libya coast
        [20.0, 32.0],   // Cyrenaica
        [25.0, 31.5],   // Egypt W
        [29.0, 31.5],   // Close
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
