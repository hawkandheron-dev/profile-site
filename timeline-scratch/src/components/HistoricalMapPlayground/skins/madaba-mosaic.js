// Skin inspired by the 6th-century Madaba mosaic map: cream land,
// indigo water with a hint of tessellation, terracotta roads,
// sepia borders.
//
// Each rule targets OHM layers by id-pattern (substring match against
// layer.id). PlaygroundMap applies these on `styledata` so we don't
// need to enumerate every OHM layer up front; new OHM layers that
// match an existing pattern are styled automatically.
export const madabaMosaic = {
  id: 'madaba-mosaic',
  label: 'Madaba mosaic',
  description: 'Cream land, indigo water, terracotta roads — the Madaba north star.',
  overlay: {
    texture: './textures/papyrus.svg',
    blendMode: 'multiply',
    opacity: 0.35,
  },
  layerRules: [
    // Background / land
    { match: /^background$/,                paint: { 'background-color': '#ead9b0' } },
    { match: /landcover|landuse|land$/,     paint: { 'fill-color': '#e3cea0', 'fill-opacity': 0.55 } },
    { match: /park|forest|wood|grass/,      paint: { 'fill-color': '#cdbf86', 'fill-opacity': 0.5 } },
    { match: /sand|desert|beach/,           paint: { 'fill-color': '#e7d29a', 'fill-opacity': 0.6 } },

    // Water — deep, slightly purple indigo like Madaba tesserae
    { match: /water|ocean|sea|river|lake/,  paint: { 'fill-color': '#34507a', 'fill-opacity': 0.85 } },
    { match: /waterway|river-line|stream/,  paint: { 'line-color': '#34507a', 'line-width': 1.2 } },

    // Roads — terracotta, sepia hierarchy
    { match: /road|highway|motorway/,       paint: { 'line-color': '#a8482a' } },
    { match: /road-(minor|service|track)/,  paint: { 'line-color': '#b76a4a', 'line-width': 0.8 } },

    // Borders / admin
    { match: /boundary|admin/,              paint: { 'line-color': '#6b4a2a', 'line-opacity': 0.7 } },

    // Labels — dark sepia with cream halo
    { match: /label|place|poi/,             paint: { 'text-color': '#3a2614', 'text-halo-color': '#f4e7c5', 'text-halo-width': 1.5 } },
  ],
};
