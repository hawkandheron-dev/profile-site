#!/usr/bin/env node
/**
 * Generates the CH_ seed SQL migration from the church history JS data files.
 * Uses batched multi-row INSERTs to avoid Supabase CLI prepared-statement issues.
 *
 * Usage: node scripts/generate-seed-sql.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Load raw data by evaluating the JS source ────────────────────────────
const chDataSrc = readFileSync(
  join(ROOT, 'timeline-scratch/src/data/churchHistoryData.js'),
  'utf-8'
);
const worksSrc = readFileSync(
  join(ROOT, 'timeline-scratch/src/data/works.js'),
  'utf-8'
);

function extractRawData(src) {
  const match = src.match(/const rawData\s*=\s*(\{[\s\S]*?\n\});/);
  if (!match) throw new Error('Could not find rawData in churchHistoryData.js');
  return new Function(`return ${match[1]}`)();
}

function extractConnections(src) {
  const match = src.match(/const knownConnections\s*=\s*(\[[\s\S]*?\n\]);/);
  if (!match) throw new Error('Could not find knownConnections');
  return new Function(`return ${match[1]}`)();
}

function extractSources(src) {
  const match = src.match(/const sources\s*=\s*(\[[\s\S]*?\n\]);/);
  if (!match) throw new Error('Could not find sources');
  return new Function(`return ${match[1]}`)();
}

function extractEraColorMap(src) {
  const match = src.match(/const eraColorMap\s*=\s*(\{[\s\S]*?\n\});/);
  if (!match) throw new Error('Could not find eraColorMap');
  return new Function(`return ${match[1]}`)();
}

function extractEraInfoMap(src) {
  const match = src.match(/const eraInfoMap\s*=\s*(\{[\s\S]*?\n\});/);
  if (!match) throw new Error('Could not find eraInfoMap');
  return new Function(`return ${match[1]}`)();
}

function extractWorks(src) {
  const match = src.match(/export const works\s*=\s*(\[[\s\S]*?\n\]);/);
  if (!match) throw new Error('Could not find works array');
  return new Function(`return ${match[1]}`)();
}

const rawData = extractRawData(chDataSrc);
const knownConnections = extractConnections(chDataSrc);
const sources = extractSources(chDataSrc);
const eraColorMap = extractEraColorMap(chDataSrc);
const eraInfoMap = extractEraInfoMap(chDataSrc);
const worksData = extractWorks(worksSrc);

// ── Helpers ────────────────────────────────────────────────────────────────

function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escOrNull(str) {
  if (str === null || str === undefined || str === '') return 'NULL';
  return esc(str);
}

function parseYear(dateStr) {
  if (!dateStr) return null;
  return parseInt(dateStr.substring(0, 5), 10);
}

function getEraForDate(dateStr) {
  const year = parseInt(dateStr.substring(0, 4), 10);
  if (year < 100) return 'era-apostolic';
  if (year < 325) return 'era-ante-nicene';
  if (year < 451) return 'era-first-four-councils';
  if (year < 1000) return 'era-monks-missionaries';
  if (year < 1300) return 'era-scholastics';
  if (year < 1500) return 'era-proto-reformers';
  if (year < 1650) return 'era-reformers';
  return 'era-dissent-discovery';
}

/** Emit a batched multi-row INSERT. */
function batchInsert(tableName, columns, rows) {
  if (!rows.length) return '';
  const colList = columns.join(', ');
  const valueLines = rows.map(r => `  (${r.join(', ')})`).join(',\n');
  return `INSERT INTO public."${tableName}" (${colList}) VALUES\n${valueLines}\nON CONFLICT DO NOTHING;\n`;
}

// ── Build author name → person_id map ─────────────────────────────────────
const nameToId = new Map();
rawData.items.forEach(item => {
  if (item.group === 'people' || item.group === 'roman-emperors') {
    nameToId.set(item.content.toLowerCase(), item.id);
  }
});
const aliases = {
  'augustine of hippo': 'augustine',
  'gregory thaumaturgus': 'gregory-thaumaturgus',
  'basil the great': 'basil-great',
  'ambrose of milan': 'ambrose-milan',
  'benedict of nursia': 'benedict-nursia',
  'pope gregory the great': 'pope-gregory-great',
  'isidore of seville': 'isidore-seville',
  'maximus the confessor': 'maximus-confessor',
  'the venerable bede': 'bede',
  'beatus of liebana': 'beatus-liebana',
  'paulinus ii of aquileia': 'paulinus-aquileia',
  'alcuin of york': 'alcuin-york',
  'rabanus maurus': 'rabanus-maurus',
  'kassia of byzantium': 'kassia-byzantium',
  'john scotus eriugena': 'john-scotus-eriugena',
  'photios i of constantinople': 'photios-constantinople',
  'dhuoda of uzes': 'dhuoda-uzes',
  'cyril and methodius': 'cyril-methodius',
  'remigius of auxerre': 'remigius-auxerre',
  'odo of cluny': 'odo-cluny',
  'sylvester ii / gerbert of aurillac': 'sylvester-ii',
  'anselm of laon': 'anselm-laon',
  'hildegard of bingen': 'hildegard-bingen',
  'bernard of clairvaux': 'bernard-clairvaux',
  'william of auxerre': 'william-auxerre',
  'francis of assisi': 'francis-assisi',
  'robert grosseteste': 'robert-grosseteste',
  'nicephorus blemmydes': 'nicephorus-blemmydes',
  'william of moerbeke': 'william-moerbeke',
  'thomas aquinas': 'thomas-aquinas',
  'duns scotus': 'duns-scotus',
  'dante alighieri': 'dante-alighieri',
  'thomas bradwardine': 'thomas-bradwardine',
  'john wycliffe': 'john-wycliffe',
  'julian of norwich': 'julian-norwich',
  'christine de pisan': 'christine-pisan',
  'jan hus': 'jan-hus',
  'thomas a kempis': 'thomas-kempis',
  'nicholas of cusa': 'nicholas-cusa',
  'desiderius erasmus': 'desiderius-erasmus',
  'nicholas copernicus': 'nicholas-copernicus',
  'bartolome de las casas': 'bartolome-las-casas',
  'thomas more': 'thomas-more',
  'martin luther': 'martin-luther',
  'huldrych zwingli': 'huldrych-zwingli',
  'ignatius of loyola': 'ignatius-loyola',
  'peter faber': 'peter-faber',
  'francis xavier': 'francis-xavier',
  'john calvin': 'john-calvin',
  'teresa of avila': 'teresa-avila',
  'john of the cross': 'john-cross',
  'william bradford': 'william-bradford',
  'john owen': 'john-owen',
  'john bunyan': 'john-bunyan',
  'thomas traherne': 'thomas-traherne',
  'sir isaac newton': 'isaac-newton',
  'charles wesley': 'charles-wesley',
  'john wesley': 'john-wesley',
  'george whitefield': 'george-whitefield',
  'pope damasus i': 'pope-damasus-1',
  'pope cornelius': 'pope-cornelius',
  'pope stephen i': 'pope-stephen-1',
  'leander of seville': 'leander-seville',
  'pope martin i': 'pope-martin-1',
  'pope gregory ii': 'pope-gregory-ii',
  'prosper of aquitaine': 'prosper-aquitaine',
  'pope leo i': 'pope-leo-1',
  'faustus of riez': 'faustus-riez',
  'claudianus mamertus': 'claudianus-mamertus',
  'pope simplicius': 'pope-simplicius',
  'caesarius of arles': 'caesarius-arles',
  'clement of rome': 'clement-rome',
  'ignatius of antioch': 'ignatius-antioch',
  'justin martyr': 'justin-martyr',
  'clement of alexandria': 'clement-alexandria',
  'irenaeus of lyons': 'irenaeus',
  'hippolytus of rome': 'hippolytus',
  'dionysius of alexandria': 'dionysius-alexandria',
  'alexander of alexandria': 'alexander-alexandria',
  'gregory of nazianzus': 'gregory-nazianzus',
  'gregory of nyssa': 'gregory-nyssa',
  'john chrysostom': 'john-chrysostom',
  'rufinus of aquileia': 'rufinus-aquileia',
  'theophilus of alexandria': 'theophilus-alexandria',
  'cyril of alexandria': 'cyril-alexandria',
  'didymus the blind': 'didymus-blind',
  'papias of hieropolis': 'papias',
  'john the evangelist': 'john-evangelist',
  'tatian': 'tatians',
};
for (const [alias, id] of Object.entries(aliases)) {
  nameToId.set(alias, id);
}

function lookupPersonId(authorName) {
  return nameToId.get(authorName.toLowerCase()) || null;
}

// ── Generate SQL ──────────────────────────────────────────────────────────

const parts = [];

parts.push('-- Seed data for Church History tables (CH_ prefix).');
parts.push('-- Generated from timeline-scratch/src/data/churchHistoryData.js and works.js');
parts.push('-- Uses batched multi-row INSERTs for Supabase CLI compatibility.');
parts.push('');
parts.push('begin;');
parts.push('');

// ── 1. CH_Eras ────────────────────────────────────────────────────────────
parts.push('-- ── CH_Eras ────────────────────────────────────────────────────────────');
const eraRows = [];
const eraItems = rawData.items.filter(i => i.group === 'eras');
eraItems.forEach(era => {
  const info = eraInfoMap[era.id] || {};
  const color = eraColorMap[era.id] || null;
  eraRows.push([
    esc(era.id), esc(era.content),
    info.start || parseYear(era.start), info.end || parseYear(era.end),
    escOrNull(color), 'NULL'
  ]);
});
parts.push(batchInsert('CH_Eras', ['era_id', 'name', 'start_year', 'end_year', 'color', 'description'], eraRows));

// ── 2. CH_People ──────────────────────────────────────────────────────────
parts.push('-- ── CH_People ──────────────────────────────────────────────────────────');
const peopleRows = [];
rawData.items.filter(i => i.group === 'people').forEach(p => {
  const eraId = getEraForDate(p.start);
  const birthYear = parseYear(p.start);
  const deathYear = p.end ? parseYear(p.end) : 'NULL';
  peopleRows.push([
    esc(p.id), esc(p.content), escOrNull(p.start), escOrNull(p.end),
    birthYear, deathYear, escOrNull(p.location), "'person'", esc(eraId), 'false'
  ]);
});
rawData.items.filter(i => i.group === 'roman-emperors').forEach(e => {
  const startYear = parseYear(e.start);
  const endYear = e.end ? parseYear(e.end) : 'NULL';
  peopleRows.push([
    esc(e.id), esc(e.content), escOrNull(e.start), escOrNull(e.end),
    startYear, endYear, escOrNull(e.location), "'emperor'", 'NULL', 'true'
  ]);
});
parts.push(batchInsert('CH_People',
  ['person_id', 'name', 'birth_date', 'death_date', 'birth_year', 'death_year', 'location', 'role_type', 'era_id', 'is_monarch'],
  peopleRows));

// ── 3. CH_Events ──────────────────────────────────────────────────────────
parts.push('-- ── CH_Events ──────────────────────────────────────────────────────────');
const eventRows = [];
['councils', 'documents', 'events'].forEach(group => {
  const eventType = group === 'councils' ? 'council' : group === 'documents' ? 'document' : 'event';
  rawData.items.filter(i => i.group === group).forEach(ev => {
    eventRows.push([
      esc(ev.id), esc(ev.content), esc(eventType),
      escOrNull(ev.start), escOrNull(ev.end), escOrNull(ev.location), 'NULL'
    ]);
  });
});
parts.push(batchInsert('CH_Events',
  ['event_id', 'name', 'event_type', 'event_date', 'end_date', 'location', 'description'],
  eventRows));

// ── 4. CH_Connections ─────────────────────────────────────────────────────
parts.push('-- ── CH_Connections ─────────────────────────────────────────────────────');
const connRows = [];
knownConnections.forEach(conn => {
  const ppl = conn.people || [];
  const type = conn.type || 'known';
  for (let i = 0; i < ppl.length; i++) {
    for (let j = i + 1; j < ppl.length; j++) {
      connRows.push([esc(ppl[i]), esc(ppl[j]), esc(type)]);
    }
  }
});
parts.push(batchInsert('CH_Connections',
  ['person_id_1', 'person_id_2', 'connection_type'],
  connRows));

// ── 5. CH_Sources ─────────────────────────────────────────────────────────
parts.push('-- ── CH_Sources ─────────────────────────────────────────────────────────');
const srcRows = [];
sources.forEach(s => {
  srcRows.push([
    esc(s.id), esc(s.title), escOrNull(s.source),
    escOrNull(s.year), escOrNull(s.url), escOrNull(s.notes)
  ]);
});
parts.push(batchInsert('CH_Sources',
  ['source_id', 'title', 'source_name', 'year', 'url', 'notes'],
  srcRows));

// ── 6. CH_Source_Figures ──────────────────────────────────────────────────
parts.push('-- ── CH_Source_Figures ──────────────────────────────────────────────────');
const sfRows = [];
sources.forEach(s => {
  if (!s.figures || !s.figures.length) return;
  s.figures.forEach(figId => {
    const isPerson = rawData.items.some(i => i.id === figId && (i.group === 'people' || i.group === 'roman-emperors'));
    const isEvent = rawData.items.some(i => i.id === figId && (i.group === 'councils' || i.group === 'documents' || i.group === 'events'));
    if (isPerson) {
      sfRows.push([esc(s.id), esc(figId), 'NULL']);
    } else if (isEvent) {
      sfRows.push([esc(s.id), 'NULL', esc(figId)]);
    } else {
      sfRows.push([esc(s.id), esc(figId), 'NULL']);
    }
  });
});
parts.push(batchInsert('CH_Source_Figures',
  ['source_id', 'person_id', 'event_id'],
  sfRows));

// ── 7. CH_Works ───────────────────────────────────────────────────────────
parts.push('-- ── CH_Works ───────────────────────────────────────────────────────────');
const workRows = [];
const unmapped = new Set();
worksData.forEach(work => {
  work.authors.forEach(author => {
    const pid = lookupPersonId(author);
    if (!pid) unmapped.add(author);
    workRows.push([pid ? esc(pid) : 'NULL', esc(work.name), escOrNull(work.textUrl)]);
  });
});
parts.push(batchInsert('CH_Works', ['person_id', 'name', 'text_url'], workRows));

if (unmapped.size > 0) {
  console.error('Unmapped authors:', [...unmapped].sort());
}

parts.push('commit;');
parts.push('');

// ── Write output ──────────────────────────────────────────────────────────
const outPath = join(ROOT, 'supabase/migrations/20260131121000_seed_ch_data.sql');
writeFileSync(outPath, parts.join('\n'), 'utf-8');
const lineCount = parts.join('\n').split('\n').length;
console.log(`Wrote ${lineCount} lines to ${outPath}`);
