-- Update App_Issues status vocabulary
--
-- Before:  open | in_progress | resolved | closed
-- After:   submitted | in_review | on_roadmap | implemented | not_going_to_do
--
-- Mapping for any existing rows:
--   open         → submitted
--   in_progress  → in_review
--   resolved     → implemented
--   closed       → not_going_to_do

begin;

-- Drop the old CHECK constraint (try both possible names from prior create)
alter table public."App_Issues" drop constraint if exists app_issues_status_check;
alter table public."App_Issues" drop constraint if exists "App_Issues_status_check";

-- Migrate existing rows
update public."App_Issues"
set status = case status
  when 'open'        then 'submitted'
  when 'in_progress' then 'in_review'
  when 'resolved'    then 'implemented'
  when 'closed'      then 'not_going_to_do'
  else status
end;

-- New default
alter table public."App_Issues"
  alter column status set default 'submitted';

-- New CHECK
alter table public."App_Issues"
  add constraint app_issues_status_check
  check (status in ('submitted', 'in_review', 'on_roadmap', 'implemented', 'not_going_to_do'));

commit;
