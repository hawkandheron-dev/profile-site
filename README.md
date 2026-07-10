# windhover-site

A multi-part project that combines a personal profile site, interactive history products, and supporting data infrastructure.

## What this repository contains

This repo is split into a few major areas that serve different purposes:

- **Root static site (`/`)**: public-facing HTML pages (profile, about, design system, church history, pantheons) plus shared CSS/JS.
- **`timeline-scratch/`**: the main React + Vite application for timeline/map experiences, integrated with Clerk auth and Supabase data.
- **`pantheon-db/`**: a Next.js + Prisma Pantheons app that can run against Supabase (shared remote data) and also supports a local SQLite workflow.
- **`supabase/`**: Supabase config and SQL migrations for schema, policies, and seed data.
- **`worship/`**: standalone worship-scheduler admin app (Vite + React) with its own separate Supabase project — see `docs/worship-scheduler.md`.
- **`functions/`**: Cloudflare Pages Functions used to provide runtime config for deployed static pages.

If you are new to the repo, start with this file, then use `docs/REPO_MAP.md` for a deeper directory-level map.

## Quick start by project

### 1) Root static site

Use this when you want to edit the portfolio-style pages and vanilla JS experiences.

Key files:

- `index.html`, `about.html`, `design-system.html`, `pantheons.html`, `pantheons-supabase.html`, `church-history-supabase.html`
- Shared styling/scripts: `style.css`, `supabase.css`, `site.js`, `supabase-app.js`, `church-history-app.js`
- Runtime config fallback: `supabase-config.js`

### 2) `timeline-scratch/` (main interactive app)

Use this when you are working on the current timeline/map UI, notes, suggestions, favorites, and Supabase-backed content.

```bash
cd timeline-scratch
npm install
npm run dev
```

Useful scripts:

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run lint` — run ESLint

### 3) `pantheon-db/` (Next.js + Prisma, Supabase + SQLite workflows)

Use this when you are working on the Pantheon database app and its API routes. The project supports Supabase-backed data in the broader repo, while this subproject also includes a local SQLite path for standalone development.

```bash
cd pantheon-db
npm install
npm run dev
```

Useful scripts:

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run lint` — run ESLint

## Environment setup

### `timeline-scratch/.env`

Copy from `timeline-scratch/.env.example` and fill in:

```env
VITE_CLERK_PUBLISHABLE_KEY="<CLERK_PUBLISHABLE_KEY>"
VITE_SUPABASE_URL="<SUPABASE_URL>"
VITE_SUPABASE_ANON_KEY="<SUPABASE_ANON_PUBLIC_KEY>"
VITE_ENABLE_DEBUG="true" # optional
```

### Clerk (authentication)

1. Create a Clerk app at [clerk.com](https://clerk.com)
2. Get your **Publishable Key** from Dashboard → API Keys
3. Set `VITE_CLERK_PUBLISHABLE_KEY`

### Supabase (database)

1. Create a project at [supabase.com](https://supabase.com)
2. Get **Project URL** and **anon public key** from Settings → API
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Required RLS policy example

RLS should be enabled for user-owned favorites data:

```sql
-- Enable RLS
ALTER TABLE era_favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY "Users read own favorites"
  ON era_favorites FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Users can insert their own favorites
CREATE POLICY "Users insert own favorites"
  ON era_favorites FOR INSERT
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- Users can delete their own favorites
CREATE POLICY "Users delete own favorites"
  ON era_favorites FOR DELETE
  USING (clerk_user_id = auth.jwt() ->> 'sub');
```

## Build and deployment notes

- Root-level `npm run build` currently builds the Vite app in `timeline-scratch/`.
- Static pages are intended for Cloudflare Pages deployment.
- `functions/api/supabase-config.js` can expose runtime env values for deployed static pages.

## Where to look for common work

- **UI components / timeline behavior**: `timeline-scratch/src/components/`
- **Supabase client + services**: `timeline-scratch/src/lib/` and `timeline-scratch/src/services/`
- **Data migrations / RLS / seed SQL**: `supabase/migrations/`
- **Pantheon schema/API and data access**: `pantheon-db/prisma/` and `pantheon-db/src/app/api/` (plus Supabase-related flows in root pages and `supabase/` migrations)
- **Static content and styling**: root HTML/CSS/JS files

## Project intent (the “why”)

This codebase supports two parallel goals:

1. **Public storytelling experience** — interactive historical content presented through timelines, maps, and curated pages.
2. **Structured historical data platform** — backend data models and APIs (Supabase-first, with local SQLite support in `pantheon-db`) that make the content editable, queryable, and extensible over time.

That split explains why this repo contains both:

- lightweight static pages for immediate presentation, and
- app/database projects for richer data-driven features.

## Related docs

- `docs/REPO_MAP.md` — detailed architecture and folder map
- `docs/data-upload.md` — data upload process
- `docs/bible-atlas-enrichment-plan.md` — data enrichment plan

## Security reminder

- Never commit real secrets.
- Keep local credentials in `.env` files.
- Treat API keys as sensitive even when marked “public/anon”.
