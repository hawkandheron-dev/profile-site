# Biblical Places Map - Implementation Plan

An interactive map where you click on a place and see all Bible events and people associated with that location, navigating backwards and forwards through "narrative time" at one spot. Scope: Old Testament through the Gospels (Paul's journeys and Patmos are a separate project).

---

## Core Concept: Narrative Ages (Not Dates)

OT characters have no reliable historical dates. Instead of a timeline axis, the organizing principle is **narrative ages** -- sequential periods from the biblical text. Each event and person-place association is tagged with a narrative age, and a `sort_order` on the age plus a `sort_within_age` on the event provides deterministic ordering without claiming historical dates.

Each narrative age also stores optional `approx_start_year` / `approx_end_year` so we can pass a year to Open Historical Map's `filterByDate()` to show a roughly appropriate historical landscape when a user selects that age.

| age_id | Name | sort_order | Approx. Years | Scripture Range |
|--------|------|------------|---------------|-----------------|
| age-creation | Creation & Primeval History | 1 | -4000 to -2100 | Genesis 1-11 |
| age-patriarchs | Patriarchs | 2 | -2100 to -1700 | Genesis 12-50 |
| age-exodus | Exodus & Wilderness | 3 | -1450 to -1400 | Exodus-Deuteronomy |
| age-conquest | Conquest & Judges | 4 | -1400 to -1050 | Joshua-Ruth |
| age-united-monarchy | United Monarchy | 5 | -1050 to -930 | 1 Sam - 1 Kings 11 |
| age-divided-monarchy | Divided Monarchy | 6 | -930 to -722 | 1 Kings 12 - 2 Kings 17 |
| age-judah-exile | Judah Alone & Exile | 7 | -722 to -539 | 2 Kings 18-25, Jer, Ezek |
| age-return | Return & Restoration | 8 | -539 to -167 | Ezra, Nehemiah, post-exilic prophets |
| age-second-temple | Second Temple / Intertestamental | 9 | -167 to -4 | |
| age-gospels | Gospels | 10 | -4 to 33 | Matthew-John |

People can belong to **multiple** narrative ages (many-to-many) since figures like Gabriel, the Angel of the Lord, and others span the full narrative.

---

## Supabase Schema (BP_ prefix)

Following the exact conventions from `CH_` tables: quoted identifiers, text PKs, `created_at` defaults, foreign keys, indexes, RLS with public read.

### Tables

**BP_NarrativeAges** - The 10 narrative periods above
- `age_id` (text PK), `name`, `sort_order`, `color`, `approx_start_year`, `approx_end_year`, `description`, `scripture_range`

**BP_Places** - Map locations
- `place_id` (text PK), `name`, `lat` (double), `lng` (double), `region`, `description`, `reference_url`

**BP_People** - Biblical figures
- `person_id` (text PK), `name`, `description`, `reference_url`, `scripture_refs`
- No single `narrative_age_id` FK -- ages are via the join table below

**BP_PersonAges** (many-to-many) - Which ages a person appears in
- `person_id` FK, `age_id` FK, `is_primary` (boolean) -- `is_primary` marks the person's "home" age for display color

**BP_Events** - Things that happened at places
- `event_id` (text PK), `name`, `narrative_age_id` FK, `place_id` FK, `description`, `event_type` (event/miracle/battle/covenant/prophecy), `scripture_ref`, `sort_within_age` (int), `reference_url`

**BP_PersonPlaces** (many-to-many with context) - Who was where and when
- `person_id` FK, `place_id` FK, `narrative_age_id` FK, `context` ("born here", "died here", "passed through", "ruled here"), `notes`

**BP_EventPeople** (many-to-many) - Who participated in which events
- `event_id` FK, `person_id` FK

**BP_Sources** and **BP_SourceFigures** - Reference materials, same pattern as CH_

### Migrations (3 files)
1. `supabase/migrations/YYYYMMDD_init_bp_tables.sql` -- Schema creation
2. `supabase/migrations/YYYYMMDD_bp_read_policies.sql` -- Public read RLS policies
3. `supabase/migrations/YYYYMMDD_seed_bp_data.sql` -- Minimal seed: the 10 narrative ages + ~15 key places with coordinates + a handful of representative people/events to prove out the UI

Seed data is intentionally minimal. Bulk data population will happen via a separate research-assisted step (Supabase dashboard, script, or future admin UI).

---

## Vite Entry Point

Following the multi-page pattern exactly:

| File | Purpose |
|------|---------|
| `timeline-scratch/biblical-places.html` | HTML entry point (`<div id="root">`, module script) |
| `timeline-scratch/src/main-biblical-places.jsx` | React entry with Clerk conditional wrapping |
| `timeline-scratch/vite.config.js` | Add `'biblical-places'` to rollupOptions.input |

---

## Data Adapter

**`timeline-scratch/src/data/biblicalPlacesSupabaseAdapter.js`**

Follows `churchHistorySupabaseAdapter.js` exactly:
- Same `getSupabase()` init (Cloudflare Pages Function fallback to local config)
- `fetchBiblicalPlacesData()` fetches all 8 BP_ tables in parallel via `Promise.all`
- `transformToBiblicalPlacesFormat()` builds:
  - `ages` -- sorted array of narrative ages
  - `places` -- array with lat/lng
  - `people` -- array with their ages resolved
  - `events` -- array with age and place resolved
  - Pre-built relationship maps for O(1) lookup:
    - `placeEventsMap`: place_id -> events sorted by age sort_order
    - `placePeopleMap`: place_id -> [{ person, context, age }]
    - `eventPeopleMap`: event_id -> people array
    - `personEventsMap`: person_id -> events array
    - `personPlacesMap`: person_id -> [{ place, context, age }]
    - `personAgesMap`: person_id -> [ages] with primary marked
  - `entityIndex`: Map<id, { item, type }> for cross-referencing and search

---

## App Component

**`timeline-scratch/src/BiblicalPlacesApp.jsx`**

Structure follows `ChurchHistorySupabaseApp.jsx`:

```
BiblicalPlacesApp
  state: { data, loading, error, modalStack }
  useEffect -> fetchBiblicalPlacesData()
  Clerk conditional wrapping (same hasClerk pattern)

  <header> -- floating over map
    <BiblicalPlacesSearch>
    <AuthActions> (Clerk sign in/out)
    <NavDropdown> (links to Home, Church History, etc.)
  </header>

  <BiblicalPlacesMap> -- full viewport
    pins for all places
    NarrativeAgeFilter bar at bottom

  <PlaceModal>  -- when place selected
  <PersonModal> -- when person selected
  <EventModal>  -- when event selected
```

**No `<Timeline>` component.** The map IS the primary interface.

**Modal stack navigation:** A simple array tracks the open modal history. Clicking a person pill in PlaceModal pushes `{ type: 'person', id }` onto the stack. A back button pops the stack. This enables deep cross-referencing (Place -> Person -> another Place -> Event) with back-navigation, all without a router.

---

## Map Component

**`timeline-scratch/src/components/BiblicalPlaces/BiblicalPlacesMap.jsx`**

Full-viewport MapLibre GL map using OHM tiles. Builds on patterns from `YearDetailMap.jsx` but uses GeoJSON source layers with clustering instead of DOM markers (better performance at 20+ places, built-in hit detection):

- **GeoJSON source** with `cluster: true` for automatic clustering when zoomed out
- **Circle layers** for clusters and individual pins
- **Pin colors** from the earliest narrative age associated with each place
- **Click handler** on the unclustered-point layer opens PlaceModal
- **Popup on hover** shows place name
- **`flyTo()`** when selecting a place from search
- **OHM date filtering**: when a narrative age is selected in the filter, calls `filterByDate(map, formatYearForOHM(age.approx_start_year))` to show the historical landscape for that period

### NarrativeAgeFilter

Horizontal bar of colored pill buttons at the bottom of the map (one per narrative age). Clicking a pill:
1. Filters pins to show only places with events/people in that age (others dimmed/hidden)
2. Applies OHM date filter for the age's approximate year range
3. Clicking the active pill again clears the filter (shows all, resets OHM to default)

---

## Modal Components

Three focused modals, adapting patterns from `TimelineModal.jsx`:

### PlaceModal (the key modal)
The core feature -- shows everything that happened at one location across narrative time:
- Place name, region, description
- Small embedded `<HistoricalMap>` (reusing existing component)
- **"Narrative Timeline" section**: events grouped under narrative age headers, ordered by sort_order. Each event is expandable, showing description, scripture_ref, and clickable people pills
- **"People Associated" section**: grouped by narrative age, each person as a clickable pill with context text ("born here", "traveled through")
- Sources, reference URL

### PersonModal
- Person name, narrative age badge(s), scripture_refs
- Description
- **Places section**: clickable place pills with context
- **Events section**: clickable event entries
- Connected people (via shared events)
- Sources

### EventModal
- Event name, narrative age badge, event_type badge
- Scripture reference, description
- Place link (clickable pill)
- Small `<HistoricalMap>` at the event location
- People involved (clickable pills)
- Sources

### Shared modal patterns
- `.modal-backdrop` / `.modal-content` from `TimelineModal.css`
- `.modal-pill` clickable entity chips
- `.narrative-age-badge` colored inline badge
- `.scripture-ref` styled text
- Back button for modal stack navigation
- `linkifyDescription()` for auto-linking entity names in text

---

## Search

**`timeline-scratch/src/components/BiblicalPlaces/BiblicalPlacesSearch.jsx`**

Following `TimelineSearch.jsx` pattern:
- Builds flat searchable index from `entityIndex`
- Substring match on name, grouped results dropdown (Places / People / Events)
- Selecting a place: `map.flyTo()` + open PlaceModal
- Selecting a person/event: open respective modal

---

## New File Manifest

```
timeline-scratch/
  biblical-places.html
  src/
    main-biblical-places.jsx
    BiblicalPlacesApp.jsx
    BiblicalPlacesApp.css
    data/
      biblicalPlacesSupabaseAdapter.js
    components/
      BiblicalPlaces/
        BiblicalPlacesMap.jsx
        BiblicalPlacesMap.css
        NarrativeAgeFilter.jsx
        PlaceModal.jsx
        PersonModal.jsx
        EventModal.jsx
        PlaceModal.css
        BiblicalPlacesSearch.jsx
        BiblicalPlacesSearch.css

supabase/migrations/
  YYYYMMDD_init_bp_tables.sql
  YYYYMMDD_bp_read_policies.sql
  YYYYMMDD_seed_bp_data.sql
```

**Modified files:** `timeline-scratch/vite.config.js`, `index.html`

---

## Implementation Sequence

1. **Supabase migrations** -- schema, policies, seed data
2. **Vite entry point** -- HTML, main JSX, vite.config.js
3. **Data adapter** -- fetch + transform, console.log to verify
4. **BiblicalPlacesApp skeleton** -- loads data, shows loading state
5. **BiblicalPlacesMap** -- full-screen map with place pins
6. **PlaceModal** -- narrative timeline grouping (the core feature)
7. **PersonModal + EventModal** -- simpler modals
8. **Modal stack navigation** -- cross-linking between all three modals
9. **BiblicalPlacesSearch** -- search bar
10. **NarrativeAgeFilter** -- age filter pills with OHM date filtering
11. **Nav integration** -- landing page link, NavDropdown in app
