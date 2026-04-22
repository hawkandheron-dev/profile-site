# Attribution

Windhover makes use of the following third-party content. Each entry lists the
source, the license that covers our use, and a link to the upstream item.
When adding new third-party assets (images, fonts, map tiles, data), please
append them here.

## Images

### Bodleian Library, MS. Bodl. 264, fol. 128r — *The Romance of Alexander*

Used as a fixed low-opacity (~7%) page background on most of the site
(`style.css`, `body::before`), and reproduced on the design system page.

- **Source:** Digital Bodleian, Bodleian Libraries, University of Oxford.
- **Permalink:** https://digital.bodleian.ox.ac.uk/objects/a95d5c8f-9ba0-4e32-92f5-0f01840ba629/
- **License:** Terms of use as published by the Digital Bodleian — please
  confirm the current license for this item before redistributing the image
  itself.

### Bodleian Library, MS. Laud Misc. 388, fol. 16v

Present in `resources/` for future use; not currently displayed on any page.

- **Source:** Digital Bodleian, Bodleian Libraries, University of Oxford.

## Maps

### OpenHistoricalMap

Four pages load map tiles + cartographic style from OpenHistoricalMap via
MapLibre GL JS:

- `timeline-scratch/src/components/BiblicalPlaces/BiblicalPlacesMap.jsx`
- `timeline-scratch/src/components/AfricanKingdoms/AfricanKingdomsMap.jsx`
- `timeline-scratch/src/components/Timeline/components/HistoricalMap.jsx`
- `timeline-scratch/src/components/Timeline/components/YearDetailMap.jsx`

- **Data:** © OpenHistoricalMap contributors — licensed under the
  [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
- **Cartography:** © OpenHistoricalMap — licensed under
  [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/).
- **Home:** https://www.openhistoricalmap.org/

Attribution is rendered at runtime by MapLibre's default
`AttributionControl` using the attribution declared in the OpenHistoricalMap
style JSON.

## Fonts

### Outfit

Used for the Windhover wordmark.

- **Source:** https://fonts.google.com/specimen/Outfit
- **License:** SIL Open Font License 1.1 — see `resources/fonts/Outfit/OFL.txt`.

### Cormorant & Alegreya Sans

Loaded from Google Fonts for body and display type.

- **License:** SIL Open Font License 1.1.

## Our content

The prose, data, and code authored for this project are not yet published
under an explicit open-source license. A `LICENSE` file will be added at the
repo root once the license choice is finalized. Until then, all of our
original content is "all rights reserved" by default; please ask before
redistributing.
