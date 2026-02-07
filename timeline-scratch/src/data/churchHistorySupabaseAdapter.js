/**
 * Supabase data adapter for the Church History Timeline.
 * Fetches data from CH_ tables and transforms it into
 * the same format as churchHistoryData.js exports.
 */
import { createClient } from '@supabase/supabase-js';

// ── Supabase client ───────────────────────────────────────────────────────

let supabaseClient = null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;

  // Try fetching config from Cloudflare Pages Function first,
  // then fall back to a local config script.
  let url = '';
  let key = '';

  try {
    const res = await fetch('/api/supabase-config');
    if (res.ok) {
      const script = await res.text();
      // Config script sets window.SUPABASE_URL and window.SUPABASE_ANON_KEY
      const fn = new Function(script);
      fn();
    }
  } catch {
    // Try local config
    try {
      const res = await fetch('/supabase-config.js');
      if (res.ok) {
        const script = await res.text();
        const fn = new Function(script);
        fn();
      }
    } catch {
      // ignore
    }
  }

  url = window.SUPABASE_URL || '';
  key = window.SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    throw new Error('Supabase configuration not found. Check /api/supabase-config or supabase-config.js');
  }

  supabaseClient = createClient(url, key);
  return supabaseClient;
}

// ── Color maps (same as JSON version) ─────────────────────────────────────

const colorMap = {
  person: '#5b7ee8',
  council: '#4caf50',
  emperor: '#d32f2f',
  document: '#f9a825',
  event: '#ff6f00'
};

// Colors for emperor/monarch types by empire/location
const monarchColorMap = {
  'roman-unified':  '#9C27B0', // Purple
  'roman-western':  '#C62828', // Red
  'roman-eastern':  '#1565C0', // Blue
  'frankish':       '#F57F17', // Amber/Gold
  'hre':            '#E65100', // Deep Orange
  'english':        '#00695C', // Teal
  'spanish':        '#AD1457', // Pink/Maroon
  'french':         '#283593', // Indigo
  'russian':        '#4E342E', // Brown
};

const shapeMap = {
  council: 'cross',
  document: 'book',
  event: 'reference'
};

// ── Date helpers ──────────────────────────────────────────────────────────

function formatReignYears(startYear, endYear) {
  if (startYear === null || endYear === null) return '';

  const startIsBC = startYear < 0;
  const endIsBC = endYear < 0;
  const hasBC = startIsBC || endIsBC;

  const formatYear = (year, forceEra = false) => {
    if (year < 0) return `${Math.abs(year)} BC`;
    if (forceEra) return `${year} AD`;
    return `${year}`;
  };

  const startStr = formatYear(startYear, hasBC && !startIsBC);
  const endStr = formatYear(endYear, hasBC && !endIsBC);
  return `Reigned ${startStr}-${endStr}`;
}

// ── Data fetching ─────────────────────────────────────────────────────────

export async function fetchChurchHistoryData() {
  const supabase = await getSupabase();

  // Fetch all tables in parallel
  const [
    { data: eras, error: erasErr },
    { data: people, error: peopleErr },
    { data: events, error: eventsErr },
    { data: connections, error: connErr },
    { data: sources, error: srcErr },
    { data: sourceFigures, error: sfErr },
    { data: works, error: worksErr },
  ] = await Promise.all([
    supabase.from('CH_Eras').select('*').order('start_year'),
    supabase.from('CH_People').select('*').order('birth_year'),
    supabase.from('CH_Events').select('*').order('event_date'),
    supabase.from('CH_Connections').select('*'),
    supabase.from('CH_Sources').select('*'),
    supabase.from('CH_Source_Figures').select('*'),
    supabase.from('CH_Works').select('*').order('person_id'),
  ]);

  const errors = [erasErr, peopleErr, eventsErr, connErr, srcErr, sfErr, worksErr].filter(Boolean);
  if (errors.length) {
    throw new Error(`Supabase fetch errors: ${errors.map(e => e.message).join('; ')}`);
  }

  // CH_EventConnections may not exist yet — fetch separately and swallow errors
  let eventConnections = [];
  const ecResult = await supabase.from('CH_EventConnections').select('*');
  if (!ecResult.error) {
    eventConnections = ecResult.data || [];
  }

  return transformToTimelineFormat(
    eras || [],
    people || [],
    events || [],
    connections || [],
    sources || [],
    sourceFigures || [],
    works || [],
    eventConnections
  );
}

// ── Transform Supabase data → Timeline component format ──────────────────

function transformToTimelineFormat(eras, dbPeople, dbEvents, dbConnections, dbSources, dbSourceFigures, dbWorks, dbEventConnections) {
  // Build era color map from DB
  const eraColorMap = {};
  eras.forEach(era => {
    if (era.color) eraColorMap[era.era_id] = era.color;
  });

  // Build era info map
  const eraInfoMap = {};
  eras.forEach(era => {
    eraInfoMap[era.era_id] = { name: era.name, start: era.start_year, end: era.end_year };
  });

  // Build connection map (person_id → array of connected person ids)
  const connectionMap = new Map();
  dbConnections.forEach(conn => {
    const add = (from, to, type) => {
      if (!connectionMap.has(from)) connectionMap.set(from, []);
      const entries = connectionMap.get(from);
      if (!entries.some(e => e.id === to && e.type === type)) {
        entries.push({ id: to, type: conn.connection_type || 'known' });
      }
    };
    add(conn.person_id_1, conn.person_id_2, conn.connection_type);
    add(conn.person_id_2, conn.person_id_1, conn.connection_type);
  });

  // Build source map (person_id → array of sources)
  const sourceMap = new Map();
  const sourceById = new Map();
  dbSources.forEach(s => sourceById.set(s.source_id, s));
  dbSourceFigures.forEach(sf => {
    const src = sourceById.get(sf.source_id);
    if (!src) return;
    const key = sf.person_id || sf.event_id;
    if (!key) return;
    if (!sourceMap.has(key)) sourceMap.set(key, []);
    const entries = sourceMap.get(key);
    // Avoid duplicates
    if (!entries.some(e => e.id === src.source_id)) {
      entries.push({
        id: src.source_id,
        source: src.source_name,
        title: src.title,
        year: src.year,
        url: src.url,
        notes: src.notes
      });
    }
  });

  // Build works map (person_id → array of works)
  const worksMap = new Map();
  dbWorks.forEach(w => {
    if (!w.person_id) return;
    if (!worksMap.has(w.person_id)) worksMap.set(w.person_id, []);
    worksMap.get(w.person_id).push({
      name: w.name,
      textUrl: w.text_url
    });
  });

  // Build event-person connections map (event_id → array of person_ids)
  const eventConnectionMap = new Map();
  (dbEventConnections || []).forEach(ec => {
    if (!ec.event_id || !ec.person_id) return;
    if (!eventConnectionMap.has(ec.event_id)) eventConnectionMap.set(ec.event_id, []);
    eventConnectionMap.get(ec.event_id).push(ec.person_id);
  });

  // Helper: determine era for a date
  function getEraForBirthYear(year) {
    if (year < 100) return 'era-apostolic';
    if (year < 325) return 'era-ante-nicene';
    if (year < 451) return 'era-first-four-councils';
    if (year < 1000) return 'era-monks-missionaries';
    if (year < 1300) return 'era-scholastics';
    if (year < 1500) return 'era-proto-reformers';
    if (year < 1650) return 'era-reformers';
    return 'era-dissent-discovery';
  }

  // ── Transform people ──────────────────────────────────────────────────
  const timelinePeople = [];

  dbPeople.forEach(p => {
    if (p.is_emperor) {
      // Emperor/monarch - below timeline, colored by monarch_type
      const reignPreview = formatReignYears(p.birth_year, p.death_year);
      const emperorColor = (p.monarch_type && monarchColorMap[p.monarch_type])
        || colorMap.emperor;
      timelinePeople.push({
        id: p.person_id,
        name: p.name,
        startDate: p.birth_date,
        endDate: p.death_date,
        dateCertainty: 'year only',
        periodId: 'roman-emperors',
        preview: reignPreview,
        color: emperorColor,
        aboveTimeline: false,
        isEmperor: true,
        location: p.location,
        description: p.description || null,
        monarchType: p.monarch_type || null,
        referenceUrl: p.reference_url || null
      });
    } else {
      // Regular person - above timeline
      const eraId = p.era_id || getEraForBirthYear(p.birth_year);
      const eraInfo = eraInfoMap[eraId] || { name: 'Unknown Era' };
      timelinePeople.push({
        id: p.person_id,
        name: p.name,
        startDate: p.birth_date,
        endDate: p.death_date,
        dateCertainty: 'year only',
        periodId: eraId,
        periodName: eraInfo.name,
        preview: p.name,
        color: eraColorMap[eraId] || '#5b7ee8',
        aboveTimeline: true,
        location: p.location,
        description: p.description || null,
        connections: connectionMap.get(p.person_id) || [],
        sources: sourceMap.get(p.person_id) || [],
        works: worksMap.get(p.person_id) || [],
        referenceUrl: p.reference_url || null
      });
    }
  });

  // ── Transform events → points ─────────────────────────────────────────
  const timelinePoints = [];

  dbEvents.forEach(ev => {
    timelinePoints.push({
      id: ev.event_id,
      name: ev.name,
      date: ev.event_date,
      endDate: ev.end_date || null,
      dateCertainty: 'year only',
      shape: shapeMap[ev.event_type] || 'circle',
      color: colorMap[ev.event_type] || '#888888',
      preview: ev.name,
      aboveTimeline: ev.event_type !== 'document',
      itemType: ev.event_type === 'council' ? 'councils' : ev.event_type === 'document' ? 'documents' : 'events',
      location: ev.location,
      description: ev.description || null,
      referenceUrl: ev.reference_url || null,
      connectedPeople: eventConnectionMap.get(ev.event_id) || [],
      sources: sourceMap.get(ev.event_id) || []
    });
  });

  // ── Transform eras → periods ──────────────────────────────────────────
  const timelinePeriods = [];

  eras.forEach(era => {
    // Convert year integers to ISO date strings for the Timeline component
    const startDate = era.start_year >= 0
      ? `${String(era.start_year).padStart(4, '0')}-01-01`
      : `-${String(Math.abs(era.start_year)).padStart(4, '0')}-01-01`;
    const endDate = era.end_year >= 0
      ? `${String(era.end_year).padStart(4, '0')}-01-01`
      : `-${String(Math.abs(era.end_year)).padStart(4, '0')}-01-01`;

    timelinePeriods.push({
      id: era.era_id,
      name: era.name,
      startDate,
      endDate,
      dateCertainty: 'year only',
      color: era.color || '#00acc1',
      preview: era.name,
      // Cluniac reforms go below; all others above
      aboveTimeline: era.era_id !== 'era-cluniac-reforms',
      referenceUrl: era.reference_url || null
    });
  });

  return {
    data: {
      people: timelinePeople,
      points: timelinePoints,
      periods: timelinePeriods
    },
    // Provide raw tables for potential table-view usage
    raw: {
      eras,
      people: dbPeople,
      events: dbEvents,
      connections: dbConnections,
      sources: dbSources,
      sourceFigures: dbSourceFigures,
      works: dbWorks
    }
  };
}
