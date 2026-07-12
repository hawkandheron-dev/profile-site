-- Tighten ws_is_admin(): only signed-in users may execute it.
-- authenticated keeps EXECUTE because the "Admins full access" RLS policies
-- evaluate it as the querying role.
-- (Applied to the live project via MCP on 2026-07-11; kept here for the record
-- and for fresh environments.)
revoke execute on function public.ws_is_admin() from public, anon;
grant execute on function public.ws_is_admin() to authenticated;
