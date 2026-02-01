#!/usr/bin/env node
/**
 * Generates the CH_ seed SQL migration from the church history JS data files.
 * Usage: node scripts/generate-seed-sql.mjs > supabase/migrations/20260131121000_seed_ch_data.sql
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Load raw data by evaluating the JS source ────────────────────────────
// We can't import the files directly because they use browser-style exports.
// Instead, extract the data structures with a light eval approach.

const chDataSrc = readFileSync(
  join(ROOT, 'timeline-scratch/src/data/churchHistoryData.js'),
  'utf-8'
);

const worksSrc = readFileSync(
  join(ROOT, 'timeline-scratch/src/data/works.js'),
  'utf-8'
);

// Extract rawData object
function extractRawData(src) {
  // Find the rawData assignment and eval it
  const match = src.match(/const rawData\s*=\s*(\{[\s\S]*?\n\});/);
  if (!match) throw new Error('Could not find rawData in churchHistoryData.js');
  return new Function(`return ${match[1]}`)();
}

// Extract knownConnections array
function extractConnections(src) {
  const match = src.match(/const knownConnections\s*=\s*(\[[\s\S]*?\n\]);/);
  if (!match) throw new Error('Could not find knownConnections');
  return new Function(`return ${match[1]}`)();
}

// Extract sources array
function extractSources(src) {
  const match = src.match(/const sources\s*=\s*(\[[\s\S]*?\n\]);/);
  if (!match) throw new Error('Could not find sources');
  return new Function(`return ${match[1]}`)();
}

// Extract eraColorMap
function extractEraColorMap(src) {
  const match = src.match(/const eraColorMap\s*=\s*(\{[\s\S]*?\n\});/);
  if (!match) throw new Error('Could not find eraColorMap');
  return new Function(`return ${match[1]}`)();
}

// Extract eraInfoMap
function extractEraInfoMap(src) {
  const match = src.match(/const eraInfoMap\s*=\s*(\{[\s\S]*?\n\});/);
  if (!match) throw new Error('Could not find eraInfoMap');
  return new Function(`return ${match[1]}`)();
}

// Extract works array from works.js
function extractWorks(src) {
  // Remove the export keyword and the worksByAuthor/getWorksForAuthor stuff
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
  const year = parseInt(dateStr.substring(0, 5), 10);
  return year;
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

// ── Build author name → person_id map ─────────────────────────────────────
const nameToId = new Map();
rawData.items.forEach(item => {
  if (item.group === 'people' || item.group === 'roman-emperors') {
    nameToId.set(item.content.toLowerCase(), item.id);
  }
});
// Handle special cases where works.js uses slightly different names
nameToId.set('augustine of hippo', 'augustine');
nameToId.set('gregory thaumaturgus', 'gregory-thaumaturgus');
nameToId.set('basil the great', 'basil-great');
nameToId.set('ambrose of milan', 'ambrose-milan');
nameToId.set('benedict of nursia', 'benedict-nursia');
nameToId.set('pope gregory the great', 'pope-gregory-great');
nameToId.set('isidore of seville', 'isidore-seville');
nameToId.set('maximus the confessor', 'maximus-confessor');
nameToId.set('the venerable bede', 'bede');
nameToId.set('beatus of liebana', 'beatus-liebana');
nameToId.set('paulinus ii of aquileia', 'paulinus-aquileia');
nameToId.set('alcuin of york', 'alcuin-york');
nameToId.set('rabanus maurus', 'rabanus-maurus');
nameToId.set('kassia of byzantium', 'kassia-byzantium');
nameToId.set('john scotus eriugena', 'john-scotus-eriugena');
nameToId.set('photios i of constantinople', 'photios-constantinople');
nameToId.set('dhuoda of uzes', 'dhuoda-uzes');
nameToId.set('cyril and methodius', 'cyril-methodius');
nameToId.set('remigius of auxerre', 'remigius-auxerre');
nameToId.set('odo of cluny', 'odo-cluny');
nameToId.set('sylvester ii / gerbert of aurillac', 'sylvester-ii');
nameToId.set('anselm of laon', 'anselm-laon');
nameToId.set('hildegard of bingen', 'hildegard-bingen');
nameToId.set('bernard of clairvaux', 'bernard-clairvaux');
nameToId.set('william of auxerre', 'william-auxerre');
nameToId.set('francis of assisi', 'francis-assisi');
nameToId.set('robert grosseteste', 'robert-grosseteste');
nameToId.set('nicephorus blemmydes', 'nicephorus-blemmydes');
nameToId.set('william of moerbeke', 'william-moerbeke');
nameToId.set('thomas aquinas', 'thomas-aquinas');
nameToId.set('duns scotus', 'duns-scotus');
nameToId.set('dante alighieri', 'dante-alighieri');
nameToId.set('thomas bradwardine', 'thomas-bradwardine');
nameToId.set('john wycliffe', 'john-wycliffe');
nameToId.set('julian of norwich', 'julian-norwich');
nameToId.set('christine de pisan', 'christine-pisan');
nameToId.set('jan hus', 'jan-hus');
nameToId.set('thomas a kempis', 'thomas-kempis');
nameToId.set('nicholas of cusa', 'nicholas-cusa');
nameToId.set('desiderius erasmus', 'desiderius-erasmus');
nameToId.set('nicholas copernicus', 'nicholas-copernicus');
nameToId.set('bartolome de las casas', 'bartolome-las-casas');
nameToId.set('thomas more', 'thomas-more');
nameToId.set('martin luther', 'martin-luther');
nameToId.set('huldrych zwingli', 'huldrych-zwingli');
nameToId.set('ignatius of loyola', 'ignatius-loyola');
nameToId.set('peter faber', 'peter-faber');
nameToId.set('francis xavier', 'francis-xavier');
nameToId.set('john calvin', 'john-calvin');
nameToId.set('teresa of avila', 'teresa-avila');
nameToId.set('john of the cross', 'john-cross');
nameToId.set('william bradford', 'william-bradford');
nameToId.set('john owen', 'john-owen');
nameToId.set('john bunyan', 'john-bunyan');
nameToId.set('thomas traherne', 'thomas-traherne');
nameToId.set('sir isaac newton', 'isaac-newton');
nameToId.set('charles wesley', 'charles-wesley');
nameToId.set('john wesley', 'john-wesley');
nameToId.set('george whitefield', 'george-whitefield');
nameToId.set('pope damasus i', 'pope-damasus-1');
nameToId.set('pope cornelius', 'pope-cornelius');
nameToId.set('pope stephen i', 'pope-stephen-1');
nameToId.set('leander of seville', 'leander-seville');
nameToId.set('pope martin i', 'pope-martin-1');
nameToId.set('pope gregory ii', 'pope-gregory-ii');
nameToId.set('prosper of aquitaine', 'prosper-aquitaine');
nameToId.set('pope leo i', 'pope-leo-1');
nameToId.set('faustus of riez', 'faustus-riez');
nameToId.set('claudianus mamertus', 'claudianus-mamertus');
nameToId.set('pope simplicius', 'pope-simplicius');
nameToId.set('caesarius of arles', 'caesarius-arles');
nameToId.set('clement of rome', 'clement-rome');
nameToId.set('ignatius of antioch', 'ignatius-antioch');
nameToId.set('justin martyr', 'justin-martyr');
nameToId.set('clement of alexandria', 'clement-alexandria');
nameToId.set('irenaeus of lyons', 'irenaeus');
nameToId.set('hippolytus of rome', 'hippolytus');
nameToId.set('dionysius of alexandria', 'dionysius-alexandria');
nameToId.set('alexander of alexandria', 'alexander-alexandria');
nameToId.set('gregory of nazianzus', 'gregory-nazianzus');
nameToId.set('gregory of nyssa', 'gregory-nyssa');
nameToId.set('john chrysostom', 'john-chrysostom');
nameToId.set('rufinus of aquileia', 'rufinus-aquileia');
nameToId.set('theophilus of alexandria', 'theophilus-alexandria');
nameToId.set('cyril of alexandria', 'cyril-alexandria');
nameToId.set('didymus the blind', 'didymus-blind');
nameToId.set('papias of hieropolis', 'papias');
nameToId.set('john the evangelist', 'john-evangelist');
nameToId.set('tatian', 'tatians');

function lookupPersonId(authorName) {
  const key = authorName.toLowerCase();
  return nameToId.get(key) || null;
}

// ── Generate SQL ──────────────────────────────────────────────────────────

const lines = [];
function emit(s) { lines.push(s); }

emit('-- Seed data for Church History tables (CH_ prefix).');
emit('-- Generated from timeline-scratch/src/data/churchHistoryData.js and works.js');
emit('');
emit('begin;');
emit('');

// ── 1. CH_Eras ────────────────────────────────────────────────────────────
emit('-- ── CH_Eras ────────────────────────────────────────────────────────────');
const eraItems = rawData.items.filter(i => i.group === 'eras');
eraItems.forEach(era => {
  const info = eraInfoMap[era.id] || {};
  const color = eraColorMap[era.id] || null;
  emit(`INSERT INTO public."CH_Eras" (era_id, name, start_year, end_year, color, description) VALUES (${esc(era.id)}, ${esc(era.content)}, ${info.start || parseYear(era.start)}, ${info.end || parseYear(era.end)}, ${escOrNull(color)}, NULL);`);
});
// Note: era-cluniac-reforms is in items but not eraInfoMap; it's handled above via the items loop.
emit('');

// ── 2. CH_People ──────────────────────────────────────────────────────────
emit('-- ── CH_People ──────────────────────────────────────────────────────────');
const people = rawData.items.filter(i => i.group === 'people');
people.forEach(p => {
  const eraId = getEraForDate(p.start);
  const birthYear = parseYear(p.start);
  const deathYear = p.end ? parseYear(p.end) : null;
  emit(`INSERT INTO public."CH_People" (person_id, name, birth_date, death_date, birth_year, death_year, location, role_type, era_id, is_emperor) VALUES (${esc(p.id)}, ${esc(p.content)}, ${escOrNull(p.start)}, ${escOrNull(p.end)}, ${birthYear}, ${deathYear !== null ? deathYear : 'NULL'}, ${escOrNull(p.location)}, 'person', ${esc(eraId)}, false);`);
});
emit('');

// Roman Emperors
emit('-- Roman Emperors');
const emperors = rawData.items.filter(i => i.group === 'roman-emperors');
emperors.forEach(e => {
  const startYear = parseYear(e.start);
  const endYear = e.end ? parseYear(e.end) : null;
  emit(`INSERT INTO public."CH_People" (person_id, name, birth_date, death_date, birth_year, death_year, location, role_type, era_id, is_emperor) VALUES (${esc(e.id)}, ${esc(e.content)}, ${escOrNull(e.start)}, ${escOrNull(e.end)}, ${startYear}, ${endYear !== null ? endYear : 'NULL'}, ${escOrNull(e.location)}, 'emperor', NULL, true);`);
});
emit('');

// ── 3. CH_Events ──────────────────────────────────────────────────────────
emit('-- ── CH_Events ──────────────────────────────────────────────────────────');
const eventGroups = ['councils', 'documents', 'events'];
eventGroups.forEach(group => {
  const items = rawData.items.filter(i => i.group === group);
  const eventType = group === 'councils' ? 'council' : group === 'documents' ? 'document' : 'event';
  items.forEach(ev => {
    emit(`INSERT INTO public."CH_Events" (event_id, name, event_type, event_date, end_date, location, description) VALUES (${esc(ev.id)}, ${esc(ev.content)}, ${esc(eventType)}, ${escOrNull(ev.start)}, ${escOrNull(ev.end)}, ${escOrNull(ev.location)}, NULL);`);
  });
});
emit('');

// ── 4. CH_Connections ─────────────────────────────────────────────────────
emit('-- ── CH_Connections ─────────────────────────────────────────────────────');
knownConnections.forEach(conn => {
  const ppl = conn.people || [];
  const type = conn.type || 'known';
  for (let i = 0; i < ppl.length; i++) {
    for (let j = i + 1; j < ppl.length; j++) {
      emit(`INSERT INTO public."CH_Connections" (person_id_1, person_id_2, connection_type) VALUES (${esc(ppl[i])}, ${esc(ppl[j])}, ${esc(type)});`);
    }
  }
});
emit('');

// ── 5. CH_Sources ─────────────────────────────────────────────────────────
emit('-- ── CH_Sources ─────────────────────────────────────────────────────────');
sources.forEach(s => {
  emit(`INSERT INTO public."CH_Sources" (source_id, title, source_name, year, url, notes) VALUES (${esc(s.id)}, ${esc(s.title)}, ${escOrNull(s.source)}, ${escOrNull(s.year)}, ${escOrNull(s.url)}, ${escOrNull(s.notes)});`);
});
emit('');

// ── 6. CH_Source_Figures ──────────────────────────────────────────────────
emit('-- ── CH_Source_Figures ──────────────────────────────────────────────────');
sources.forEach(s => {
  if (!s.figures || !s.figures.length) return;
  s.figures.forEach(figId => {
    // Check if it's a person or event
    const isPerson = rawData.items.some(i => i.id === figId && (i.group === 'people' || i.group === 'roman-emperors'));
    const isEvent = rawData.items.some(i => i.id === figId && (i.group === 'councils' || i.group === 'documents' || i.group === 'events'));
    if (isPerson) {
      emit(`INSERT INTO public."CH_Source_Figures" (source_id, person_id, event_id) VALUES (${esc(s.id)}, ${esc(figId)}, NULL);`);
    } else if (isEvent) {
      emit(`INSERT INTO public."CH_Source_Figures" (source_id, person_id, event_id) VALUES (${esc(s.id)}, NULL, ${esc(figId)});`);
    } else {
      emit(`-- WARNING: figure '${figId}' not found in items`);
      emit(`INSERT INTO public."CH_Source_Figures" (source_id, person_id, event_id) VALUES (${esc(s.id)}, ${esc(figId)}, NULL);`);
    }
  });
});
emit('');

// ── 7. CH_Works ───────────────────────────────────────────────────────────
emit('-- ── CH_Works ───────────────────────────────────────────────────────────');
const unmapped = new Set();
worksData.forEach(work => {
  work.authors.forEach(author => {
    const pid = lookupPersonId(author);
    if (!pid) {
      unmapped.add(author);
    }
    emit(`INSERT INTO public."CH_Works" (person_id, name, text_url) VALUES (${pid ? esc(pid) : 'NULL'}, ${esc(work.name)}, ${escOrNull(work.textUrl)});${!pid ? ` -- NOTE: unmapped author '${author}'` : ''}`);
  });
});

if (unmapped.size > 0) {
  console.error('Unmapped authors:', [...unmapped].sort());
}

emit('');
emit('commit;');
emit('');

// ── Write output ──────────────────────────────────────────────────────────
const outPath = join(ROOT, 'supabase/migrations/20260131121000_seed_ch_data.sql');
writeFileSync(outPath, lines.join('\n'), 'utf-8');
console.log(`Wrote ${lines.length} lines to ${outPath}`);
