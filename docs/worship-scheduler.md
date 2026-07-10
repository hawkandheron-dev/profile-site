# Worship Scheduler

A standalone admin app for scheduling Sunday worship musicians, planning song
sets, and sending day-before reminders. It replaces the musicians-roster
Google Sheet and the songs Airtable.

- **Code**: `worship/` (Vite + React), served at `/apps/worship/` on the
  existing Cloudflare Pages site.
- **Data**: its own Supabase project — completely separate from the windhover
  project. Tables are prefixed `ws_` (schema in `worship/supabase/migrations/`).
- **Auth**: Supabase Auth magic-link email. Access is limited to emails in the
  `ws_admins` table (seeded with matthewlanebrown@gmail.com).

## What it does

- **Roster** — the spreadsheet grid, reborn: people × Sundays, each cell a
  role (Lead, Vocals, Bass, …) or availability (Unavailable/Tentative/Available).
  Plan months ahead; columns for future Sundays are created automatically.
- **Sub-teams** — define a team once (person + role pairs); applying it to a
  Sunday slots everyone in (skipping anyone already marked unavailable), then
  swap individuals as needed.
- **Plan** — per-Sunday song list with liturgical slot (Prelude/Opener/
  Offering/Communion/Closer), order, and key overrides.
- **Songs** — the library: keys, tags, seasons, and **multiple chord-sheet
  links per song** (real key vs capo key, Drive folders).
- **Copy reminder** — one click copies the reminder message + phone list for
  a Sunday (the old spreadsheet formula workflow).
- **Automated reminders** — a scheduled edge function emails everyone
  assigned for tomorrow, every Saturday at 9am ET, with roles, songs, and
  chord links. SMS via Twilio is wired but disabled until credentials exist.

## One-time setup (after the Supabase project exists)

1. **Apply migrations** in `worship/supabase/migrations/` (in filename order).
   Either let the `worship-supabase-migrations.yml` GitHub Action do it on
   merge to main (requires the repo secret below), or apply them via the
   Supabase MCP/SQL editor.
2. **GitHub secret** — `WORSHIP_SUPABASE_DATABASE_URL`: the project's Postgres
   connection string (Settings → Database), used by the migrations workflow.
3. **Cloudflare Pages env vars** — `WORSHIP_SUPABASE_URL` and
   `WORSHIP_SUPABASE_ANON_KEY` (Settings → API). Served to the app at runtime
   by `functions/api/worship-config.js`.
4. **Deploy the edge function** `worship/supabase/functions/worship-reminder/`
   (via Supabase MCP or `supabase functions deploy worship-reminder`).
5. **Function secrets** (Project Settings → Edge Functions):
   - `RESEND_API_KEY` — from [resend.com](https://resend.com); verify a sending
     domain, or use their onboarding sender to start.
   - `REMINDER_FROM_EMAIL` — e.g. `Worship <worship@yourdomain.org>`.
   - Later, for SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`.
6. **Vault secrets for the cron job** (SQL editor):
   ```sql
   select vault.create_secret('https://<project-ref>.supabase.co/functions/v1', 'worship_functions_url');
   select vault.create_secret('<anon-key>', 'worship_anon_key');
   ```
7. **Supabase Auth** — under Authentication → URL Configuration, set the site
   URL to the deployed app URL (e.g. `https://<your-domain>/apps/worship/`)
   so magic links redirect back correctly.

## Local development

```bash
cd worship
cp .env.example .env   # fill in VITE_WORSHIP_SUPABASE_URL / _ANON_KEY
npm install
npm run dev
```

## Data import

The original Google Sheet roster and Airtable exports are checked in under
`worship/data-import/`. `npm run import-data` regenerates the seed migration
(`20260710121000_seed_data.sql`) from them; it is idempotent. Counts at import
time: 31 people, 198 songs, 44 chord links, 31 tags, 302 services
(2022-09 → 2026-11), 2,359 roster assignments, 532 planned songs.

## Later (out of scope for v1)

- Musician-facing portal (self-service availability, confirm/decline) — the
  schema supports it: add person-scoped RLS policies keyed on `ws_people.email`.
- Live Twilio SMS — set the three Twilio secrets and it turns on.
