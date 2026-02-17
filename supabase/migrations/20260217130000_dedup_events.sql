-- Merge duplicate BP_Events rows that share the same name and place_id.
--
-- Codex-generated migrations added events that duplicate original seed data
-- (e.g. a second "Baptism of Jesus" at Jordan River with broader scripture refs).
-- This migration keeps the original (lowest-sorting) event, merges the broader
-- scripture_ref if the duplicate has one, reassigns orphaned BP_EventPeople
-- and BP_ResourceLinks rows, then deletes the duplicate.

begin;

-- Step 1: For each set of duplicates (same name + place_id), update the
-- keeper's scripture_ref to the longest/broadest version available.
update public."BP_Events" keeper
set scripture_ref = dup.scripture_ref
from public."BP_Events" dup
where keeper.name = dup.name
  and keeper.place_id is not null
  and keeper.place_id = dup.place_id
  and keeper.event_id < dup.event_id
  and length(dup.scripture_ref) > length(keeper.scripture_ref);

-- Also merge description if the duplicate has a longer one
update public."BP_Events" keeper
set description = dup.description
from public."BP_Events" dup
where keeper.name = dup.name
  and keeper.place_id is not null
  and keeper.place_id = dup.place_id
  and keeper.event_id < dup.event_id
  and dup.description is not null
  and (keeper.description is null or length(dup.description) > length(keeper.description));

-- Step 2: Reassign BP_EventPeople from duplicates to the keeper.
-- Use ON CONFLICT to skip rows that already exist on the keeper.
insert into public."BP_EventPeople" (event_id, person_id)
select keeper.event_id, ep.person_id
from public."BP_EventPeople" ep
join public."BP_Events" dup on dup.event_id = ep.event_id
join public."BP_Events" keeper
  on keeper.name = dup.name
  and keeper.place_id = dup.place_id
  and keeper.event_id < dup.event_id
where dup.event_id != keeper.event_id
on conflict (event_id, person_id) do nothing;

-- Step 3: Reassign BP_ResourceLinks from duplicates to the keeper
update public."BP_ResourceLinks" rl
set event_id = keeper.event_id
from public."BP_Events" dup
join public."BP_Events" keeper
  on keeper.name = dup.name
  and keeper.place_id = dup.place_id
  and keeper.event_id < dup.event_id
where rl.event_id = dup.event_id
  and dup.event_id != keeper.event_id;

-- Step 4: Reassign BP_SourceFigures from duplicates to the keeper
update public."BP_SourceFigures" sf
set event_id = keeper.event_id
from public."BP_Events" dup
join public."BP_Events" keeper
  on keeper.name = dup.name
  and keeper.place_id = dup.place_id
  and keeper.event_id < dup.event_id
where sf.event_id = dup.event_id
  and dup.event_id != keeper.event_id;

-- Step 5: Delete the duplicate events (CASCADE will clean up any remaining FKs)
delete from public."BP_Events" dup
using public."BP_Events" keeper
where dup.name = keeper.name
  and dup.place_id is not null
  and dup.place_id = keeper.place_id
  and dup.event_id > keeper.event_id;

commit;
