-- Remove duplicate rows from BP_PersonPlaces and add a unique constraint
-- to prevent future duplicates.
--
-- Duplicates can occur because the table lacked a unique constraint on
-- (person_id, place_id, narrative_age_id), unlike BP_PersonAges and
-- BP_EventPeople which already had one.

begin;

-- Delete duplicate rows, keeping the one with the lowest id.
-- For rows that share the same (person_id, place_id, narrative_age_id),
-- prefer to keep the row that has scripture_verse populated (if any),
-- otherwise keep the one with the smallest id.
delete from public."BP_PersonPlaces"
where id not in (
  select distinct on (person_id, place_id, coalesce(narrative_age_id, ''))
    id
  from public."BP_PersonPlaces"
  order by person_id, place_id, coalesce(narrative_age_id, ''),
           scripture_verse is null asc,   -- prefer rows WITH scripture_verse
           id asc
);

-- Now add the unique constraint to prevent future duplicates
alter table public."BP_PersonPlaces"
  add constraint "BP_PersonPlaces_unique"
  unique (person_id, place_id, narrative_age_id);

commit;
