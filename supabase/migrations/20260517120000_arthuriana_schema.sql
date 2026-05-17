-- Arthuriana: realms, characters, relations, sources

CREATE TABLE IF NOT EXISTS "AR_Realms" (
  realm_id    TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  arc_width   INTEGER NOT NULL DEFAULT 40,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "AR_Characters" (
  character_id       TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  title              TEXT NOT NULL DEFAULT '',
  group_id           TEXT NOT NULL DEFAULT 'other',
  realm_id           TEXT REFERENCES "AR_Realms"(realm_id),
  blazon             JSONB,
  round_table_order  INTEGER
);

CREATE TABLE IF NOT EXISTS "AR_Relations" (
  id             SERIAL PRIMARY KEY,
  from_id        TEXT NOT NULL REFERENCES "AR_Characters"(character_id),
  to_id          TEXT NOT NULL REFERENCES "AR_Characters"(character_id),
  relation_type  TEXT NOT NULL,
  UNIQUE (from_id, to_id, relation_type)
);

CREATE TABLE IF NOT EXISTS "AR_Sources" (
  id            SERIAL PRIMARY KEY,
  character_id  TEXT NOT NULL REFERENCES "AR_Characters"(character_id),
  source        TEXT NOT NULL,
  source_text   TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ar_chars_realm_idx   ON "AR_Characters"(realm_id);
CREATE INDEX IF NOT EXISTS ar_rels_from_idx     ON "AR_Relations"(from_id);
CREATE INDEX IF NOT EXISTS ar_rels_to_idx       ON "AR_Relations"(to_id);
CREATE INDEX IF NOT EXISTS ar_sources_char_idx  ON "AR_Sources"(character_id);
