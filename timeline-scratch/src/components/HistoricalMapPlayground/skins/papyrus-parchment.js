// Skin evoking ink-on-papyrus manuscript maps: warm cream ground,
// sepia line work, minimal fills, dashed borders.
export const papyrusParchment = {
  id: 'papyrus-parchment',
  label: 'Papyrus / parchment',
  description: 'Sepia ink on warm cream — early manuscript map.',
  overlay: {
    texture: './textures/papyrus.svg',
    blendMode: 'multiply',
    opacity: 0.6,
  },
  layerRules: [
    { match: /^background$/,                paint: { 'background-color': '#f0e0b8' } },
    { match: /landcover|landuse|land$/,     paint: { 'fill-color': '#ecd9a8', 'fill-opacity': 0.35 } },
    { match: /park|forest|wood|grass/,      paint: { 'fill-color': '#d8c389', 'fill-opacity': 0.3 } },
    { match: /sand|desert|beach/,           paint: { 'fill-color': '#eed9a0', 'fill-opacity': 0.45 } },

    // Water — pale sepia wash, almost the same hue as land
    { match: /water|ocean|sea|river|lake/,  paint: { 'fill-color': '#c9a878', 'fill-opacity': 0.55 } },
    { match: /waterway|river-line|stream/,  paint: { 'line-color': '#7a4a20', 'line-width': 0.9 } },

    // Roads — single sepia line, minimal hierarchy
    { match: /road|highway|motorway/,       paint: { 'line-color': '#5a3a18' } },
    { match: /road-(minor|service|track)/,  paint: { 'line-color': '#7a5530', 'line-width': 0.7 } },

    // Borders — dashed sepia
    { match: /boundary|admin/,              paint: { 'line-color': '#5a3a18', 'line-opacity': 0.8, 'line-dasharray': [3, 2] } },

    // Labels — deep sepia, no halo (it's "ink")
    { match: /label|place|poi/,             paint: { 'text-color': '#3a2410', 'text-halo-color': '#f0e0b8', 'text-halo-width': 0.6 } },
  ],
};
