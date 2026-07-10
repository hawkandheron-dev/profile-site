-- Schedule the worship-reminder edge function for Saturday mornings.
-- 13:00 UTC = 9am EDT / 8am EST — "the morning before" for a Sunday service.
--
-- The function URL and anon key are read from Supabase Vault so no secrets
-- live in this file. One-time setup (SQL editor or via MCP):
--   select vault.create_secret('https://<project-ref>.supabase.co/functions/v1', 'worship_functions_url');
--   select vault.create_secret('<anon-key>', 'worship_anon_key');

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

do $$
begin
  perform cron.unschedule('worship-saturday-reminder');
exception when others then
  null; -- job didn't exist yet
end;
$$;

select cron.schedule(
  'worship-saturday-reminder',
  '0 13 * * 6',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'worship_functions_url') || '/worship-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'worship_anon_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
