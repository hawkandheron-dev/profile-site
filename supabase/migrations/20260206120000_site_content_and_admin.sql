-- Site Content CMS and Admin Users tables
-- Stores editable page content with type metadata (plain_text, rich_text, link, image)
-- Admin users table gates who can edit content via Clerk JWT

begin;

-- ── admin_users ────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  clerk_user_id text primary key,
  email         text,
  display_name  text,
  created_at    timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Admins can read their own row (used by the frontend to check admin status)
drop policy if exists "Admins can read own record" on public.admin_users;
create policy "Admins can read own record" on public.admin_users
  for select using (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- ── site_content ───────────────────────────────────────────────────────────
-- content_type determines how the frontend renders & edits the value:
--   plain_text  → rendered as text, edited via contenteditable
--   rich_text   → rendered as innerHTML, edited via contenteditable
--   link        → content is JSONB: {"url": "...", "label": "...", "description": "..."}
--   image       → content is JSONB: {"src": "...", "alt": "..."}

create table if not exists public.site_content (
  key          text primary key,
  page         text not null,
  content_type text not null default 'plain_text'
    check (content_type in ('plain_text', 'rich_text', 'link', 'image')),
  content      jsonb not null default '{}',
  sort_order   integer not null default 0,
  updated_at   timestamptz not null default now(),
  updated_by   text
);

create index if not exists site_content_page_idx on public.site_content (page);
create index if not exists site_content_sort_idx on public.site_content (page, sort_order);

-- Auto-update updated_at on change
create or replace function public.set_site_content_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  new.updated_by = current_setting('request.jwt.claims', true)::json->>'sub';
  return new;
end;
$$ language plpgsql;

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_site_content_updated_at();

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.site_content enable row level security;

-- Anyone can read site content (the site needs to render for all visitors)
drop policy if exists "Public read access" on public.site_content;
create policy "Public read access" on public.site_content
  for select using (true);

-- Only admin users can update content
drop policy if exists "Admins can update content" on public.site_content;
create policy "Admins can update content" on public.site_content
  for update using (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Only admin users can insert content (for adding new content blocks)
drop policy if exists "Admins can insert content" on public.site_content;
create policy "Admins can insert content" on public.site_content
  for insert with check (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Only admin users can delete content
drop policy if exists "Admins can delete content" on public.site_content;
create policy "Admins can delete content" on public.site_content
  for delete using (
    exists (
      select 1 from public.admin_users
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ── Seed: Home page content ────────────────────────────────────────────────
insert into public.site_content (key, page, content_type, content, sort_order) values
  ('home.hero_title',       'home', 'plain_text', '"The Mews"', 0),
  ('home.hero_subtitle',    'home', 'plain_text', '"by Hawk & Heron"', 1),
  ('home.hero_description', 'home', 'rich_text',
    '"Welcome to The Mews! Here are a few projects that you may find interesting. If you want, you can sign up and log in to save notes or favorites, or just browse without logging in."',
    2),
  ('home.footer',           'home', 'plain_text', '"© Hawk & Heron"', 10)
on conflict (key) do nothing;

-- ── Seed: About page content ───────────────────────────────────────────────
insert into public.site_content (key, page, content_type, content, sort_order) values
  ('about.profile_name',     'about', 'plain_text', '"Captain"', 0),
  ('about.profile_subtitle', 'about', 'plain_text', '"Profile"', 1),
  ('about.bio',              'about', 'rich_text',  '"Short bio goes here. (We''ll refine this later.)"', 2),
  ('about.projects_heading', 'about', 'plain_text', '"Projects & Links"', 3),
  ('about.link.instagram',   'about', 'link',
    '{"url": "https://www.instagram.com/hawkandheron_co/", "label": "Hawk & Heron on Instagram", "description": "Go here for fun drawings and designs."}',
    10),
  ('about.link.bandcamp',    'about', 'link',
    '{"url": "https://thenewempires.bandcamp.com/", "label": "The New Empires on Bandcamp", "description": "This is my band. We''ve been playing together for 20 years."}',
    11)
on conflict (key) do nothing;

commit;
