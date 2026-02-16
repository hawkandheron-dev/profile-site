-- RLS policies for Biblical Places tables: public read access.

begin;

-- Enable RLS on all BP_ tables
alter table public."BP_NarrativeAges" enable row level security;
alter table public."BP_Places" enable row level security;
alter table public."BP_People" enable row level security;
alter table public."BP_PersonAges" enable row level security;
alter table public."BP_Events" enable row level security;
alter table public."BP_PersonPlaces" enable row level security;
alter table public."BP_EventPeople" enable row level security;
alter table public."BP_Sources" enable row level security;
alter table public."BP_SourceFigures" enable row level security;

-- Public SELECT policies
create policy "Public can read narrative ages" on public."BP_NarrativeAges"
  for select using (true);

create policy "Public can read places" on public."BP_Places"
  for select using (true);

create policy "Public can read people" on public."BP_People"
  for select using (true);

create policy "Public can read person ages" on public."BP_PersonAges"
  for select using (true);

create policy "Public can read events" on public."BP_Events"
  for select using (true);

create policy "Public can read person places" on public."BP_PersonPlaces"
  for select using (true);

create policy "Public can read event people" on public."BP_EventPeople"
  for select using (true);

create policy "Public can read sources" on public."BP_Sources"
  for select using (true);

create policy "Public can read source figures" on public."BP_SourceFigures"
  for select using (true);

commit;
