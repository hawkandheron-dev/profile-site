# Narrative Age + Place Context - Implementation Plan

## Summary
When a narrative age is selected and the user clicks a place, the place detail panel shows age-contextual information: the period-specific name, year range, age-specific summary, focused events/people for that era, and before/after sections. Navigation arrows in the place modal let the user step through all 10 narrative ages without closing the panel.

---

## 1. Database: New Tables + Migration

**New migration file:** `supabase/migrations/20260217_bp_place_age_context.sql`

### BP_PlacePeriodNames
Stores period-specific names for places (e.g., "Sea of Kinnereth" during Conquest, "Sea of Galilee" during Gospels).
```sql
place_id  text FK → BP_Places
age_id    text FK → BP_NarrativeAges
name      text NOT NULL
UNIQUE (place_id, age_id)
```

### BP_PlaceAgeSummaries
Stores age-specific summary/description text for a place.
```sql
place_id  text FK → BP_Places
age_id    text FK → BP_NarrativeAges
summary   text NOT NULL
UNIQUE (place_id, age_id)
```

Both tables get public-read RLS policies. Seed with a handful of examples to prove the feature.

---

## 2. Data Adapter Changes

**File:** `biblicalPlacesSupabaseAdapter.js`

- Fetch both new tables in the existing `Promise.all`
- Build two new lookup maps:
  - `placeNamesMap`: `Map<place_id, Map<age_id, name>>` — for O(1) lookup of period name
  - `placeAgeSummariesMap`: `Map<place_id, Map<age_id, summary>>` — for O(1) lookup of age summary
- Export both in the returned data object

---

## 3. BiblicalPlacesApp Changes

**File:** `BiblicalPlacesApp.jsx`

- Pass new props to `PlaceModal`:
  - `activeAgeFilter` — currently selected narrative age ID (or null)
  - `ages` — sorted array of all ages (for prev/next navigation)
  - `placeNamesMap` — period name lookups
  - `placeAgeSummariesMap` — age summary lookups
  - `onAgeChange` — callback to change the active narrative age (reuses `handleAgeFilter`)

---

## 4. PlaceModal Overhaul

**File:** `PlaceModal.jsx`

### 4a. Header Navigation — Replace Back Button

Remove the current "back" button. Add prev/next narrative age buttons:

```
[← Return & Restoration]     [Gospels →]       [×]
```

- Left arrow: previous age (by sort_order), label = previous age's name
- Right arrow: next age, label = next age's name
- At the first age, no left arrow. At the last, no right arrow.
- Clicking calls `onAgeChange(newAgeId)` which sets the app-level `activeAgeFilter`
- Only show these when an age IS selected. When no age selected, show a simple close button.

### 4b. Title

- **No age selected:** `{place.name}` (common name, current behavior)
- **Age selected:** `{periodName || place.name} in {formatYearRange(age)}`
  - e.g., "Jordan River (539–167 BC)"
  - Period name from `placeNamesMap`, falling back to common name

### 4c. Description

- **No age selected:** `{place.description}` (current behavior)
- **Age selected:** Age-specific summary from `placeAgeSummariesMap`, falling back to `place.description`

### 4d. Content Sections

**No age selected (current behavior preserved):**
- All people & events in chronological order, grouped by age

**Age selected — three sections:**

1. **"During {Age Name}"** — Events and people for the selected age at this place
   - Same card rendering as current, but filtered to selected age only
   - If nothing for this age, show a subtle "No recorded events during this period" message

2. **"Before"** — Events/people from ages with lower sort_order
   - Grouped by age (same as current), but only ages before the selected one
   - Slightly muted/secondary styling to distinguish from the focus section

3. **"After"** — Events/people from ages with higher sort_order
   - Same grouping, muted styling

### 4e. Sync with External Age Changes

When the user clicks a different age in the NarrativeAgeFilter bar while the modal is open, the modal should reactively update (it already will, since `activeAgeFilter` is a prop from the parent).

---

## 5. CSS Changes

**File:** `PlaceModal.css`

- New `.bp-age-nav` container for the prev/next buttons
- `.bp-age-nav-btn` with arrow + label styling
- `.bp-age-nav-prev`, `.bp-age-nav-next` for left/right alignment
- `.bp-modal-title-age` subtitle styling for the year range
- `.bp-section-before`, `.bp-section-after` for muted/secondary styling of before/after sections
- Dark mode variants for all new classes

---

## 6. Implementation Sequence

1. Create the database migration (new tables + seed data)
2. Update the data adapter (fetch + build maps)
3. Update BiblicalPlacesApp (pass new props)
4. Rewrite PlaceModal (navigation, title, description, sections)
5. Add CSS for new layout
