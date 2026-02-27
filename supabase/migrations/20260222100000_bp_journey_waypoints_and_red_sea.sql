-- Journey waypoints for manual route control + Red Sea coordinate fix
begin;

-- ── 1. BP_JourneyWaypoints table ──────────────────────────────────────────────

create table if not exists public."BP_JourneyWaypoints" (
  id              bigint generated always as identity primary key,
  journey_id      text not null,
  after_stop      integer not null,      -- insert between stop N and N+1 (0-based)
  waypoint_order  integer not null,      -- ordering within this segment
  lat             double precision not null,
  lng             double precision not null,
  constraint "BP_JourneyWaypoints_journey_fkey"
    foreign key (journey_id) references public."BP_Journeys"(journey_id) on delete cascade,
  constraint "BP_JourneyWaypoints_unique" unique (journey_id, after_stop, waypoint_order)
);

alter table public."BP_JourneyWaypoints" enable row level security;

create policy "BP_JourneyWaypoints are viewable by everyone"
  on public."BP_JourneyWaypoints" for select using (true);

-- ── 2. Seed Exodus waypoints (guide route around Sinai coast) ─────────────────
-- These add curvature between journey stops so the Exodus route follows
-- a plausible path rather than cutting straight across the peninsula.

insert into public."BP_JourneyWaypoints" (journey_id, after_stop, waypoint_order, lat, lng) values
  -- After stop 0 (Raamses → Succoth): route south through Wadi Tumilat
  ('journey-exodus', 0, 1, 30.75, 31.90),
  -- After stop 1 (Succoth → Etham): eastward toward the Bitter Lakes
  ('journey-exodus', 1, 1, 30.55, 32.20),
  -- After stop 2 (Etham → Red Sea crossing): south along the lakes
  ('journey-exodus', 2, 1, 30.30, 32.45),
  -- After stop 3 (Red Sea → Marah): into the western Sinai coast
  ('journey-exodus', 3, 1, 29.80, 32.70),
  ('journey-exodus', 3, 2, 29.20, 33.00),
  -- After stop 4 (Marah → Elim): following the coast south
  ('journey-exodus', 4, 1, 28.80, 33.20),
  -- After stop 5 (Elim → Wilderness of Sin): curving southeast
  ('journey-exodus', 5, 1, 28.50, 33.50),
  -- After stop 6 (Wilderness of Sin → Rephidim): into the interior
  ('journey-exodus', 6, 1, 28.60, 33.80),
  -- After stop 7 (Rephidim → Mount Sinai): final approach
  ('journey-exodus', 7, 1, 28.60, 33.90)
on conflict on constraint "BP_JourneyWaypoints_unique" do nothing;

-- ── 3. Red Sea coordinate fix ──────────────────────────────────────────────────
-- Move from mid-Gulf of Suez (29.50, 32.75) to the Bitter Lakes / isthmus
-- area, matching the traditional Exodus route from Raamses.

update public."BP_Places"
  set lat = 30.40, lng = 32.40
  where place_id = 'red-sea';

commit;
