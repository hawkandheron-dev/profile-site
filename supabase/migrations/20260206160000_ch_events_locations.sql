-- Add locations to CH_Events that are currently missing them.
-- Run after 20260206150000_ch_emperors_monarchs.sql

begin;

-- ── Original seed documents (missing locations) ────────────────────────

UPDATE public."CH_Events" SET location = 'Galatia / Asia Minor'
  WHERE event_id = 'doc-galatians' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Rome'
  WHERE event_id = 'doc-philippians' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Rome'
  WHERE event_id = 'doc-mark' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Rome'
  WHERE event_id = 'doc-clement-epistle' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Syria or Egypt'
  WHERE event_id = 'doc-didache' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Egypt'
  WHERE event_id = 'doc-john-fragment' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Egypt'
  WHERE event_id = 'doc-pauline-p46' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Rome'
  WHERE event_id = 'doc-muratorian' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Egypt'
  WHERE event_id = 'doc-thomas-mentioned' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Alexandria'
  WHERE event_id = 'doc-athanasius-canon' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Iona, Scotland'
  WHERE event_id = 'doc-book-kells' AND location IS NULL;


-- ── Enrichment-era documents that were inserted without locations ────────

UPDATE public."CH_Events" SET location = 'Lyons, Gaul'
  WHERE event_id = 'doc-against-heresies' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Alexandria'
  WHERE event_id = 'doc-on-first-principles' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Hippo Regius'
  WHERE event_id = 'doc-confessions' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Hippo Regius'
  WHERE event_id = 'doc-city-of-god' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Bethlehem'
  WHERE event_id = 'doc-vulgate' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Monte Cassino'
  WHERE event_id = 'doc-rule-benedict' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Jarrow, England'
  WHERE event_id = 'doc-bede-history' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Naples, Italy'
  WHERE event_id = 'doc-summa-theologica' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Italy'
  WHERE event_id = 'doc-divine-comedy' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Norwich, England'
  WHERE event_id = 'doc-revelations-julian' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Zwolle, Netherlands'
  WHERE event_id = 'doc-imitation-christ' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Frauenburg, Poland'
  WHERE event_id = 'doc-de-revolutionibus' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Wittenberg, Germany'
  WHERE event_id = 'doc-95-theses' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Basel / Geneva'
  WHERE event_id = 'doc-institutes' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Bedford, England'
  WHERE event_id = 'doc-pilgrims-progress' AND location IS NULL;


-- ── Events from enrichment migration ────────────────────────────────────

UPDATE public."CH_Events" SET location = 'Jerusalem'
  WHERE event_id = 'event-crucifixion' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Jerusalem'
  WHERE event_id = 'event-pentecost' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Jerusalem'
  WHERE event_id = 'event-council-jerusalem' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Rome'
  WHERE event_id = 'event-fire-rome' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Jerusalem'
  WHERE event_id = 'event-temple-destroyed' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Roman Empire'
  WHERE event_id = 'event-decian-persecution' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Roman Empire'
  WHERE event_id = 'event-diocletian-persecution' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Milan'
  WHERE event_id = 'event-edict-milan' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Rome'
  WHERE event_id = 'event-charlemagne-crowned' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Holy Land'
  WHERE event_id = 'event-first-crusade' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Mainz, Germany'
  WHERE event_id = 'event-printing-press' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Spain'
  WHERE event_id = 'event-spanish-inquisition' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Augsburg, Germany'
  WHERE event_id = 'event-peace-augsburg' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Trent, Italy'
  WHERE event_id = 'event-council-trent' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Plymouth, Massachusetts'
  WHERE event_id = 'event-mayflower' AND location IS NULL;

UPDATE public."CH_Events" SET location = 'Whitby, England'
  WHERE event_id = 'event-synod-whitby' AND location IS NULL;

commit;
