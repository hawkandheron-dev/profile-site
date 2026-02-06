-- Additional site_content rows: nav links, project metadata, Substack
-- Run after 20260206120000_site_content_and_admin.sql

begin;

-- ── Home page nav links (rendered in the secondary-actions bar) ────────
insert into public.site_content (key, page, content_type, content, sort_order) values
  ('home.nav.church_history', 'home', 'link',
    '{"url": "timeline-scratch/dist/church-history-supabase.html", "label": "Church History Timeline", "description": "Interactive timeline of church history from the Apostolic era to the modern age."}',
    20),
  ('home.nav.about', 'home', 'link',
    '{"url": "about.html", "label": "About", "description": ""}',
    30),
  ('home.nav.substack', 'home', 'link',
    '{"url": "https://postapocalyptic.substack.com/?utm_campaign=hawkandheronmews.com", "label": "Substack", "description": ""}',
    31),
  ('home.nav.image_board', 'home', 'link',
    '{"url": "timeline-scratch/dist/historical-eras.html", "label": "Image Board Timeline", "description": "Visual exploration of historical eras with curated images."}',
    40),
  ('home.nav.pantheons', 'home', 'link',
    '{"url": "pantheons-supabase.html", "label": "Pantheons", "description": "Browse gods, heroes, and monsters from world mythologies."}',
    41)
on conflict (key) do nothing;

-- ── Project page titles & subtitles ────────────────────────────────────
-- These can be consumed by any page that sets data-page to the matching value.
insert into public.site_content (key, page, content_type, content, sort_order) values
  ('church_history.page_title',    'church_history', 'plain_text', '"Church History Timeline"', 0),
  ('church_history.page_subtitle', 'church_history', 'plain_text', '"From the Apostolic era to the modern age"', 1),
  ('image_board.page_title',       'image_board',    'plain_text', '"Image Board Timeline"', 0),
  ('image_board.page_subtitle',    'image_board',    'plain_text', '"Visual exploration of historical eras"', 1),
  ('pantheons.page_title',         'pantheons',      'plain_text', '"Pantheons"', 0),
  ('pantheons.page_subtitle',      'pantheons',      'plain_text', '"Gods, heroes, and monsters from world mythologies"', 1)
on conflict (key) do nothing;

commit;
