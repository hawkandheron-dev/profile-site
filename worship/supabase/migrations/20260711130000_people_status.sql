-- Replace ws_people.active (boolean) with status: active / inactive / guest.
-- Runs after the seed migration (which still writes `active`), so on a fresh
-- database the sequence schema → seed → cron → this stays valid.

alter table public.ws_people
  add column if not exists status text not null default 'active'
  check (status in ('active', 'inactive', 'guest'));

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ws_people' and column_name = 'active'
  ) then
    update public.ws_people
      set status = case when active then 'active' else 'inactive' end;
    alter table public.ws_people drop column active;
  end if;
end;
$$;
