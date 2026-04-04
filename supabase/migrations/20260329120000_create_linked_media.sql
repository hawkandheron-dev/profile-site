-- Create general-purpose linked media table for images/media attached to any entity
-- Initial use: tour scene images for the Getting Started tour

CREATE TABLE "CH_LinkedMedia" (
  media_id        text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  entity_type     text NOT NULL,          -- 'tour_scene', 'person', 'event', etc.
  entity_id       text NOT NULL,          -- references the target entity's ID
  media_url       text NOT NULL,          -- direct image URL
  source_page_url text,                   -- original source page (Wikipedia, etc.)
  alt_text        text,                   -- accessibility description
  attribution     text,                   -- credit / license info
  -- Viewport crop metadata (CSS object-position percentages)
  crop_position_x integer NOT NULL DEFAULT 50,  -- 0–100, horizontal center
  crop_position_y integer NOT NULL DEFAULT 50,  -- 0–100, vertical center
  crop_scale      real NOT NULL DEFAULT 1.0,    -- 1.0 = fit, >1 = zoom in
  sort_order      integer NOT NULL DEFAULT 0,   -- for multiple images per entity
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Fast lookups by entity
CREATE INDEX idx_linked_media_entity ON "CH_LinkedMedia" (entity_type, entity_id);

-- Row-level security
ALTER TABLE "CH_LinkedMedia" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read linked media"
  ON "CH_LinkedMedia" FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert linked media"
  ON "CH_LinkedMedia" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update linked media"
  ON "CH_LinkedMedia" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete linked media"
  ON "CH_LinkedMedia" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        AND role = 'admin'
    )
  );

-- Seed tour scene images
-- Using Wikimedia Commons Special:FilePath redirect URLs (stable, officially supported)
INSERT INTO "CH_LinkedMedia" (entity_type, entity_id, media_url, source_page_url, alt_text, attribution, crop_position_x, crop_position_y) VALUES
  (
    'tour_scene', 'jesus',
    'https://commons.wikimedia.org/wiki/Special:FilePath/ChristPeterPaul_detail.jpg',
    'https://commons.wikimedia.org/wiki/File:ChristPeterPaul_detail.jpg',
    'Christ fresco from the Catacombs of Saints Marcellinus and Peter, Rome',
    'Public domain, Wikimedia Commons',
    50, 50
  ),
  (
    'tour_scene', 'john',
    'https://commons.wikimedia.org/wiki/Special:FilePath/Codexaureus_25.jpg',
    'https://en.wikipedia.org/wiki/John_the_Evangelist#/media/File:Codexaureus_25.jpg',
    'John the Evangelist from the Codex Aureus of Lorsch',
    'Public domain, Wikimedia Commons',
    50, 50
  ),
  (
    'tour_scene', 'polycarp',
    'https://commons.wikimedia.org/wiki/Special:FilePath/Polycarp_of_Smyrna2.jpg',
    'https://en.wikipedia.org/wiki/Polycarp#/media/File:Polycarp_of_Smyrna2.jpg',
    'Polycarp of Smyrna',
    'Public domain, Wikimedia Commons',
    50, 50
  ),
  (
    'tour_scene', 'irenaeus',
    'https://commons.wikimedia.org/wiki/Special:FilePath/Saint_irenee_saint_irenee.jpg',
    'https://en.wikipedia.org/wiki/Irenaeus#/media/File:Saint_irenee_saint_irenee.jpg',
    'Saint Irenaeus of Lyon',
    'Public domain, Wikimedia Commons',
    50, 20  -- top third, centered on head (tall image)
  );
