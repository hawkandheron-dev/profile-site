// Skin inspired by Pompeian frescoes and the National Geographic
// "Reach of Rome" map — soft pinks, ochres, faded greens.
export const romanFresco = {
  id: 'roman-fresco',
  label: 'Roman fresco',
  description: 'Soft pinks, ochres, faded greens — Pompeian wall painting.',
  overlay: {
    texture: './textures/fresco-plaster.svg',
    blendMode: 'multiply',
    opacity: 0.45,
  },
  layerRules: [
    { match: /^background$/,                paint: { 'background-color': '#f1d9b8' } },
    { match: /landcover|landuse|land$/,     paint: { 'fill-color': '#e7b893', 'fill-opacity': 0.55 } },
    { match: /park|forest|wood|grass/,      paint: { 'fill-color': '#a8b27a', 'fill-opacity': 0.5 } },
    { match: /sand|desert|beach/,           paint: { 'fill-color': '#e9c98a', 'fill-opacity': 0.55 } },

    // Water — soft sea green
    { match: /water|ocean|sea|river|lake/,  paint: { 'fill-color': '#557a6a', 'fill-opacity': 0.7 } },
    { match: /waterway|river-line|stream/,  paint: { 'line-color': '#3f5d50', 'line-width': 1 } },

    // Roads — wine red
    { match: /road|highway|motorway/,       paint: { 'line-color': '#8a3a3a' } },
    { match: /road-(minor|service|track)/,  paint: { 'line-color': '#a85c5c', 'line-width': 0.8 } },

    // Borders
    { match: /boundary|admin/,              paint: { 'line-color': '#5a2a2a', 'line-opacity': 0.6 } },

    // Labels — warm halo, deep wine text
    { match: /label|place|poi/,             paint: { 'text-color': '#3a1818', 'text-halo-color': '#f5e2c6', 'text-halo-width': 1.8 } },
  ],
};
