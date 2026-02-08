-- Rename is_emperor column to is_monarch in CH_People table.
-- This better reflects that the field covers monarchs broadly, not just emperors.

ALTER TABLE public."CH_People"
  RENAME COLUMN is_emperor TO is_monarch;
