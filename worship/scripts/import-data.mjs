#!/usr/bin/env node
/**
 * One-time import: Google Sheet roster (xlsx) + Airtable exports (csv)
 *   → worship/supabase/migrations/20260710121000_seed_data.sql
 *
 * Sources (checked in under worship/data-import/):
 *   roster.xlsx           — musicians × Sundays grid (RCF)
 *   team_members.csv      — Airtable Team Members (Durham era; emails)
 *   songs.csv             — Airtable Songs (library, keys, chord links, tags)
 *   services.csv          — Airtable Services (Durham; ordered song list)
 *   service_elements.csv  — Airtable Service Elements (song + slot per service)
 *   tags.csv              — Airtable Tags
 *
 * The generated SQL is idempotent (natural-key upserts), so re-running the
 * migration or regenerating after tweaks is safe. ws_service_songs rows for
 * imported services are delete-and-reinserted on re-run.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import xlsx from 'xlsx';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'data-import');
const outFile = join(here, '..', 'supabase', 'migrations', '20260710121000_seed_data.sql');

// ── helpers ──────────────────────────────────────────────────────────────────

function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  // drop fully-empty trailing rows
  while (rows.length && rows[rows.length - 1].every((c) => c.trim() === '')) rows.pop();
  const header = rows.shift();
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

const q = (s) => (s === null || s === undefined || s === '' ? 'null' : `'${String(s).replace(/'/g, "''")}'`);
const qArr = (arr) => `array[${arr.map((s) => q(s)).join(', ')}]::text[]`;

function usDate(s) {
  // "1/5/2023" → "2023-01-05"
  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

function isoFromExcel(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return null;
}

// ── roster cell normalization ────────────────────────────────────────────────
// Returns { status, role, note } — role names must match ws_roles seeds.
function normalizeCell(raw) {
  const t = String(raw).replace(/\s+/g, ' ').trim();
  const l = t.toLowerCase();
  if (!t) return null;

  const roleMap = {
    'lead': 'Lead',
    'leading - guitar': 'Lead',
    'vocals': 'Vocals',
    'guitar': 'Acoustic Guitar',
    'acoustic': 'Acoustic Guitar',
    'acoustic guitar': 'Acoustic Guitar',
    'electric': 'Electric Guitar',
    'electric guitar': 'Electric Guitar',
    'keys': 'Keys',
    'bass': 'Bass',
    'drums': 'Drums',
    'mando': 'Mandolin',
    'mandolin': 'Mandolin',
    'dulcimer': 'Dulcimer',
    'cello': 'Cello',
    'violin': 'Violin',
    'sound': 'Sound',
    'sound tech': 'Sound',
    'nursery': 'Nursery',
  };
  if (roleMap[l]) {
    const note = roleMap[l].toLowerCase().includes(l) || l.includes(roleMap[l].toLowerCase()) || ['mando', 'acoustic', 'electric', 'guitar', 'sound tech', 'leading - guitar'].includes(l)
      ? null : t;
    return { status: 'assigned', role: roleMap[l], note };
  }
  // violin/mandolin combos (various spellings)
  if (/^violin?e?\s*\/\s*man/.test(l)) return { status: 'assigned', role: 'Violin', note: t };
  if (/nursery/.test(l)) return { status: 'assigned', role: 'Nursery', note: t };
  if (/^vocals\b/.test(l)) return { status: 'assigned', role: 'Vocals', note: t };
  if (/^drums\b/.test(l)) return { status: 'assigned', role: 'Drums', note: t };

  if (['gone', 'unavailable', 'unavilable', 'sick'].includes(l)) return { status: 'unavailable', role: null, note: null };
  if (['maybe', 'tentative', 'gone?'].includes(l)) return { status: 'tentative', role: null, note: t === 'Gone?' ? t : null };
  if (['available', 'here', 'morning & evening'].includes(l)) return { status: 'available', role: null, note: l === 'available' || l === 'here' ? null : t };

  if (/gone|unavail|out of town/.test(l)) return { status: 'unavailable', role: null, note: t };
  // anything else: keep the raw text so nothing is lost
  return { status: 'tentative', role: null, note: t };
}

// ── load roster ──────────────────────────────────────────────────────────────

const wb = xlsx.readFile(join(dataDir, 'roster.xlsx'), { cellDates: true });
const sheet = wb.Sheets['Sheet1'];
const grid = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: true });

const DATE_ROW = 1;   // 0-indexed (spreadsheet row 2)
const NOTE_ROW = 3;   // spreadsheet row 4 ("2nd Sun", "Communion", …)
const FIRST_PERSON_ROW = 4; // spreadsheet row 5
const COL_INSTRUMENTS = 1, COL_FIRST = 2, COL_LAST = 3, COL_PHONE = 4;
const FIRST_DATE_COL = 5;

const dateCols = [];
for (let c = FIRST_DATE_COL; c < (grid[DATE_ROW] || []).length; c++) {
  const iso = isoFromExcel(grid[DATE_ROW][c]);
  if (iso) dateCols.push({ col: c, date: iso });
}

// Week header notes → service notes / special
const weekMeta = {};
for (const { col, date } of dateCols) {
  const raw = grid[NOTE_ROW]?.[col];
  if (!raw) continue;
  const lines = String(raw).split('\n').map((s) => s.trim()).filter(Boolean)
    .filter((s) => !/^\d(st|nd|rd|th) sun/i.test(s));
  if (!lines.length) continue;
  const note = lines.join('; ');
  weekMeta[date] = {
    special: /easter/i.test(note) ? 'Easter' : null,
    notes: note,
  };
}

// People rows (until the aggregation row, which has no first name)
const rosterPeople = [];
for (let r = FIRST_PERSON_ROW; r < grid.length; r++) {
  const first = grid[r]?.[COL_FIRST];
  if (!first || !String(first).trim()) continue;
  const cells = {};
  let anyAssignment = false;
  for (const { col, date } of dateCols) {
    const v = grid[r][col];
    if (v === null || String(v).trim() === '') continue;
    const norm = normalizeCell(v);
    if (!norm) continue;
    cells[date] = norm;
    if (norm.status === 'assigned') anyAssignment = true;
  }
  const phoneRaw = grid[r][COL_PHONE];
  const phone = phoneRaw ? String(phoneRaw).replace(/\.0$/, '').replace(/\D/g, '') : null;
  rosterPeople.push({
    row: r + 1,
    firstName: String(first).trim(),
    lastName: grid[r][COL_LAST] ? String(grid[r][COL_LAST]).trim() : '',
    instrumentsRaw: grid[r][COL_INSTRUMENTS] ? String(grid[r][COL_INSTRUMENTS]).trim() : '',
    phone: phone || null,
    cells,
    anyAssignment,
  });
}

// Display names: known identities first, then disambiguate duplicates.
// Spreadsheet row numbers are stable in this snapshot (verified against the
// uploaded file); aliases marry the roster rows to Airtable's fuller names.
const displayOverrides = {
  8: 'Matt Brown',          // Leader, guitar, vocals — matches Airtable Team Members
  20: 'Matt (Cello)',       // second Matt, cellist
  21: 'Jenn Daniels Neal',  // roster says "Jenn Daniels"
  22: 'J. Tingle',          // roster says "J."
  35: 'Maggie Sauvageau',   // first/last reversed in the sheet
};
const seen = new Map();
for (const p of rosterPeople) {
  let name = displayOverrides[p.row] || [p.firstName, p.lastName].filter(Boolean).join(' ');
  if (seen.has(name)) name = `${name} (${p.instrumentsRaw.split(',')[0].trim() || 'row ' + p.row})`;
  seen.set(name, true);
  p.displayName = name;
  if (displayOverrides[p.row] === 'Maggie Sauvageau') { p.lastName = 'Sauvageau'; p.firstName = 'Maggie'; }
  if (displayOverrides[p.row] === 'Matt Brown') p.lastName = 'Brown';
  if (displayOverrides[p.row] === 'J. Tingle') p.lastName = 'Tingle';
  if (displayOverrides[p.row] === 'Jenn Daniels Neal') p.lastName = 'Neal';
}

// ── load Airtable CSVs ───────────────────────────────────────────────────────

const teamMembers = parseCsv(readFileSync(join(dataDir, 'team_members.csv'), 'utf8'));
const songsCsv = parseCsv(readFileSync(join(dataDir, 'songs.csv'), 'utf8'));
const servicesCsv = parseCsv(readFileSync(join(dataDir, 'services.csv'), 'utf8'));
const elementsCsv = parseCsv(readFileSync(join(dataDir, 'service_elements.csv'), 'utf8'));
const tagsCsv = parseCsv(readFileSync(join(dataDir, 'tags.csv'), 'utf8'));

// Merge Airtable team members into people (email etc.)
const peopleByDisplay = new Map(rosterPeople.map((p) => [p.displayName, p]));
for (const tm of teamMembers) {
  const name = tm['Name']?.trim();
  if (!name) continue;
  const existing = peopleByDisplay.get(name);
  if (existing) {
    existing.email = tm['Email'] || existing.email || null;
    existing.canLead = /yes/i.test(tm['Able to/Wants to Lead?'] || '') || undefined;
    existing.location = tm['Primary Location'] || null;
    if (!existing.instrumentsRaw && tm['Instruments']) existing.instrumentsRaw = tm['Instruments'];
  } else {
    peopleByDisplay.set(name, {
      firstName: tm['First Name'] || name.split(' ')[0],
      lastName: tm['Last Name'] || '',
      displayName: name,
      email: tm['Email'] || null,
      phone: (tm['Phone Number'] || '').replace(/\D/g, '') || null,
      instrumentsRaw: tm['Instruments'] || '',
      canLead: /yes/i.test(tm['Able to/Wants to Lead?'] || ''),
      location: tm['Primary Location'] || null,
      cells: {},
      anyAssignment: false,
    });
  }
}

const people = [...peopleByDisplay.values()];
for (const p of people) {
  p.instruments = p.instrumentsRaw
    ? p.instrumentsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  if (p.canLead === undefined) p.canLead = p.instruments.some((i) => /lead/i.test(i));
  // People with no assignment history and no phone are stale roster rows.
  p.active = p.anyAssignment || !!p.phone || !!p.email;
}

// ── songs / tags ─────────────────────────────────────────────────────────────

const SKIP_TITLES = new Set(['', 'glora', 'not wa', 'Unnamed record']);
const songs = [];
for (const s of songsCsv) {
  const title = (s['Title'] || '').trim();
  if (SKIP_TITLES.has(title)) continue;
  const links = [];
  const urlText = s['Link to Chord Sheets'] || '';
  const urls = [...new Set(urlText.split(/\s+/).filter((u) => /^https?:\/\//.test(u)))];
  urls.forEach((url, i) => {
    let label = 'Chords';
    if (/\/drive\/folders\//.test(url)) label = 'Folder (multiple keys)';
    else if (urls.length > 1) label = `Chords ${i + 1}`;
    links.push({ url, label, sort: i });
  });
  songs.push({
    title,
    mainKey: (s['Main Key'] || '').trim() || null,
    season: (s['Season'] || '').trim() || 'General',
    notes: (s['Notes'] || '').trim() || null,
    tags: (s['Tags'] || '').split(',').map((t) => t.trim()).filter(Boolean),
    links,
  });
}
const tagNames = [...new Set([
  ...tagsCsv.map((t) => (t['Name'] || '').trim()).filter(Boolean),
  ...songs.flatMap((s) => s.tags),
])];

// ── services ─────────────────────────────────────────────────────────────────
// Airtable (Durham era) + roster columns (RCF), kept apart by location.

const services = new Map(); // key: date|time|location
function serviceKey(date, time, location) { return `${date}|${time}|${location}`; }

for (const svc of servicesCsv) {
  const date = usDate(svc['Date']);
  if (!date) continue; // "#ERROR!" rows
  const location = (svc['Location'] || '').trim() || 'Durham';
  const time = (svc['Time/Special'] || '').trim();
  const timeLabel = time && !/easter/i.test(time) ? time : 'AM';
  const special = /easter/i.test(time) ? 'Easter' : null;
  const songOrder = (svc['Service Elements'] || '')
    .split(',').map((s) => s.trim())
    .filter((s) => s && !SKIP_TITLES.has(s));
  services.set(serviceKey(date, timeLabel, location), {
    date, timeLabel, location, special,
    leader: (svc['Leader'] || '').trim() || null,
    practiceTime: (svc['Practice Time'] || '').trim() || null,
    notes: (svc['Notes'] || '').trim() || null,
    airtableName: (svc['Name'] || '').trim(),
    songOrder,
    assignments: [],
  });
}

// slot lookup: airtable service name + song title → slot
const slotByServiceSong = new Map();
for (const el of elementsCsv) {
  const svcName = (el['Service'] || '').trim();
  const song = (el['Song'] || '').trim();
  const slot = (el['Order'] || '').trim();
  if (svcName && song && slot) slotByServiceSong.set(`${svcName}|${song}`, slot);
}

for (const { date } of dateCols) {
  const key = serviceKey(date, 'AM', 'RCF');
  const meta = weekMeta[date] || {};
  services.set(key, {
    date, timeLabel: 'AM', location: 'RCF',
    special: meta.special || null,
    leader: null, practiceTime: null,
    notes: meta.notes || null,
    airtableName: null, songOrder: [],
    assignments: [],
  });
}

// roster assignments → the RCF service rows; leader = the Lead assignee
for (const p of rosterPeople) {
  for (const [date, cell] of Object.entries(p.cells)) {
    const svc = services.get(serviceKey(date, 'AM', 'RCF'));
    if (!svc) continue;
    svc.assignments.push({ person: p.displayName, ...cell });
    if (cell.status === 'assigned' && cell.role === 'Lead' && !svc.leader) svc.leader = p.displayName;
  }
}

// ── emit SQL ─────────────────────────────────────────────────────────────────

const out = [];
out.push('-- Generated by worship/scripts/import-data.mjs — do not edit by hand.');
out.push('-- Idempotent seed of people, songs, services, assignments from the');
out.push('-- Google Sheet roster and Airtable exports in worship/data-import/.');
out.push('');
out.push('begin;');
out.push('');

out.push('-- people');
for (const p of people) {
  out.push(
    `insert into public.ws_people (first_name, last_name, display_name, email, phone, instruments, can_lead, location, active)\n` +
    `values (${q(p.firstName)}, ${q(p.lastName || '')}, ${q(p.displayName)}, ${q(p.email || null)}, ${q(p.phone || null)}, ${qArr(p.instruments)}, ${p.canLead}, ${q(p.location || null)}, ${p.active})\n` +
    `on conflict (display_name) do update set\n` +
    `  email = coalesce(excluded.email, ws_people.email),\n` +
    `  phone = coalesce(excluded.phone, ws_people.phone),\n` +
    `  instruments = excluded.instruments,\n` +
    `  can_lead = excluded.can_lead,\n` +
    `  active = excluded.active;`
  );
}
out.push('');

out.push('-- tags');
for (const t of tagNames) {
  out.push(`insert into public.ws_tags (name) values (${q(t)}) on conflict (name) do nothing;`);
}
out.push('');

out.push('-- songs, links, song-tags');
for (const s of songs) {
  out.push(
    `insert into public.ws_songs (title, main_key, season, notes)\n` +
    `values (${q(s.title)}, ${q(s.mainKey)}, ${q(s.season)}, ${q(s.notes)})\n` +
    `on conflict (title) do update set main_key = excluded.main_key, season = excluded.season;`
  );
  for (const l of s.links) {
    out.push(
      `insert into public.ws_song_links (song_id, url, label, sort_order)\n` +
      `select id, ${q(l.url)}, ${q(l.label)}, ${l.sort} from public.ws_songs where title = ${q(s.title)}\n` +
      `on conflict (song_id, url) do update set label = excluded.label, sort_order = excluded.sort_order;`
    );
  }
  for (const t of s.tags) {
    out.push(
      `insert into public.ws_song_tags (song_id, tag_id)\n` +
      `select s.id, t.id from public.ws_songs s, public.ws_tags t where s.title = ${q(s.title)} and t.name = ${q(t)}\n` +
      `on conflict do nothing;`
    );
  }
}
out.push('');

out.push('-- services');
for (const svc of services.values()) {
  out.push(
    `insert into public.ws_services (service_date, time_label, location, special, leader_id, practice_time, notes)\n` +
    `values (${q(svc.date)}, ${q(svc.timeLabel)}, ${q(svc.location)}, ${q(svc.special)}, ` +
    `(select id from public.ws_people where display_name = ${q(svc.leader)}), ${q(svc.practiceTime)}, ${q(svc.notes)})\n` +
    `on conflict (service_date, time_label, location) do update set\n` +
    `  special = excluded.special, leader_id = excluded.leader_id,\n` +
    `  practice_time = excluded.practice_time, notes = excluded.notes;`
  );
}
out.push('');

out.push('-- assignments (roster cells)');
for (const svc of services.values()) {
  for (const a of svc.assignments) {
    out.push(
      `insert into public.ws_assignments (service_id, person_id, role_id, status, note)\n` +
      `select sv.id, p.id, ${a.role ? `(select id from public.ws_roles where name = ${q(a.role)})` : 'null'}, ${q(a.status)}, ${q(a.note)}\n` +
      `from public.ws_services sv, public.ws_people p\n` +
      `where sv.service_date = ${q(svc.date)} and sv.time_label = ${q(svc.timeLabel)} and sv.location = ${q(svc.location)}\n` +
      `  and p.display_name = ${q(a.person)}\n` +
      `on conflict (service_id, person_id) do update set role_id = excluded.role_id, status = excluded.status, note = excluded.note;`
    );
  }
}
out.push('');

out.push('-- service songs (delete-and-reinsert for imported services keeps re-runs clean)');
for (const svc of services.values()) {
  if (!svc.songOrder.length) continue;
  const where = `service_date = ${q(svc.date)} and time_label = ${q(svc.timeLabel)} and location = ${q(svc.location)}`;
  out.push(`delete from public.ws_service_songs where service_id in (select id from public.ws_services where ${where});`);
  svc.songOrder.forEach((title, i) => {
    const slot = slotByServiceSong.get(`${svc.airtableName}|${title}`) || null;
    out.push(
      `insert into public.ws_service_songs (service_id, song_id, slot, sort_order)\n` +
      `select sv.id, s.id, ${q(slot)}, ${i} from public.ws_services sv, public.ws_songs s\n` +
      `where ${where.replace(/service_date/g, 'sv.service_date').replace(/time_label/g, 'sv.time_label').replace(/location/g, 'sv.location')} and s.title = ${q(title)};`
    );
  });
}
out.push('');
out.push('commit;');
out.push('');

writeFileSync(outFile, out.join('\n'));

// ── report ───────────────────────────────────────────────────────────────────
const nAssign = [...services.values()].reduce((n, s) => n + s.assignments.length, 0);
const nSvcSongs = [...services.values()].reduce((n, s) => n + s.songOrder.length, 0);
console.log(`people:          ${people.length} (${people.filter((p) => p.active).length} active)`);
console.log(`songs:           ${songs.length}`);
console.log(`song links:      ${songs.reduce((n, s) => n + s.links.length, 0)}`);
console.log(`tags:            ${tagNames.length}`);
console.log(`services:        ${services.size} (RCF ${[...services.values()].filter((s) => s.location === 'RCF').length}, other ${[...services.values()].filter((s) => s.location !== 'RCF').length})`);
console.log(`assignments:     ${nAssign}`);
console.log(`service songs:   ${nSvcSongs}`);
console.log(`wrote ${outFile}`);

// spot check: 2026-07-12 should match the spreadsheet
const spot = services.get('2026-07-12|AM|RCF');
console.log('\nspot check 2026-07-12:',
  spot.assignments.filter((a) => a.status === 'assigned').map((a) => `${a.person}=${a.role}`).join(', '));
