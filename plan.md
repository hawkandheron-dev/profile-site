# Implementation Plan: Bible Atlas Enhancements

## Feature 1: Organic Journey Routes + Red Sea Fix

### 1A. Catmull-Rom Spline Smoothing

**New file:** `timeline-scratch/src/utils/smoothRoute.js`
- Pure math utility (~40 lines), no dependencies
- `smoothRoute(coords, { tension, pointsPerSegment })` takes `[[lng, lat], ...]` and returns a denser array with Catmull-Rom interpolated points between each pair
- Default: tension 0.5, 10 points per segment
- Accepts optional `waypoints` map keyed by segment index (for Phase B)

**Modify:** `timeline-scratch/src/components/BiblicalPlaces/BiblicalPlacesMap.jsx`
- Import `smoothRoute`
- At line ~488 where `coords` is built from journey stops, pass through `smoothRoute()` before creating the `LineString` feature
- The smoothed coords replace the raw coords; everything else (stop markers, labels) stays the same

### 1B. DB Waypoints Table (for manual overrides)

**New migration:** `supabase/migrations/20260221_bp_journey_waypoints.sql`

```sql
create table if not exists public."BP_JourneyWaypoints" (
  id              bigint generated always as identity primary key,
  journey_id      text not null,
  after_stop      integer not null,      -- insert between stop N and N+1
  waypoint_order  integer not null,      -- ordering within this segment
  lat             float8 not null,
  lng             float8 not null,
  constraint "BP_JourneyWaypoints_journey_fkey"
    foreign key (journey_id) references public."BP_Journeys"(journey_id) on delete cascade,
  constraint "BP_JourneyWaypoints_unique" unique (journey_id, after_stop, waypoint_order)
);

-- RLS: public read
alter table public."BP_JourneyWaypoints" enable row level security;
create policy "BP_JourneyWaypoints are viewable by everyone"
  on public."BP_JourneyWaypoints" for select using (true);
```

- Seed a handful of waypoints for the Exodus route (guide it around the Sinai coast rather than cutting across the peninsula)
- Fetch waypoints in `biblicalPlacesSupabaseAdapter.js`, group by journey_id + after_stop
- Pass waypoints into `smoothRoute()` as additional control points for those segments

### 1C. Red Sea Location Fix

In the same migration:
```sql
update public."BP_Places"
  set lat = 30.40, lng = 32.40
  where place_id = 'red-sea';
```

Moves from mid-Gulf of Suez to the Bitter Lakes area, matching the Exodus route from Raamses through the isthmus.

---

## Feature 2: Sign In / Sign Up on Bible Atlas

### Current state
- `main-biblical-places.jsx` already wraps app in `ClerkProvider`
- `BiblicalPlacesApp.jsx` has zero auth UI
- CH Timeline has a working pattern we replicate exactly

### Modify: `timeline-scratch/src/BiblicalPlacesApp.jsx`

1. Import Clerk hooks: `useAuth`, `useUser` from `@clerk/clerk-react`
2. Import Clerk components: `SignInButton`, `SignUpButton`, `UserButton`
3. Import `ensureUserExists`, `checkUserRole` from `services/adminService.js`
4. Add state: `userRole` (null initially), `authLoading`
5. Add `useEffect` that on sign-in calls `ensureUserExists()` then `checkUserRole()` (same pattern as CH Timeline)
6. Add auth buttons to `<header className="bp-header">`:
   - Signed out: "Sign In" / "Sign Up" buttons (Clerk modal mode)
   - Signed in: `<UserButton />` with optional role badge
7. Pass `getToken`, `clerkUserId`, `userRole` down to components that need it (issue creator)

### Modify: `timeline-scratch/src/BiblicalPlacesApp.css`
- Add styles for auth buttons in the header (minimal, matching existing parchment theme)

No new files needed — reuses existing `adminService.js` and `lib/supabase.ts`.

---

## Feature 3: Cross-App Issue Creator

### 3A. Database

**New migration:** `supabase/migrations/20260221_app_issues.sql`

```sql
create table public."App_Issues" (
  issue_id        bigint generated always as identity primary key,
  app_id          text not null,                    -- 'bible-atlas', 'ch-timeline'
  submitted_by    text not null,                    -- clerk_user_id
  title           text not null,
  description     text not null,                    -- free-form, primary input
  issue_type      text not null default 'general',  -- general / data_correction / feature_request / bug
  page_context    jsonb,                            -- auto-captured app state
  screenshot_urls text[],                           -- reserved for future Supabase Storage URLs
  status          text not null default 'open',     -- open / in_progress / resolved / closed
  resolver_notes  text,
  resolved_by     text,
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz
);

-- RLS: contributors can insert own rows, admins can read/update all
```

The `screenshot_urls` column is included in the schema now (empty array default) so it's ready when we add upload support later.

### 3B. Service Layer

**New file:** `timeline-scratch/src/services/issueService.js`

Following the exact pattern of `suggestionService.js`:
- `submitIssue({ app_id, title, description, issue_type, page_context }, clerkUserId, getToken)` — inserts into App_Issues
- `fetchMyIssues(appId, getToken)` — fetch issues submitted by current user
- `fetchAllIssues(appId, getToken, statusFilter)` — admin: fetch all issues
- `resolveIssue(issueId, resolverUserId, resolverNotes, getToken)` — admin: mark resolved
- Stub `uploadScreenshot(file, getToken)` — returns null for now, ready for Supabase Storage later

### 3C. Shared UI Components

**New files:**
```
timeline-scratch/src/components/IssueCreator/
  IssueCreatorButton.jsx    -- FAB/header button, visible for contributors only
  IssueCreatorModal.jsx     -- The modal form
  IssueCreatorModal.css     -- Styles
```

**IssueCreatorButton:**
- Accepts `userRole`, `getToken`, `clerkUserId`, `appId`, `getPageContext`
- Renders a small button (e.g., flag icon + "Report Issue")
- Returns `null` if user is not a contributor
- Only visible when `userRole.isContributor` (admin role alone does not grant access; admins who are also contributors will see it through their contributor flag)
- Opens `IssueCreatorModal` on click

**IssueCreatorModal:**
- **Title** — short text input
- **Description** — textarea (primary input, natural language)
- **Type** — pill selector: General | Data Correction | Feature Request | Bug
- **Page Context** — auto-captured via `getPageContext()`, displayed as a collapsible JSON preview ("Context captured — click to review"). User can see what's being sent but doesn't need to fill anything in.
- **Screenshot placeholder** — disabled drop zone with "Coming soon" label (wired up structurally so adding real uploads later is just implementing `uploadScreenshot`)
- Submit calls `issueService.submitIssue()`

### 3D. Context Capture

Each app provides a `getPageContext()` callback:

**Bible Atlas** returns:
```json
{
  "app": "bible-atlas",
  "url": "/biblical-places",
  "activeFilters": { "ageFilter": "age-exodus", "journey": "journey-exodus", "theme": null },
  "selectedEntity": { "type": "place", "id": "red-sea" },
  "modalStack": [{ "type": "place", "id": "red-sea" }],
  "visibleDataTables": ["BP_Places", "BP_Events", "BP_JourneyStops"],
  "mapState": { "center": [35.23, 31.77], "zoom": 6 }
}
```

**CH Timeline** returns:
```json
{
  "app": "ch-timeline",
  "url": "/church-history",
  "activeFilters": { "era": "era-reformation", "search": "Luther" },
  "selectedEntity": { "type": "person", "id": "martin-luther" },
  "visibleDataTables": ["CH_People", "CH_Events", "CH_Eras"]
}
```

### 3E. Integration

**Modify `BiblicalPlacesApp.jsx`:**
- Import `IssueCreatorButton`
- Add it in the header, passing `userRole`, `getToken`, `clerkUserId`, `appId='bible-atlas'`, and a `getPageContext` function that reads current state

**Modify `ChurchHistorySupabaseApp.jsx`:**
- Same pattern — add `IssueCreatorButton` to the header with CH Timeline's `getPageContext`

---

## Implementation Order

1. Journey route smoothing (smoothRoute.js + BiblicalPlacesMap.jsx changes)
2. Red Sea + waypoints migration (DB changes, data adapter update)
3. Sign in / sign up on Bible Atlas (BiblicalPlacesApp.jsx auth additions)
4. Issue creator DB + service + shared components
5. Issue creator integration into Bible Atlas
6. Issue creator integration into CH Timeline

## Files Summary

| Action | File |
|--------|------|
| New | `timeline-scratch/src/utils/smoothRoute.js` |
| Modify | `timeline-scratch/src/components/BiblicalPlaces/BiblicalPlacesMap.jsx` |
| New | `supabase/migrations/20260221_bp_journey_waypoints_and_red_sea.sql` |
| Modify | `timeline-scratch/src/data/biblicalPlacesSupabaseAdapter.js` |
| Modify | `timeline-scratch/src/BiblicalPlacesApp.jsx` |
| Modify | `timeline-scratch/src/BiblicalPlacesApp.css` |
| New | `supabase/migrations/20260221_app_issues.sql` |
| New | `timeline-scratch/src/services/issueService.js` |
| New | `timeline-scratch/src/components/IssueCreator/IssueCreatorButton.jsx` |
| New | `timeline-scratch/src/components/IssueCreator/IssueCreatorModal.jsx` |
| New | `timeline-scratch/src/components/IssueCreator/IssueCreatorModal.css` |
| Modify | `timeline-scratch/src/ChurchHistorySupabaseApp.jsx` |
