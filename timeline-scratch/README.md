# Timeline-Scratch

A custom timeline component built from scratch using React and HTML5 Canvas.

## Features

- **Hybrid Rendering**: Canvas for performance + HTML/SVG overlays for interactivity
- **Smooth Zoom & Pan**: Continuous zoom (like Google Maps) with mouse wheel and drag
- **Three Item Types**:
  - **People**: Lifespan boxes with sticky labels
  - **Points**: Events marked with medievalized geometric shapes (diamond, square, circle, triangle)
  - **Periods**: Bracket-style spans for historical periods
- **Interactive**:
  - Hover for quick preview
  - Click for detailed modal with images, descriptions, and links
- **Stair-Step Layout**: Overlapping items automatically stack vertically
- **Legend**: Color-coded periods and icon indicators
- **Fixed Window**: Stable viewport without jumpy resizing

## Development

```bash
npm install
npm run dev
```

Open http://localhost:5173/

## Build

```bash
npm run build
```

Output is in `dist/` directory.

## Data Format

See `src/data/sampleData.js` for the data structure. Timeline accepts:

- **People**: `{ id, name, startDate, endDate, dateCertainty, periodId, preview, description, links }`
- **Points**: `{ id, name, date, dateCertainty, shape, color, preview, description, links }`
- **Periods**: `{ id, name, startDate, endDate, color, preview, description, links }`

Dates use ISO 8601 format with negative years for BCE (e.g., "-0099-07-12" = July 12, 100 BC).

## Configuration

```jsx
<Timeline
  data={{ people: [...], points: [...], periods: [...] }}
  config={{
    initialViewport: { startDate: "0001-01-01", endDate: "0200-12-31" },
    eraLabels: "BC/AD", // or "BCE/CE"
    laneOrder: ["people", "points", "periods"],
    legend: [...]
  }}
/>
```

## Architecture

- `Timeline.jsx` - Main component
- `components/TimelineCanvas.jsx` - Canvas rendering layer
- `components/TimelineOverlay.jsx` - HTML/SVG overlays for labels
- `components/TimelineModal.jsx` - Detail modal
- `components/TimelineLegend.jsx` - Legend component
- `hooks/useZoomPan.js` - Zoom/pan state management
- `hooks/useTimelineLayout.js` - Layout calculations
- `utils/` - Date handling, coordinates, stacking algorithms, rendering

## Future Enhancements

- Mobile/vertical timeline mode
- Filtering and search
- Export to image/PDF
- Custom themes
- Accessibility improvements
