-- RLS policies for First Century Church Directory tables: public read access.

begin;

-- Enable RLS on all FCC_ tables
alter table public."FCC_Regions"        enable row level security;
alter table public."FCC_Churches"       enable row level security;
alter table public."FCC_People"         enable row level security;
alter table public."FCC_Households"     enable row level security;
alter table public."FCC_Memberships"    enable row level security;
alter table public."FCC_Journeys"       enable row level security;
alter table public."FCC_ScriptureRefs"  enable row level security;
alter table public."FCC_JourneyStops"   enable row level security;
alter table public."FCC_JourneyPeople"  enable row level security;

-- Public SELECT policies
create policy "Public can read regions" on public."FCC_Regions"
  for select using (true);

create policy "Public can read churches" on public."FCC_Churches"
  for select using (true);

create policy "Public can read people" on public."FCC_People"
  for select using (true);

create policy "Public can read households" on public."FCC_Households"
  for select using (true);

create policy "Public can read memberships" on public."FCC_Memberships"
  for select using (true);

create policy "Public can read journeys" on public."FCC_Journeys"
  for select using (true);

create policy "Public can read scripture refs" on public."FCC_ScriptureRefs"
  for select using (true);

create policy "Public can read journey stops" on public."FCC_JourneyStops"
  for select using (true);

create policy "Public can read journey people" on public."FCC_JourneyPeople"
  for select using (true);

commit;
