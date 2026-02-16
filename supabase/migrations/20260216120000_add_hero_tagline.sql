-- Update hero title to "Windhover" and add tagline below it
-- The <h1> now uses data-content-key="home.hero_title"

-- Update existing hero_title from "The Mews" to "Windhover"
update public.site_content
  set content = '"Windhover"'
  where key = 'home.hero_title';

-- Add the tagline row
insert into public.site_content (key, page, content_type, content, sort_order) values
  ('home.hero_tagline', 'home', 'plain_text', '"Get a bird''s eye view"', 1)
on conflict (key) do nothing;
