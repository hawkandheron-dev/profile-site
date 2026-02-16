-- Add hero tagline to site_content
-- Displayed below the logo on the home page

insert into public.site_content (key, page, content_type, content, sort_order) values
  ('home.hero_tagline', 'home', 'plain_text', '"Get a bird''s eye view"', 1)
on conflict (key) do nothing;
